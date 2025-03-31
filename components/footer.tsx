import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12 border-t border-gray-800">
      <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Info legali */}
        <div>
          <h3 className="text-white font-medium mb-4">Info legali</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Termini di utilizzo
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Collegamenti */}
        <div>
          <h3 className="text-white font-medium mb-4">Collegamenti</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Film
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Serie TV
              </Link>
            </li>
          </ul>
        </div>

        {/* Scopri */}
        <div>
          <h3 className="text-white font-medium mb-4">Scopri</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Nuove uscite
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Classici
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Presto al cinema
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-white font-medium mb-4">Social</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Facebook
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Twitter
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-white transition-colors">
                Instagram
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* TMDB Attribution */}
      <div className="max-w-[1100px] mx-auto px-4 mt-12 pt-6 border-t border-gray-800">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-[#01b4e4] font-bold mr-2">TMDB</span>
            <span className="text-xs">
              Data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
            </span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[1100px] mx-auto px-4 mt-8 pt-6 border-t border-gray-800 text-xs flex flex-col md:flex-row justify-between items-center">
        <div>© {new Date().getFullYear()} MastroiAnni. Tutti i diritti riservati.</div>
        <div className="mt-2 md:mt-0 flex items-center">
          Realizzato con <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" /> in Italia
        </div>
      </div>
    </footer>
  )
}

