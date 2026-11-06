import React from 'react';

export type ViewMode = 'slider' | 'gallery' | 'orbit';
export type ModalTab = 'none' | 'profile' | 'connect';

interface NavigationProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  activeModal: ModalTab;
  onOpenModal: (tab: ModalTab) => void;
  projectCount: number;
}

export default function Navigation({
  currentView,
  onSelectView,
  activeModal,
  onOpenModal,
  projectCount,
}: NavigationProps) {
  return (
    <>
      {/* Top Left: Identity */}
      <div className="blend h3 corner corner--tl fixed z-40">
        <button
          onClick={() => {
            onOpenModal('none');
            onSelectView('slider');
          }}
          className="hover:opacity-75 transition-opacity text-left cursor-pointer uppercase tracking-tight"
          aria-label="Home - Ajay Sharitra"
        >
          Ajay Sharitra .B
        </button>
      </div>

      {/* Top Center: Pill Navigation */}
      <nav
        className="blend fixed z-40 left-1/2 -translate-x-1/2 top-[calc(14*var(--px))] flex items-center gap-[calc(4*var(--px))]"
        aria-label="Primary Navigation"
      >
        {/* Work Pill */}
        <button
          onClick={() => onOpenModal('none')}
          className={`pill pill--menu ${activeModal === 'none' ? 'is-active' : ''}`}
          aria-current={activeModal === 'none' ? 'page' : undefined}
        >
          <span className="flex items-center gap-[calc(2*var(--px))]">
            <span>Work</span>
            <sup className="text-[calc(6*var(--px))] mt-[calc(0.5*var(--px))] opacity-80">
              ({String(projectCount).padStart(2, '0')})
            </sup>
          </span>
          <span
            className={`w-[calc(3.5*var(--px))] h-[calc(4*var(--px))] rounded-full ${
              activeModal === 'none' ? 'bg-[#0b0b0b]' : 'bg-[#cee49f]'
            }`}
          />
        </button>

        {/* Profile Pill */}
        <button
          onClick={() => onOpenModal(activeModal === 'profile' ? 'none' : 'profile')}
          className={`pill pill--menu ${activeModal === 'profile' ? 'is-active' : ''}`}
        >
          <span>Profile</span>
          <span
            className={`w-[calc(3.5*var(--px))] h-[calc(4*var(--px))] rounded-full ${
              activeModal === 'profile' ? 'bg-[#0b0b0b]' : 'bg-[#cee49f]'
            }`}
          />
        </button>

        {/* Connect Pill */}
        <button
          onClick={() => onOpenModal(activeModal === 'connect' ? 'none' : 'connect')}
          className={`pill pill--menu ${activeModal === 'connect' ? 'is-active' : ''}`}
        >
          <span>Connect</span>
          <span
            className={`w-[calc(3.5*var(--px))] h-[calc(4*var(--px))] rounded-full ${
              activeModal === 'connect' ? 'bg-[#0b0b0b]' : 'bg-[#cee49f]'
            }`}
          />
        </button>
      </nav>

      {/* Top Right: View Switcher (01 || 02 || 03) */}
      <div className="blend h3 corner corner--tr fixed z-40 flex items-center gap-[calc(4*var(--px))]">
        <button
          onClick={() => onSelectView('slider')}
          className={`view-switch-btn ${currentView === 'slider' ? 'is-active' : 'opacity-70 hover:opacity-100'}`}
          title="Slide View (01)"
        >
          01
        </button>
        <span className="opacity-40 text-[calc(10*var(--px))] select-none">||</span>
        <button
          onClick={() => onSelectView('gallery')}
          className={`view-switch-btn ${currentView === 'gallery' ? 'is-active' : 'opacity-70 hover:opacity-100'}`}
          title="Gallery View (02)"
        >
          02
        </button>
        {/* Orbit is desktop-only per blueprint */}
        <span className="opacity-40 text-[calc(10*var(--px))] select-none hidden md:inline">||</span>
        <button
          onClick={() => onSelectView('orbit')}
          className={`view-switch-btn hidden md:inline-block ${
            currentView === 'orbit' ? 'is-active' : 'opacity-70 hover:opacity-100'
          }`}
          title="3D Orbit View (03)"
        >
          03
        </button>
      </div>

      {/* Bottom Right: Copyright */}
      <div className="blend h3 corner corner--br fixed z-40 select-none hidden md:block">
        ©2026
      </div>
    </>
  );
}
