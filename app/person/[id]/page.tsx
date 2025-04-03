import { getPersonDetails } from "@/lib/tmdb"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PersonFilmography } from "@/components/person-filmography"
import { EditableBio } from "@/components/editable-bio"
import Link from "next/link"
import { generateSlug } from "@/lib/utils"

interface PersonPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PersonPageProps) {
  try {
    const id = await params.id
    const person = await getPersonDetails(id)

    if (!person) {
      return {
        title: "Attore non trovato | Mastroianni",
        description: "L'attore richiesto non è stato trovato",
      }
    }

    return {
      title: `${person.name} | Mastroianni`,
      description: person.biography || `Scopri la filmografia di ${person.name}`,
    }
  } catch (error) {
    return {
      title: "Attore non trovato | Mastroianni",
      description: "L'attore richiesto non è stato trovato",
    }
  }
}

export default async function PersonPage({ params }: PersonPageProps) {
  try {
    const id = await params.id
    
    const person = await getPersonDetails(id)
    
    if (!person) {
      notFound()
    }

    // Determina se questa persona è principalmente un regista o un attore
    const isDirector = person.known_for_department === "Directing";
    
    // Genera lo slug SEO-friendly
    const slug = generateSlug(person.name, null, id);
    
    // Reindirizza alla pagina corretta in base al ruolo
    if (isDirector) {
      redirect(`/regista/${slug}`);
    } else {
      redirect(`/attore/${slug}`);
    }
    
    // Questo codice non verrà mai eseguito a causa del redirect
    return null;
  } catch (error) {
    console.error("Error rendering person page:", error)
    throw error
  }
}

