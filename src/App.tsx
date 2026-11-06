import React, { useState } from 'react';
import { PROJECTS, Project } from './data/projects';
import Navigation, { ViewMode, ModalTab } from './components/Navigation';
import Clock from './components/Clock';
import Stepper from './components/Stepper';
import Ruler from './components/Ruler';
import CustomCursor from './components/CustomCursor';
import Preloader from './components/Preloader';
import ProjectOverlay from './components/ProjectOverlay';
import ProfileOverlay from './components/ProfileOverlay';
import ConnectOverlay from './components/ConnectOverlay';
import SliderView from './views/SliderView';
import GalleryView from './views/GalleryView';
import WebGLSlideCanvas from './graphics/WebGLSlideCanvas';
import WebGLOrbitCanvas from './graphics/WebGLOrbitCanvas';
import { useSlideController } from './hooks/useSlideController';

export default function App() {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [currentView, setCurrentView] = useState<ViewMode>('slider');
  const [activeModal, setActiveModal] = useState<ModalTab>('none');
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<Project | null>(null);
  const [isHoveringProject, setIsHoveringProject] = useState(false);
  const [cursorLabel, setCursorLabel] = useState('VIEW CASE');

  // Change project index with previous index tracking
  const handleIndexChange = (newIndex: number) => {
    if (newIndex === currentIndex) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(newIndex);
  };

  // Keyboard, wheel, and touch gestures
  useSlideController({
    total: PROJECTS.length,
    currentIndex,
    onIndexChange: handleIndexChange,
    currentView,
    onViewChange: (mode) => {
      setCurrentView(mode);
      if (mode === 'orbit') {
        setCursorLabel('DRAG ORBIT');
      } else {
        setCursorLabel('VIEW CASE');
      }
    },
    isEnabled: isPreloaded && !selectedCaseStudy && activeModal === 'none',
  });

  const currentProject = PROJECTS[currentIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0b0b] text-[#cee49f]">
      {/* 1. Initial Launch Preloader */}
      {!isPreloaded && (
        <Preloader onComplete={() => setIsPreloaded(true)} />
      )}

      {/* 2. Physics-Based Custom Cursor */}
      <CustomCursor
        label={cursorLabel}
        isHoveringProject={isHoveringProject}
      />

      {/* 3. Background WebGL Shaders & 3D Orbit */}
      {/* Slide mode background displacement canvas */}
      <div className={`transition-opacity duration-700 ${currentView === 'slider' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <WebGLSlideCanvas
          projects={PROJECTS}
          currentIndex={currentIndex}
          prevIndex={prevIndex}
          isTransitioning={false}
        />
      </div>

      {/* Orbit 3D canvas (Mode 03) */}
      {currentView === 'orbit' && (
        <WebGLOrbitCanvas
          projects={PROJECTS}
          currentIndex={currentIndex}
          onSelectProject={handleIndexChange}
          onOpenProject={(proj) => setSelectedCaseStudy(proj)}
          onHoverCard={(hovering) => {
            setIsHoveringProject(hovering);
            setCursorLabel(hovering ? 'OPEN CASE' : 'DRAG ORBIT');
          }}
        />
      )}

      {/* 4. Fixed System UI Shell */}
      <Navigation
        currentView={currentView}
        onSelectView={(mode) => {
          setCurrentView(mode);
          if (mode === 'orbit') setCursorLabel('DRAG ORBIT');
          else setCursorLabel('VIEW CASE');
        }}
        activeModal={activeModal}
        onOpenModal={(tab) => setActiveModal(tab)}
        projectCount={PROJECTS.length}
      />

      <Clock />

      {/* Bottom Stepper & Ruler controls */}
      {currentView === 'slider' && (
        <Stepper
          currentIndex={currentIndex}
          total={PROJECTS.length}
          onSelect={handleIndexChange}
        />
      )}

      {currentView === 'gallery' && (
        <Ruler
          currentIndex={currentIndex}
          total={PROJECTS.length}
          onSelect={handleIndexChange}
        />
      )}

      {/* 5. Main Content Views */}
      {currentView === 'slider' && (
        <SliderView
          project={currentProject}
          onOpenProject={(proj) => setSelectedCaseStudy(proj)}
          onHoverProject={(hovering) => {
            setIsHoveringProject(hovering);
            setCursorLabel('VIEW CASE');
          }}
        />
      )}

      {currentView === 'gallery' && (
        <GalleryView
          projects={PROJECTS}
          currentIndex={currentIndex}
          onSelectProject={handleIndexChange}
          onOpenProject={(proj) => setSelectedCaseStudy(proj)}
          onHoverProject={(hovering) => {
            setIsHoveringProject(hovering);
            setCursorLabel('EXPLORE');
          }}
        />
      )}

      {/* 6. Overlays */}
      {/* Case Study Detail Overlay */}
      <ProjectOverlay
        project={selectedCaseStudy}
        onClose={() => setSelectedCaseStudy(null)}
      />

      {/* Profile Overlay */}
      <ProfileOverlay
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal('none')}
        onOpenConnect={() => setActiveModal('connect')}
      />

      {/* Connect Overlay */}
      <ConnectOverlay
        isOpen={activeModal === 'connect'}
        onClose={() => setActiveModal('none')}
      />
    </div>
  );
}
