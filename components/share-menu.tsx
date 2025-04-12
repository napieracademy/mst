"use client"

import { cn } from '@/atomic/utils/cn';
import { Button } from '@/atomic/atoms/button';
import { Container } from '@/atomic/atoms/container';
import { Text } from '@/atomic/atoms/text';
import { Share2, Facebook, Twitter, MessageCircle, Send, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Portal } from './ui/portal';

interface ShareMenuProps {
  title: string;
  url: string;
  onClose: () => void;
}

export function ShareMenu({ title, url, onClose }: ShareMenuProps) {
  const [isCopied, setIsCopied] = useState(false);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Blocca lo scroll quando il menu è aperto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Gestisce la chiusura con tasto ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <Portal zIndex={9000} id="share-menu-portal">
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <Container variant="narrow" className="bg-black/90 rounded-lg p-6 shadow-xl max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <Text variant="h4" className="text-white">
            Condividi
          </Text>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Button
            variant="secondary"
            onClick={() => window.open(shareLinks.facebook, '_blank')}
            className="flex flex-col items-center gap-2 p-4 h-auto"
          >
            <Facebook className="w-6 h-6" />
            <span>Facebook</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => window.open(shareLinks.twitter, '_blank')}
            className="flex flex-col items-center gap-2 p-4 h-auto"
          >
            <Twitter className="w-6 h-6" />
            <span>X (Twitter)</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
            className="flex flex-col items-center gap-2 p-4 h-auto"
          >
            <MessageCircle className="w-6 h-6" />
            <span>WhatsApp</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => window.open(shareLinks.telegram, '_blank')}
            className="flex flex-col items-center gap-2 p-4 h-auto"
          >
            <Send className="w-6 h-6" />
            <span>Telegram</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 bg-white/10 text-white rounded px-4 py-2"
          />
          <Button
            variant="primary"
            onClick={copyToClipboard}
          >
            {isCopied ? "Copiato!" : "Copia link"}
          </Button>
        </div>
      </Container>
      </div>
    </Portal>
  );
} 