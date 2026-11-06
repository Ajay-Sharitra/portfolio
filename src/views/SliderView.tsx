import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Project } from '../data/projects';

interface SliderViewProps {
  project: Project;
  onOpenProject: (project: Project) => void;
  onHoverProject: (hovering: boolean) => void;
}

export default function SliderView({
  project,
  onOpenProject,
  onHoverProject,
}: SliderViewProps) {
  const titleContainerRef = useRef<HTMLDivElement>(null);
  const metaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Staggered masked reveal of title lines
    const titleLines = titleContainerRef.current?.querySelectorAll('.line-mid');
    const metaLine = metaContainerRef.current?.querySelector('.line-mid');

    if (titleLines && titleLines.length > 0) {
      gsap.fromTo(
        titleLines,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.06,
          overwrite: true,
        }
      );
    }

    if (metaLine) {
      gsap.fromTo(
        metaLine,
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'expo.out',
          delay: 0.15,
          overwrite: true,
        }
      );
    }
  }, [project.id]);

  return (
    <div
      onClick={() => onOpenProject(project)}
      onMouseEnter={() => onHoverProject(true)}
      onMouseLeave={() => onHoverProject(false)}
      className="fixed inset-0 z-20 flex flex-col justify-center items-center cursor-pointer select-none"
    >
      {/* Category / Sub-meta */}
      <div
        ref={metaContainerRef}
        className="blend mono text-[calc(10*var(--px))] md:text-[calc(11*var(--px))] tracking-widest uppercase mb-[calc(12*var(--px))] overflow-hidden"
      >
        <span className="line">
          <span className="line-mid inline-flex items-center gap-2">
            <span>{project.category}</span>
            <span className="opacity-40">·</span>
            <span>{project.year}</span>
            {project.badge && (
              <>
                <span className="opacity-40">·</span>
                <span className="text-[#cee49f] opacity-90">{project.badge}</span>
              </>
            )}
          </span>
        </span>
      </div>

      {/* Massive Project Title with line masking */}
      <div
        ref={titleContainerRef}
        className="blend text-center px-4"
        style={{ letterSpacing: '-0.04em' }}
      >
        {project.titleLines.map((lineText, idx) => (
          <div key={idx} className="line leading-[0.82] overflow-hidden">
            <h1 className="line-mid font-sans-bold text-[calc(90*var(--px))] sm:text-[calc(112*var(--px))] md:text-[calc(132*var(--px))] uppercase">
              {lineText}
            </h1>
          </div>
        ))}
      </div>

      {/* Sub-summary hint */}
      <div className="blend mono text-[calc(10*var(--px))] opacity-50 tracking-wider mt-[calc(16*var(--px))] uppercase text-center max-w-md px-4">
        {project.summary}
      </div>

      {/* Mobile-friendly tap indicator */}
      <div className="mt-6 md:hidden px-4 py-1.5 rounded-[2px] bg-[#cee49f] text-[#0b0b0b] font-mono-medium text-xs uppercase tracking-wider">
        Tap to View Case Study
      </div>
    </div>
  );
}
