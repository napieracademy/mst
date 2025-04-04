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
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    console.log("Header montato, pathname:", pathname);
  }, [pathname]);

  // Rileva lo scroll per cambiare lo sfondo dell'header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Log per debugging
  useEffect(() => {
    if (pathname) {
      console.log("Renderizzando PageGenerationIndicator con pathname:", pathname);
    }
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-colors duration-300",
        isScrolled ? "bg-black" : "bg-transparent"
      )}
    >
      <Container>
        <div className="py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Text variant="h5" className="font-medium text-white">
              MastroiAnni
            </Text>
          </Link>

          <div className="flex items-center space-x-4">
            {/* Indicatore di stato della generazione */}
            {pathname && <PageGenerationIndicator pathname={pathname} />}
            
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                <Menu size={24} />
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg py-1 z-50 overflow-hidden">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/admin/statistiche-pagine"
                    className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Statistiche pagine
                  </Link>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm hover:bg-white/10 transition-colors"
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

