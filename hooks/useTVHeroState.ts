import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTVHeroStateProps {
  trailers: any[];
  isDesktop: boolean;
  scrollThreshold?: number;
  scrollThrottleDelay?: number;
}

export const useTVHeroState = ({
  trailers,
  isDesktop,
  scrollThreshold = 300,
  scrollThrottleDelay = 200,
}: UseTVHeroStateProps) => {
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