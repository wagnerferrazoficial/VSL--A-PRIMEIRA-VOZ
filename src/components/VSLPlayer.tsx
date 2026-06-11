import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Gauge, Maximize2, Minimize2, Play, Pause, RotateCcw } from "lucide-react";

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
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasUnmuted, setHasUnmuted] = useState(false);
  const [isPlayerPaused, setIsPlayerPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiReady, setApiReady] = useState(false);

  const hasUnmutedRef = useRef(false);
  useEffect(() => {
    hasUnmutedRef.current = hasUnmuted;
  }, [hasUnmuted]);

  // Custom Controls States
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(100);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedSelector, setShowSpeedSelector] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Handle Fullscreen state change natively across browsers
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
            setIsMuted(true);
          } catch (err) {
            console.error(err);
          }
        },
        onStateChange: (event: any) => {
          // YT.PlayerState.PLAYING is 1
          if (event.data === 1) {
            setIsPlaying(true);
            setIsBuffering(false);
            setIsPlayerPaused(false);
            setDuration(event.target.getDuration());
          } else if (event.data === 3) {
            // YT.PlayerState.BUFFERING is 3
            setIsBuffering(true);
          } else if (event.data === 2) {
            // If already unmuted and active, allow the pause!
            if (hasUnmutedRef.current) {
              setIsPlayerPaused(true);
              setIsPlaying(false);
            } else {
              // Forced autoplay background routine prior to unmute
              try {
                event.target.playVideo();
              } catch (err) {}
            }
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
        playerRef.current.setVolume(100);
        playerRef.current.seekTo(0); // VTurb restart best-practice when unmuting
        playerRef.current.playVideo();
        setIsMuted(false);
        setVolume(100);
      } catch (err) {
        console.error(err);
      }
      setHasUnmuted(true);
    }
  };

  // Custom Controls Functions
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume || 100);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setVolume(value);
    if (!playerRef.current) return;
    try {
      playerRef.current.setVolume(value);
      if (value > 0) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSpeedSelector = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSpeedSelector(!showSpeedSelector);
    setShowVolumePopup(false); // Close other popover to keep clean
  };

  const selectPlaybackRate = (rate: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    try {
      if (typeof playerRef.current.setPlaybackRate === "function") {
        playerRef.current.setPlaybackRate(rate);
      }
      setPlaybackRate(rate);
      setShowSpeedSelector(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFullscreen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerWrapperRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await playerWrapperRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error", err);
    }
  };

  const handleVideoClickOrToggle = () => {
    if (!hasUnmuted) return;
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlayerPaused(true);
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlayerPaused(false);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resumeVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!playerRef.current) return;
    try {
      playerRef.current.playVideo();
      setIsPlayerPaused(false);
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    }
  };

  const restartVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!playerRef.current) return;
    try {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
      setIsPlayerPaused(false);
      setIsPlaying(true);
      setProgress(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Retention Strategy Math Profile:
  // - Real progress is from 0% to 50%: scale fake progress to reach 75% rapidly (factor of 1.5x)
  // - Real progress is from 50% to 100%: progress slowly increases from 75% up to 100% (factor of 0.5x)
  let perceivedProgress = 0;
  if (hasUnmuted) {
    if (progress <= 50) {
      perceivedProgress = progress * 1.5;
    } else {
      perceivedProgress = 75 + (progress - 50) * 0.5;
    }
  }
  // Clamp boundaries safely between 0 and 100
  perceivedProgress = Math.min(100, Math.max(0, perceivedProgress));

  // The video becomes active once the user clicks to unmute and starts listening.
  const isVideoFullyActive = hasUnmuted;

  return (
    <div 
      ref={playerWrapperRef}
      className={`relative w-full ${isPortrait ? "aspect-[9/16]" : "aspect-video"} bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-900/40 select-none group`}
    >
      
      {/* 
        Container of the player div. We keep overflow hidden to act as a crop mask for the scaled iframe.
        We keep opacity 0 while transitioning to avoid any system flickering.
      */}
      <div 
        ref={containerRef} 
        className={`w-full h-full overflow-hidden transition-all duration-700 ease-out ${isVideoFullyActive ? "opacity-100 scale-100" : "opacity-0 scale-95"}`} 
      />

      {/* Invisible Click Overlay to catch Pause/Play taps on the video screen area (only active when unmuted and NOT buffering) */}
      {isVideoFullyActive && !isBuffering && (
        <div 
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handleVideoClickOrToggle}
        />
      )}

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
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-950/95 backdrop-blur-[4px] transition-all duration-300 pointer-events-auto cursor-pointer"
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

      {/* Paused Modal Overlay containing premium options: resume vs restart */}
      {isVideoFullyActive && isPlayerPaused && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300">
          <div className="bg-neutral-950/95 border border-neutral-800/80 p-6 rounded-2xl max-w-sm w-[90%] text-center shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Visual pause emblem */}
            <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Pause className="w-6 h-6 stroke-[2.5]" />
            </div>
            
            <h3 className="text-white text-sm font-black uppercase tracking-wider mb-1">
              Vídeo Pausado
            </h3>
            <p className="text-neutral-400 text-xs mb-5 px-3">
              Escolha uma opção para continuar assistindo à apresentação:
            </p>

            <div className="flex flex-col gap-3">
              {/* Option 1: Voltar De Onde Parou (Resume) */}
              <button
                onClick={resumeVideo}
                className="w-full h-11 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                style={{ minHeight: "44px" }}
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Voltar aonde parou</span>
              </button>

              {/* Option 2: Recomeçar do Início (Restart) */}
              <button
                onClick={restartVideo}
                className="w-full h-11 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 hover:text-white active:scale-95 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-neutral-805 flex items-center justify-center gap-2 cursor-pointer"
                style={{ minHeight: "44px" }}
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-450" />
                <span>Recomeçar do início</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrated Progress & Modern Control Bar */}
      {isVideoFullyActive && (
        <div className="absolute bottom-0 left-0 right-0 h-9 bg-neutral-950/95 border-t border-neutral-900/60 z-20 flex items-center justify-between px-3 md:px-4 select-none pointer-events-auto">
          {/* Progress fill integrated at the top edge of this Control Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900/50">
            <div
              className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 transition-all duration-300 relative shadow-[0_0_8px_rgba(249,115,22,0.6)]"
              style={{ width: `${perceivedProgress}%` }}
            />
          </div>

          {/* Left Side: Play/Pause Switch & Volume Controls */}
          <div className="flex items-center gap-2 relative z-10">
            {/* Play / Pause switcher button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVideoClickOrToggle();
              }}
              className="w-6 h-6 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm text-white rounded-lg hover:bg-neutral-800/80 active:scale-95 transition-all shadow-md focus:outline-none cursor-pointer"
              style={{ minHeight: "22px" }}
              title={isPlayerPaused ? "Iniciar vídeo" : "Pausar vídeo"}
              id="vsl-btn-play-pause-toggle"
            >
              {isPlayerPaused ? (
                <Play className="w-3 h-3 fill-white text-white" />
              ) : (
                <Pause className="w-3 h-3 text-neutral-100 stroke-[2.5]" />
              )}
            </button>

            {/* Volume Popover trigger element */}
            <div 
              className="flex items-center gap-2 relative"
              onMouseEnter={() => setShowVolumePopup(true)}
              onMouseLeave={() => setShowVolumePopup(false)}
            >
              <button
                onClick={toggleMute}
                className="w-6 h-6 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm text-white rounded-lg hover:bg-neutral-800/80 active:scale-95 transition-all shadow-md focus:outline-none cursor-pointer"
                style={{ minHeight: "22px" }}
                title={isMuted ? "Ativar som" : "Desativar som"}
                id="vsl-btn-mute-toggle"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3 h-3 text-orange-400 stroke-[2.5]" />
                ) : (
                  <Volume2 className="w-3 h-3 text-neutral-100 stroke-[2.5]" />
                )}
              </button>

              {/* Compact Slide-out Volume Control */}
              <div 
                className={`flex items-center bg-neutral-950/95 border border-neutral-800/80 px-2 py-1 rounded-md shadow-lg transition-all duration-300 absolute left-8 ${
                  showVolumePopup ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 -translate-x-2 pointer-events-none"
                }`}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <span className="text-[9px] font-mono text-neutral-400 ml-2 min-w-[20px]">
                  {isMuted ? "0%" : `${volume}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Speed Selector & Fullscreen */}
          <div className="flex items-center gap-2 relative z-10">
            {/* Speed Option Popup Panel (Occupies exactly 15% width of the video screen area) */}
            {showSpeedSelector && (
              <div 
                className="absolute right-0 bottom-11 z-30 w-[120px] bg-neutral-950/95 backdrop-blur-2xl border border-neutral-800/80 rounded-2xl p-1 shadow-2xl flex flex-col justify-between items-center transition-all animate-in fade-in slide-in-from-right-4 duration-300"
                onMouseLeave={() => setShowSpeedSelector(false)}
              >
                {/* Section title header */}
                <div className="w-full text-center py-1 border-b border-neutral-900 select-none">
                  <span className="text-[8px] font-black uppercase tracking-wider text-orange-400">
                    Velocidade
                  </span>
                </div>

                {/* List of speed choices */}
                <div className="w-full flex flex-col py-1 gap-0.5 max-h-[180px] overflow-y-auto">
                  {[
                    { label: "0.5x", value: 0.5 },
                    { label: "0.75x", value: 0.75 },
                    { label: "Normal", value: 1 },
                    { label: "1.25x", value: 1.25 },
                    { label: "1.5x", value: 1.5 },
                    { label: "2x", value: 2 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={(e) => selectPlaybackRate(opt.value, e)}
                      className={`w-full py-1.5 rounded-lg text-center flex flex-col items-center justify-center transition-all active:scale-95 duration-100 cursor-pointer ${
                        playbackRate === opt.value
                          ? "bg-orange-500 text-white font-black shadow-md"
                          : "text-neutral-400 hover:bg-neutral-900"
                      }`}
                      style={{ minHeight: "36px" }}
                    >
                      <span className="text-[10px] font-black tracking-tighter">
                        {opt.label === "Normal" ? "1.0x" : opt.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Bottom Speed Dial Indicator */}
                <div className="pb-1 text-center select-none opacity-65">
                  <Gauge className="w-3.5 h-3.5 text-neutral-500" />
                </div>
              </div>
            )}

            {/* Speed / Pace Selector Badge */}
            <button
              onClick={toggleSpeedSelector}
              className={`h-6 px-2 flex items-center gap-1 bg-neutral-900/60 backdrop-blur-sm rounded-lg text-white border transition-all duration-200 active:scale-95 shadow-md focus:outline-none cursor-pointer ${
                showSpeedSelector ? "border-orange-500/80 bg-neutral-900" : "border-neutral-800/40 hover:bg-neutral-800/80"
              }`}
              style={{ minHeight: "22px" }}
              title="Velocidade"
              id="vsl-btn-speed-toggle"
            >
              <Gauge className="w-3 h-3 text-orange-400 stroke-[2.5]" />
              <span className="text-[10px] font-black tracking-tight font-mono text-neutral-100">
                {playbackRate === 1 ? "1.0x" : `${playbackRate}x`}
              </span>
            </button>

            {/* Premium Fullscreen bracket corners toggle */}
            <button
              onClick={toggleFullscreen}
              className="w-6 h-6 flex items-center justify-center bg-neutral-900/60 backdrop-blur-sm text-white rounded-lg hover:bg-neutral-800/80 active:scale-95 transition-all shadow-md focus:outline-none cursor-pointer"
              style={{ minHeight: "22px" }}
              title="Tela Cheia"
              id="vsl-btn-fullscreen-toggle"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3 h-3 text-orange-400 stroke-[2.5]" />
              ) : (
                <Maximize2 className="w-3 h-3 text-neutral-100 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      )}


    </div>
  );
}
