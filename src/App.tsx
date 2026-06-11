import { useState } from "react";
import { ShieldCheck, ChevronRight } from "lucide-react";
import VSLPlayer from "./components/VSLPlayer";

export default function App() {
  const [showCTA, setShowCTA] = useState(false);

  const handleTimeUpdate = (seconds: number) => {
    if (seconds >= 1000 && !showCTA) {
      setShowCTA(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-6 px-4 md:py-10 font-sans antialiased overflow-y-auto">
      {/* 
        Responsive Container
        - Adapts flawlessly: Frameless, premium centered single-column layout on all devices with a unified white background.
      */}
      <div className="w-full max-w-5xl bg-white flex flex-col relative transition-all duration-300">
        
        {/* Content Container - Centered vertical stack, perfectly optimized to occupy ~90% of screen height between text and VSL */}
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 py-2 md:px-8 relative gap-5 md:gap-7">
          
          <div className="flex flex-col items-center gap-3 md:gap-4 shrink-0">
            {/* Headline / Título (Exactly 2 lines on desktop, elevated by 40% on mobile to 21px) */}
            <h1 className="font-display text-[21px] md:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight leading-snug max-w-[340px] md:max-w-4xl uppercase">
              A maioria dos pais só percebem que perderam a influência<br className="hidden md:inline" /> sobre o filho, quando já é tarde demais.
            </h1>
   
            {/* Subtitle / Subtítulo (Exactly 2 lines on desktop, elevated by 40% on mobile to 15.5px) */}
            <p className="text-[15.5px] md:text-base lg:text-lg text-neutral-500 font-medium leading-relaxed max-w-[320px] md:max-w-5xl lg:max-w-6xl">
              Enquanto você acredita que está tudo bem, seu filho pode estar buscando orientação, validação e respostas em outros lugares.<br className="hidden md:inline" />Entenda por que isso acontece e aprenda como voltar a ser a voz que ele mais respeita e procura.
            </p>
          </div>

          {/* Optimized Portrait VSL Player in vertical alignment for all devices - scaled based on height to occupy ~90% with the text above */}
          <div className="h-[48vh] sm:h-[50vh] md:h-[53vh] lg:h-[55vh] aspect-[9/16] w-auto relative transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-neutral-100/10 shrink-0">
            <VSLPlayer videoId="K65rE1bHIaM" isPortrait={true} onTimeUpdate={handleTimeUpdate} />
          </div>

          {/* Premium Green CTA Button - Styled with vibrant colors, high-impact pulsate animation, and secure seals */}
          {showCTA && (
            <div className="w-full max-w-[350px] md:max-w-[480px] flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out z-10 mt-2">
              
              {/* Pulsing Emerald Green CTA Button */}
              <a
                href="https://pay.kiwify.com.br/5L603hT"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 md:h-16 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-[15px] md:text-lg tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all duration-300 cursor-pointer select-none"
                style={{ minHeight: "56px" }}
                id="btn-vsl-checkout-cta"
              >
                <span>ACESSAR A OFERTA AGORA</span>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white stroke-[3.5] animate-pulse" />
              </a>

              {/* Secure Payment details and guarantee tags */}
              <div className="flex items-center gap-1.5 text-[9px] md:text-xs font-bold text-emerald-600 tracking-wide select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                <span>🔒 COMPRA ATÉ 100% SEGURA • ACESSO IMEDIATO • 30 DIAS DE GARANTIA</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

