"use client"

import { Facebook, Twitter, MessageCircle, Send, Link } from "lucide-react"
import { useState } from "react"

interface ShareMenuProps {
  title: string
  url: string
  onClose: () => void
}

export function ShareMenu({ title, url, onClose }: ShareMenuProps) {
  const [isCopied, setIsCopied] = useState(false)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Errore durante la copia:', err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white text-center">Condividi</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Facebook className="w-6 h-6 text-blue-500" />
              <span className="text-sm text-white">Facebook</span>
            </a>

            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Twitter className="w-6 h-6 text-blue-400" />
              <span className="text-sm text-white">X (Twitter)</span>
            </a>

            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-green-500" />
              <span className="text-sm text-white">WhatsApp</span>
            </a>

            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Send className="w-6 h-6 text-blue-400" />
              <span className="text-sm text-white">Telegram</span>
            </a>
          </div>

          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <Link className="w-6 h-6 text-white" />
            <span className="text-sm text-white">
              {isCopied ? "Link copiato!" : "Copia link"}
            </span>
          </button>

          <button
            onClick={onClose}
            className="mt-2 p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm text-white">Chiudi</span>
          </button>
        </div>
      </div>
    </div>
  )
} 