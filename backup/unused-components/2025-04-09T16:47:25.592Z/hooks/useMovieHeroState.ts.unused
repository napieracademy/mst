import { useState, useEffect, useRef, useCallback } from 'react';

interface UseMovieHeroStateProps {
  trailers: any[];
  isDesktop: boolean;
  scrollThreshold?: number;
  scrollThrottleDelay?: number;
}

export const useMovieHeroState = ({
  trailers,
  isDesktop,
  scrollThreshold = 300,
  scrollThrottleDelay = 200,
}: UseMovieHeroStateProps) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isPipTrailerActive, setIsPipTrailerActive] = useState(false);
  const [userScrolledPastThreshold, setUserScrolledPastThreshold] = useState(false);
  const [hasPipBeenShown, setHasPipBeenShown] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(true);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);

  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useRef(false);
  const hasBatteryInfo = useRef(false);
  const isSavingBattery = useRef(false);
  const isConnectionSlow = useRef(false);

  // Determina se il PIP dovrebbe essere attivato in base alle condizioni
  const shouldEnablePip = useCallback(() => {
    return !(
      prefersReducedMotion.current || 
      (hasBatteryInfo.current && isSavingBattery.current) || 
      isConnectionSlow.current || 
      !isDesktop
    );
  }, [isDesktop]);

  // Verifica preferenze di motion e stato della batteria
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        isConnectionSlow.current = conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';
      }
    }

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        hasBatteryInfo.current = true;
        isSavingBattery.current = battery.level <= 0.20;
      }).catch(() => {
        hasBatteryInfo.current = false;
      });
    }
  }, []);

  // Gestisce lo scroll con throttling
  useEffect(() => {
    const handleScrollThrottled = () => {
      if (scrollTimerRef.current !== null) return;
      
      scrollTimerRef.current = setTimeout(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const hasScrolledPastThreshold = scrollY > scrollThreshold;
        
        if (hasScrolledPastThreshold !== userScrolledPastThreshold) {
          setUserScrolledPastThreshold(hasScrolledPastThreshold);
          setShowActionButtons(!hasScrolledPastThreshold);
          
          if (hasScrolledPastThreshold && 
              trailers && 
              trailers.length > 0 && 
              !isTrailerOpen && 
              !hasPipBeenShown && 
              shouldEnablePip()) {
            setIsPipTrailerActive(true);
            setHasPipBeenShown(true);
          } else if (!hasScrolledPastThreshold) {
            setIsPipTrailerActive(false);
          }
        }
        
        scrollTimerRef.current = null;
      }, scrollThrottleDelay);
    };

    window.addEventListener('scroll', handleScrollThrottled);
    return () => window.removeEventListener('scroll', handleScrollThrottled);
  }, [userScrolledPastThreshold, trailers, isTrailerOpen, hasPipBeenShown, shouldEnablePip, scrollThreshold, scrollThrottleDelay]);

  // Toggle functions
  const toggleFavorite = () => setIsFavorite(!isFavorite);
  const toggleNotify = () => setIsNotifying(!isNotifying);

  return {
    isTrailerOpen,
    setIsTrailerOpen,
    isPipTrailerActive,
    setIsPipTrailerActive,
    userScrolledPastThreshold,
    showActionButtons,
    isShareMenuOpen,
    setIsShareMenuOpen,
    isFavorite,
    toggleFavorite,
    isNotifying,
    toggleNotify,
  };
}; 