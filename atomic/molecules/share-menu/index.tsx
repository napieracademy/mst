'use client';

import { cn } from '@/atomic/utils/cn';
import { Button } from '@/atomic/atoms/button';
import { Container } from '@/atomic/atoms/container';
import { Text } from '@/atomic/atoms/text';
import { Share2, Facebook, Twitter, MessageCircle, Send } from 'lucide-react';

interface ShareMenuProps {
  title: string;
  url: string;
  onClose: () => void;
}

export function ShareMenu({ title, url, onClose }: ShareMenuProps) {
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // TODO: Aggiungere feedback visivo
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Container variant="narrow" className="bg-black/90 rounded-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <Text variant="h4" className="text-white">
            Condividi
          </Text>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            ✕
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Button
            variant="secondary"
            size="lg"
            className="flex flex-col items-center gap-2"
            onClick={() => window.open(shareLinks.facebook, '_blank')}
          >
            <Facebook className="w-6 h-6" />
            <span>Facebook</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="flex flex-col items-center gap-2"
            onClick={() => window.open(shareLinks.twitter, '_blank')}
          >
            <Twitter className="w-6 h-6" />
            <span>Twitter</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="flex flex-col items-center gap-2"
            onClick={() => window.open(shareLinks.whatsapp, '_blank')}
          >
            <MessageCircle className="w-6 h-6" />
            <span>WhatsApp</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="flex flex-col items-center gap-2"
            onClick={() => window.open(shareLinks.telegram, '_blank')}
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
            Copia link
          </Button>
        </div>
      </Container>
    </div>
  );
} 