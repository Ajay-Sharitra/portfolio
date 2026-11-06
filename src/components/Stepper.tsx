import React from 'react';

interface StepperProps {
  currentIndex: number;
  total: number;
  onSelect: (index: number) => void;
}

export default function Stepper({ currentIndex, total, onSelect }: StepperProps) {
  const currentPadded = String(currentIndex + 1).padStart(3, '0');
  const totalPadded = String(total).padStart(3, '0');

  return (
    <div
      className="blend fixed z-30 left-1/2 -translate-x-1/2 bottom-[calc(22*var(--px))] flex items-center gap-[calc(20*var(--px))] pointer-events-auto select-none"
      aria-label="Project stepper"
    >
      <span className="mono">{currentPadded}</span>

      {/* Steps track */}
      <div className="relative flex items-center gap-[calc(6*var(--px))] h-[calc(10*var(--px))]">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === currentIndex;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`group relative h-full flex items-center cursor-pointer px-[calc(2*var(--px))] transition-transform`}
              title={`Jump to project ${i + 1}`}
            >
              <span
                className={`block transition-all duration-300 ${
                  isActive
                    ? 'w-[calc(14*var(--px))] h-[calc(7*var(--px))] border border-[#cee49f] bg-transparent'
                    : 'w-[1px] h-[calc(6*var(--px))] bg-[#cee49f] opacity-25 group-hover:opacity-75'
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="mono">{totalPadded}</span>
    </div>
  );
}
