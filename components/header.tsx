"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Search } from "lucide-react"
import { createClient } from '../lib/supabase'
import { Container } from "@/atomic/atoms/container"
import { Text } from "@/atomic/atoms/text"
import { Button } from "@/atomic/atoms/button"
import { cn } from "@/atomic/utils/cn"
import { usePathname } from "next/navigation"
import { PageGenerationIndicator } from "./page-generation-indicator"
import { PreRenderizzazioneCheck } from "./prerenderizzazione-check"
import { DatabaseCounter } from "./database-counter"

const supabase = createClient()

function UserProfile() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data) {
        setUser(data.user)
      }
    }

    fetchUser()
  }, [])

  if (!user) return null

  return (
    <div className="flex items-center space-x-2">
      {user.user_metadata.avatar_url && (
        <img
          src={user.user_metadata.avatar_url}
          alt="User Avatar"
          className="w-8 h-8 rounded-full"
        />
      )}
      <span className="text-sm text-white">
        {user.user_metadata.full_name || user.email}
      </span>
    </div>
  )
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        "absolute top-0 left-0 right-0 w-full",
        "z-[9999]", // Keeps high z-index to stay above content
        "bg-transparent"
      )}
    >
      <Container maxWidth="custom" className="max-w-[1100px] mx-auto">
        <div className="py-4 flex justify-between items-center w-full">
          <Link href="/" className="flex items-center space-x-2">
            <Text variant="h5" className="font-medium text-white">
              MastroiAnni
            </Text>
          </Link>

          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              {pathname && <PageGenerationIndicator pathname={pathname} />}
              <PreRenderizzazioneCheck />
              <DatabaseCounter />
            </div>
            
            <div className="relative menu-container">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                aria-label="Menu"
              >
                <Menu size={24} className="text-white" />
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-lg rounded-lg shadow-xl py-1 z-[10000]">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/admin/statistiche-pagine"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Statistiche pagine
                  </Link>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Accedi
                  </Link>
                </div>
              )}
            </div>

            <UserProfile />
          </div>
        </div>
      </Container>
    </header>
  )
}

