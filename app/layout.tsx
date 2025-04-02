import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mastroianni - Film e Serie TV",
  description: "Esplora film e serie TV con Mastroianni",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className="trancy-und">
      <body className={`${inter.className} bg-black text-white min-h-screen overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}