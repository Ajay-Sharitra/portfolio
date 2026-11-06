import { useEffect, useRef } from 'react';
import { ViewMode } from '../components/Navigation';

interface UseSlideControllerOptions {
  total: number;
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isEnabled: boolean;
}

export function useSlideController({
  total,
  currentIndex,
  onIndexChange,
  currentView,
  onViewChange,
  isEnabled,
}: UseSlideControllerOptions) {
  const isThrottledRef = useRef(false);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (!isEnabled) return;

    // Helper for modulo wrap
    const navigate = (direction: 1 | -1) => {
      if (isThrottledRef.current) return;
      isThrottledRef.current = true;

      const next = ((currentIndex + direction) % total + total) % total;
      onIndexChange(next);

      setTimeout(() => {
        isThrottledRef.current = false;
      }, 750);
    };

    // 1. Wheel scroll
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 25) return;
      if (currentView === 'gallery') return; // Let gallery handle horizontal scroll
      if (currentView === 'orbit') return; // Orbit handles drag

      if (e.deltaY > 0) {
        navigate(1);
      } else {
        navigate(-1);
      }
    };

    // 2. Keyboard Navigation
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(-1);
      } else if (e.key === '1') {
        onViewChange('slider');
      } else if (e.key === '2') {
        onViewChange('gallery');
      } else if (e.key === '3') {
        onViewChange('orbit');
      }
    };

    // 3. Touch Swipe
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (currentView === 'gallery') return;

      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;

      // Vertical or horizontal swipe threshold
      if (Math.abs(deltaY) > 50 || Math.abs(deltaX) > 50) {
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          if (deltaY < 0) navigate(1);
          else navigate(-1);
        } else {
          if (deltaX < 0) navigate(1);
          else navigate(-1);
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [total, currentIndex, onIndexChange, currentView, onViewChange, isEnabled]);
}
