'use client';

import { cn } from '@/atomic/utils/cn';
import { Button } from '@/atomic/atoms/button';
import { Container } from '@/atomic/atoms/container';
import { Text } from '@/atomic/atoms/text';
import { X, PictureInPicture2, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey: string;
  trailerName: string;
  initialPIP?: boolean;
  autoMute?: boolean;
}

export function TrailerModal({
  isOpen,
  onClose,
  trailerKey,
  trailerName,
  initialPIP = false,
  autoMute = false,
}: TrailerModalProps) {
  const [isMuted, setIsMuted] = useState(autoMute);
  const [isPIP, setIsPIP] = useState(initialPIP);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play();
    }
  }, [isOpen]);

  const togglePIP = async () => {
    if (!videoRef.current) return;

    try {
      if (isPIP) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
      setIsPIP(!isPIP);
    } catch (error) {
      console.error('Error toggling PIP:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <Container variant="narrow" className="relative aspect-video">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={togglePIP}
            className="bg-black/50 hover:bg-black/70"
          >
            <PictureInPicture2 className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/50 hover:bg-black/70"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&rel=0`}
          title={trailerName}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        />
      </Container>
    </div>
  );
} 