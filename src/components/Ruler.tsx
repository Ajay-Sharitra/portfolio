import React from 'react';

interface RulerProps {
  currentIndex: number;
  total: number;
  onSelect: (index: number) => void;
}

export default function Ruler({ currentIndex, total, onSelect }: RulerProps) {
  return (
    <div className="fixed z-30 left-1/2 -translate-x-1/2 bottom-[calc(38*var(--px))] w-[calc(260*var(--px))] h-[calc(30*var(--px))] pointer-events-auto select-none overflow-hidden hidden sm:block">
      {/* Left/Right gradient fades */}
      <div className="absolute inset-y-0 left-0 w-[calc(60*var(--px))] bg-gradient-to-r from-[#0b0b0b] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-[calc(60*var(--px))] bg-gradient-to-l from-[#0b0b0b] to-transparent z-10 pointer-events-none" />

      {/* Ticks container */}
      <div
        className="relative h-full flex items-end justify-center transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(calc(-${(currentIndex - (total - 1) / 2) * 44} * var(--px)))`,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const isCurrent = i === currentIndex;
          return (
            <div
              key={i}
              onClick={() => onSelect(i)}
              className="relative flex flex-col items-center justify-end h-full px-[calc(18*var(--px))] cursor-pointer group"
            >
              <span
                className={`mono text-[calc(9*var(--px))] mb-[calc(6*var(--px))] transition-all duration-300 ${
                  isCurrent ? 'text-[#cee49f] scale-110 font-bold' : 'text-[#cee49f] opacity-35 group-hover:opacity-80'
                }`}
              >
                0{i + 1}
              </span>
              <div
                className={`transition-all duration-300 ${
                  isCurrent
                    ? 'w-[2px] h-[calc(16*var(--px))] bg-[#cee49f]'
                    : 'w-[1px] h-[calc(7*var(--px))] bg-[#cee49f] opacity-30 group-hover:opacity-70'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
