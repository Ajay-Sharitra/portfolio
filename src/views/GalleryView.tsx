import React, { useRef, useState } from 'react';
import { Project } from '../data/projects';

interface GalleryViewProps {
  projects: Project[];
  currentIndex: number;
  onSelectProject: (index: number) => void;
  onOpenProject: (project: Project) => void;
  onHoverProject: (hovering: boolean) => void;
}

export default function GalleryView({
  projects,
  currentIndex,
  onSelectProject,
  onOpenProject,
  onHoverProject,
}: GalleryViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.6;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-center select-none overflow-hidden">
      {/* Top Gallery Header */}
      <div className="blend mono px-6 md:px-16 mb-6 flex justify-between items-center text-[calc(10*var(--px))] uppercase opacity-60">
        <span>PROJECT GALLERY (0{projects.length})</span>
        <span className="hidden sm:inline">DRAG OR USE ARROW KEYS TO BROWSE</span>
      </div>

      {/* Horizontal Cards Strip */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex gap-[calc(24*var(--px))] px-6 md:px-16 overflow-x-auto custom-scrollbar pb-8 cursor-grab active:cursor-grabbing snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {projects.map((project, index) => {
          const isSelected = index === currentIndex;
          return (
            <div
              key={project.id}
              onClick={() => {
                onSelectProject(index);
                onOpenProject(project);
              }}
              onMouseEnter={() => onHoverProject(true)}
              onMouseLeave={() => onHoverProject(false)}
              className={`shrink-0 snap-center w-[280px] sm:w-[360px] md:w-[440px] transition-all duration-300 group cursor-pointer ${
                isSelected ? 'scale-100 opacity-100' : 'scale-95 opacity-60 hover:opacity-90'
              }`}
            >
              {/* Card Media Container */}
              <div className="relative aspect-[16/10] bg-[#141414] border border-[#cee49f]/20 group-hover:border-[#cee49f] rounded-[2px] overflow-hidden transition-colors duration-300">
                <img
                  src={project.cover}
                  alt={project.titleLines.join(' ')}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/90 via-transparent to-black/30 pointer-events-none" />

                {/* Corner ID */}
                <div className="blend mono absolute top-3 left-3 text-[10px] tracking-widest px-2 py-0.5 bg-[#0b0b0b]/80 border border-[#cee49f]/30 rounded">
                  0{index + 1}
                </div>

                {/* Status Badge */}
                {project.badge && (
                  <div className="blend mono absolute top-3 right-3 text-[10px] tracking-widest px-2 py-0.5 bg-[#cee49f] text-[#0b0b0b] font-bold rounded-[2px]">
                    {project.badge}
                  </div>
                )}

                {/* Card Title on media */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-sans-bold text-xl md:text-2xl uppercase tracking-tight text-[#cee49f]">
                    {project.titleLines.join(' ')}
                  </h3>
                  <p className="font-mono-medium text-[10px] uppercase text-[#cee49f]/75 tracking-wider mt-1 truncate">
                    {project.category} · {project.year}
                  </p>
                </div>
              </div>

              {/* Summary line below card */}
              <div className="mt-3 text-xs text-[#cee49f]/60 font-mono-medium line-clamp-2">
                {project.summary}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
