import Link from "next/link"
import { Heart } from "lucide-react"
import { Container } from "@/atomic/atoms/container"
import { Text } from "@/atomic/atoms/text"

export function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-12 border-t border-gray-800">
      <Container variant="default" className="max-w-[1100px] mobile-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Info legali */}
          <div className="mb-2 md:mb-0">
            <Text variant="h6" className="text-white mb-3 md:mb-4">
              Info legali
            </Text>
            <ul className="space-y-1 md:space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="hover:text-white transition-colors">
                  Termini di utilizzo
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Collegamenti */}
          <div className="mb-2 md:mb-0">
            <Text variant="h6" className="text-white mb-3 md:mb-4">
              Collegamenti
            </Text>
            <ul className="space-y-1 md:space-y-2 text-sm">
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
              <li>
                <Link href="/admin/pagine-prerenderizzate" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                  Debug Prerenderizzate
                </Link>
              </li>
            </ul>
          </div>

          {/* Scopri */}
          <div className="mb-2 md:mb-0">
            <Text variant="h6" className="text-white mb-3 md:mb-4">
              Scopri
            </Text>
            <ul className="space-y-1 md:space-y-2 text-sm">
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
          <div className="mb-2 md:mb-0">
            <Text variant="h6" className="text-white mb-3 md:mb-4">
              Social
            </Text>
            <ul className="space-y-1 md:space-y-2 text-sm">
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
        <div className="mt-6 md:mt-12 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Text className="text-[#01b4e4] font-bold mr-2">TMDB</Text>
              <Text variant="caption" className="text-xs">
                Data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
              </Text>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-gray-800 text-xs flex flex-col md:flex-row justify-between items-center">
          <Text variant="caption">© {new Date().getFullYear()} MastroiAnni. Tutti i diritti riservati.</Text>
          <div className="mt-2 md:mt-0 flex items-center">
            <Text variant="caption">
              Realizzato con <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" /> in Italia da Napier Academy
            </Text>
          </div>
        </div>
      </Container>
    </footer>
  )
}

