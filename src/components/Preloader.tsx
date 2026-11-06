import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const counterObj = { val: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        // Exit animation
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 1.1,
            ease: 'power4.inOut',
            onComplete,
          });
        } else {
          onComplete();
        }
      },
    });

    tl.to(counterObj, {
      val: 100,
      duration: 1.8,
      ease: 'power2.inOut',
      onUpdate: () => {
        setPercent(Math.round(counterObj.val));
      },
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#0b0b0b] flex flex-col justify-between p-[calc(24*var(--px))] text-[#cee49f] select-none"
    >
      {/* Top Header in preloader */}
      <div className="flex justify-between items-center text-[calc(11*var(--px))] font-mono-medium tracking-widest uppercase opacity-60">
        <span>AJAY SHARITRA .B</span>
        <span>INITIALIZING EXPERIENCE</span>
      </div>

      {/* Center Big Percentage */}
      <div className="text-center">
        <div
          ref={numberRef}
          className="font-sans-bold text-[calc(140*var(--px))] md:text-[calc(180*var(--px))] leading-none tracking-tighter"
        >
          {percent}%
        </div>
        <div className="font-mono-medium text-[calc(11*var(--px))] uppercase tracking-widest opacity-60 mt-4">
          TIRUNELVELI, TAMIL NADU · 2026
        </div>
      </div>

      {/* Bottom status */}
      <div className="flex justify-between items-center text-[calc(10*var(--px))] font-mono-medium tracking-widest uppercase opacity-40">
        <span>SOFTWARE · NETWORKS · SYSTEMS</span>
        <div className="w-[calc(120*var(--px))] h-[2px] bg-[#cee49f]/20 overflow-hidden rounded">
          <div
            className="h-full bg-[#cee49f] transition-all duration-100 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
