import React from "react";

export const TitleFrame = (): JSX.Element => {
  return (
    <header className="inline-flex flex-col items-center gap-2.5 relative max-w-7xl mx-auto px-8">
      <div className="relative w-full">
        <h1 className="text-center [font-family:'Sora',Helvetica] font-normal text-transparent">
          <span className="font-semibold text-[#4baa94] font-heading-sorabold-5 text-[72px] leading-[72px]">
            FEEL
          </span>
          <span className="font-semibold text-[#2f3e46] font-heading-sorabold-5 text-[72px] leading-[72px]">
            ORA
          </span>
          <span className="font-heading-sora-1 text-[#4f378b] text-[36px] leading-[40px] block">
            Therapie, die mit dir mitfühlt.
          </span>
        </h1>
      </div>
      <p className="relative w-full text-center text-body-large font-normal mt-6">
        <span className="text-[#2f3e46] text-h3 text-[36px] leading-[32px]">
          Feelora verknüpft persönliche Begleitung mit smarter Technologie:
          Finde die passende Therapeutin – und erhalte tägliche Unterstützung
          durch unseren Mood Tracker, der zwischen den Sitzungen für dich da
          ist.
        </span>
      </p>
    </header>
  );
};
