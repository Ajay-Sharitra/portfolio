import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Project } from '../data/projects';

interface ProjectOverlayProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectOverlay({ project, onClose }: ProjectOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!project) return;

    // Slide up animation
    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.65, ease: 'power4.out' }
      );
    }

    // Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-[#0b0b0b]/95 backdrop-blur-xl flex flex-col overflow-y-auto custom-scrollbar select-text"
    >
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 flex justify-between items-center px-6 md:px-16 py-6 bg-[#0b0b0b]/80 backdrop-blur-md border-b border-[#cee49f]/15">
        <div className="flex items-center gap-4">
          <span className="mono text-[calc(10*var(--px))] text-[#cee49f] opacity-60">
            CASE STUDY 0{project.id}
          </span>
          <span className="opacity-30">/</span>
          <span className="mono text-[calc(10*var(--px))] text-[#cee49f] uppercase tracking-wider">
            {project.category}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="pill flex items-center gap-2 hover:bg-[#cee49f] hover:text-[#0b0b0b] transition-colors"
          aria-label="Close case study"
        >
          <span>CLOSE</span>
          <span className="text-xs">✕</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div ref={contentRef} className="max-w-5xl mx-auto w-full px-6 md:px-12 py-10 md:py-16">
        {/* Title and Metadata */}
        <div className="mb-12">
          <div className="mono text-xs text-[#cee49f] uppercase tracking-widest mb-4 opacity-70">
            {project.year} · {project.role}
          </div>
          <h1 className="font-sans-bold text-4xl sm:text-6xl md:text-7xl uppercase text-[#cee49f] tracking-tight leading-[0.9]">
            {project.titleLines.join(' ')}
          </h1>
          <p className="font-serif-light text-xl md:text-2xl text-[#cee49f]/80 mt-6 leading-relaxed max-w-3xl">
            {project.summary}
          </p>
        </div>

        {/* Hero Cover Image */}
        <div className="relative aspect-[16/9] w-full rounded-[2px] overflow-hidden border border-[#cee49f]/20 mb-16">
          <img
            src={project.cover}
            alt={project.titleLines.join(' ')}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-8 border-y border-[#cee49f]/20 mb-16">
          {project.stats.map((stat, i) => (
            <div key={i}>
              <div className="mono text-[10px] text-[#cee49f]/50 uppercase tracking-widest">
                {stat.label}
              </div>
              <div className="font-sans-bold text-2xl md:text-3xl text-[#cee49f] mt-1">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Deep Dive Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="md:col-span-1">
            <h3 className="mono text-xs uppercase tracking-widest text-[#cee49f] opacity-60 mb-2">
              THE CONTEXT & PROBLEM
            </h3>
            <p className="font-mono-medium text-xs text-[#cee49f]/80 leading-relaxed">
              Why this system was engineered, and who it serves in Tirunelveli and beyond.
            </p>
          </div>
          <div className="md:col-span-2 text-base md:text-lg text-[#cee49f]/90 leading-relaxed font-sans font-light">
            {project.overview}
          </div>
        </div>

        {/* Engineering Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="md:col-span-1">
            <h3 className="mono text-xs uppercase tracking-widest text-[#cee49f] opacity-60 mb-2">
              SYSTEM ARCHITECTURE
            </h3>
            <p className="font-mono-medium text-xs text-[#cee49f]/80 leading-relaxed">
              Core technical highlights and capabilities implemented.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            {project.highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 bg-[#cee49f]/5 border border-[#cee49f]/15 rounded-[2px]"
              >
                <span className="mono text-[#cee49f] text-xs pt-0.5">0{idx + 1}.</span>
                <span className="text-[#cee49f] text-sm md:text-base">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack & Metadata pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 py-8 border-t border-[#cee49f]/20">
          <div>
            <div className="mono text-xs uppercase tracking-widest text-[#cee49f]/50 mb-3">
              TECHNOLOGIES
            </div>
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool, i) => (
                <span
                  key={i}
                  className="mono text-xs px-2.5 py-1 bg-[#cee49f]/10 text-[#cee49f] border border-[#cee49f]/25 rounded-[2px]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mono text-xs uppercase tracking-widest text-[#cee49f]/50 mb-3">
              SERVICES
            </div>
            <div className="space-y-1">
              {project.services.map((svc, i) => (
                <div key={i} className="text-sm text-[#cee49f]">
                  • {svc}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mono text-xs uppercase tracking-widest text-[#cee49f]/50 mb-3">
              ACTION
            </div>
            {project.externalUrl ? (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[2px] bg-[#cee49f] text-[#0b0b0b] font-mono-medium text-xs uppercase tracking-wider font-bold hover:opacity-90 transition-opacity"
              >
                <span>OPEN PROJECT LINK</span>
                <span>↗</span>
              </a>
            ) : (
              <span className="mono text-xs text-[#cee49f]/60">Under active development</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
