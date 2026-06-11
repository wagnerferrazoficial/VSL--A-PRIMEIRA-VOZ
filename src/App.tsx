import VSLPlayer from "./components/VSLPlayer";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center font-sans antialiased">
      {/* 
        Container
        - Clean mobile-friendly view centering the presentation
      */}
      <div className="w-full min-h-screen md:min-h-[750px] md:max-h-[800px] md:w-[375px] bg-white md:rounded-[32px] md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] md:border border-neutral-200 flex flex-col relative overflow-hidden transition-all duration-300">
        
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

      </div>
    </div>
  );
}
