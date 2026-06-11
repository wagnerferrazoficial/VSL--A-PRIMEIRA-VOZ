import { useEffect, useRef, useState } from "react";

interface VSLPlayerProps {
  videoId: string;
  onTimeUpdate?: (seconds: number) => void;
  isPortrait?: boolean;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

export default function VSLPlayer({ videoId, onTimeUpdate, isPortrait = false }: VSLPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasUnmuted, setHasUnmuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiReady, setApiReady] = useState(false);

  // Load YouTube Iframe API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
  }, []);

  // Initialize YT Player once API is ready
  useEffect(() => {
    if (!apiReady || !containerRef.current) return;

    // Destroys previous instance if it exists
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.error(e);
      }
    }

    const uniqueId = `yt-player-${videoId}`;
    const playerDiv = document.createElement("div");
    playerDiv.id = uniqueId;
    // Perfect scale-crop hack: 
    // We scale the iframe up slightly and make the container overflow-hidden.
    // This perfectly crops out the YouTube watermark, title, share button, and bottom controlsbar!
    playerDiv.className = "w-full h-[112%] absolute -top-[6%] bottom-[-6%] left-[-6%] right-[-6%] scale-[1.12] pointer-events-none";
    containerRef.current.appendChild(playerDiv);

    playerRef.current = new window.YT.Player(uniqueId, {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        playsinline: 1,
        autohide: 1,
      },
      events: {
        onReady: (event: any) => {
          // Attempt autoplay muted with extreme reliability
          try {
            event.target.mute();
            event.target.playVideo();
          } catch (err) {
            console.error(err);
          }
        },
        onStateChange: (event: any) => {
          // YT.PlayerState.PLAYING is 1
          if (event.data === 1) {
            setIsPlaying(true);
            setIsBuffering(false);
            setDuration(event.target.getDuration());
          } else if (event.data === 3) {
            // YT.PlayerState.BUFFERING is 3
            setIsBuffering(true);
          } else if (event.data === 2) {
            // Under normal circumstances, prevent paused state by forcing play
            try {
              event.target.playVideo();
            } catch (err) {}
          } else {
            setIsPlaying(false);
          }
        },
      },
    });

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [apiReady, videoId]);

  // Track real progress
  useEffect(() => {
    if (!isPlaying || !playerRef.current) return;

    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        const currentTime = playerRef.current.getCurrentTime();
        const videoDuration = playerRef.current.getDuration() || 1;
        const currentProgress = (currentTime / videoDuration) * 100;
        setProgress(currentProgress);
        if (onTimeUpdate) {
          onTimeUpdate(currentTime);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, onTimeUpdate]);

  const handleUnmuteClick = () => {
    if (playerRef.current && typeof playerRef.current.unMute === "function") {
      try {
        playerRef.current.unMute();
        playerRef.current.seekTo(0); // VTurb restart best-practice when unmuting
        playerRef.current.playVideo();
      } catch (err) {
        console.error(err);
      }
      setHasUnmuted(true);
    }
  };

  // Retention Strategy Math Profile:
  // - Real progress is from 0% to 50%: scale fake progress to reach 75% rapidly (factor of 1.5x)
  // - Real progress is from 50% to 100%: progress slowly increases from 75% up to 100% (factor of 0.5x)
  let perceivedProgress = 0;
  if (isPlaying) {
    if (progress <= 50) {
      perceivedProgress = progress * 1.5;
    } else {
      perceivedProgress = 75 + (progress - 50) * 0.5;
    }
  }
  // Clamp boundaries safely between 0 and 100
  perceivedProgress = Math.min(100, Math.max(0, perceivedProgress));

  // Only show the live streaming iframe once it is playing.
  // This avoids any red play buttons or black screens.
  const isVideoFullyActive = isPlaying && hasUnmuted;

  return (
    <div className={`relative w-full ${isPortrait ? "aspect-[9/16]" : "aspect-video"} bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-900/40 select-none`}>
      
      {/* 
        Container of the player div. We keep overflow hidden to act as a crop mask for the scaled iframe.
        We keep opacity 0 while transitioning to avoid any system flickering.
      */}
      <div 
        ref={containerRef} 
        className={`w-full h-full overflow-hidden transition-all duration-700 ease-out ${isVideoFullyActive ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} 
      />

      {/* Buffering Indicator Overlay (Custom, zero YouTube branding) */}
      {isBuffering && isVideoFullyActive && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-10 pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* VTurb Style Block Overlay: Blinking click to unmute indicator */}
      {!isVideoFullyActive && (
        <button
          onClick={handleUnmuteClick}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-[4px] transition-all duration-300 pointer-events-auto"
          id="btn-vsl-unmute"
        >
          {/* Pulsing Speaker Wave Ring */}
          <div className="relative flex items-center justify-center p-6 bg-orange-500 rounded-full text-white shadow-xl shadow-orange-500/50 animate-bounce active:scale-95 duration-100 ease-in-out">
            <svg
              className="w-10 h-10 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <span className="absolute -inset-1 rounded-full border-2 border-orange-400 animate-ping opacity-60"></span>
          </div>

          <div className="mt-4 px-6 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-center max-w-[280px] shadow-lg">
            <p className="text-white text-xs font-bold uppercase tracking-wider animate-pulse flex items-center gap-2">
              <span>🔊</span> CLIQUE PARA ATIVAR O SOM
            </p>
          </div>
        </button>
      )}

      {/* VTurb Style Customized Progress Bar underneath (double thickness: h-6, highly visible retention orange) */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-neutral-950/90 z-15 select-none pointer-events-none border-t border-neutral-900/60">
        <div
          className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 transition-all duration-300 relative shadow-[0_0_12px_rgba(249,115,22,0.8)]"
          style={{ width: `${perceivedProgress}%` }}
        />
      </div>

      {/* Smart Watermark simulated tag (Enhances retention value) */}
      <div className="absolute top-3 left-3 bg-orange-600/90 text-[10px] font-bold text-white px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md select-none z-15 flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
        <span>Vídeo Exclusivo</span>
      </div>
    </div>
  );
}
