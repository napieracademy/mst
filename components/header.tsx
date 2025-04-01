"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Search } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-black" : "bg-transparent"}`}
    >
      <div className="max-w-[1100px] mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-medium">MastroiAnni</span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/search" className="p-2 hover:text-red-500 transition-colors">
            <Search size={24} />
          </Link>

          <div className="relative">
            <button className="p-2 hover:text-red-500 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu size={24} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1 z-50">
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/search"
                  className="block px-4 py-2 text-sm hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cerca
                </Link>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Accedi
                </Link>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

