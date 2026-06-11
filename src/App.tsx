import VSLPlayer from "./components/VSLPlayer";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center font-sans antialiased">
      {/* 
        Mobile-First Frame & Container
        - On Mobile (default): occupies whole viewport, native-like experience.
        - On Desktop (md:): rendered inside a premium space-saving smartphone simulator container for beautiful preview.
      */}
      <div className="w-full min-h-screen md:min-h-[812px] md:max-h-[850px] md:w-[375px] bg-white md:rounded-[48px] md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] md:border-[10px] md:border-neutral-900 flex flex-col relative overflow-hidden transition-all duration-300">
        
        {/* Status Bar / Notch mockup on desktop */}
        <div className="hidden md:flex justify-between items-center px-6 pt-3 pb-2 text-[10px] font-semibold text-neutral-400 select-none z-30">
          <span>09:41</span>
          <div className="w-24 h-4 bg-neutral-900 rounded-full absolute left-1/2 -translate-x-1/2 top-2"></div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-2 bg-neutral-300 rounded-2xs"></span>
          </div>
        </div>

        {/* Content Container - Flex items-center to neatly fit vertically */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 relative">
          
          {/* Headline / Título */}
          <h1 className="text-xl font-extrabold text-neutral-900 text-center uppercase tracking-tight leading-snug mb-2">
            Revolução Digital 2026
          </h1>

          {/* Subtitle / Subtítulo */}
          <p className="text-xs text-neutral-500 font-medium text-center leading-relaxed max-w-[280px] mb-8">
            Assista à apresentação especial em formato vertical sobre captação e escala de leads qualificados.
          </p>

          {/* Optimized Portrait VSL Player (Occupies exactly 80% width) */}
          <div className="w-[80%] mx-auto relative transition-all duration-300">
            <VSLPlayer videoId="K65rE1bHIaM" isPortrait={true} />
          </div>

        </div>

        {/* Home Indicator Bar on desktop */}
        <div className="hidden md:flex pb-2 pt-1 w-full justify-center select-none z-30">
          <div className="w-24 h-1 bg-neutral-200 rounded-full"></div>
        </div>

      </div>
    </div>
  );
}
