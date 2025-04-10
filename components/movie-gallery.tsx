"use client"

import { MovieGallery as GalleryComponent } from "@/components/gallery/movie-gallery"

// Questo componente è ora solo un wrapper per questioni di retrocompatibilità
// Mantiene la stessa interfaccia del componente originale
export function MovieGallery(props) {
  return <GalleryComponent {...props} />
}

