import { getPersonDetails } from "@/lib/tmdb"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PersonFilmography } from "@/components/person-filmography"
import { EditableBio } from "@/components/editable-bio"
import Link from "next/link"

interface PersonPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PersonPageProps) {
  try {
    const { id } = await params
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
    const { id } = await params
    
    const person = await getPersonDetails(id)
    
    if (!person) {
      notFound()
    }
    
    const profileImage = person.profile_path
      ? `https://image.tmdb.org/t/p/w780${person.profile_path}`
      : "/placeholder-person.jpg"
    
    // Calcolo dell'età
    const calculateAge = (birthday: string) => {
      const birthDate = new Date(birthday)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return age
    }
    
    const age = person.birthday ? calculateAge(person.birthday) : null
    
    // Prepara i crediti
    const allCredits = [
      ...(person.combined_credits?.cast || []).map((credit: any) => ({
        ...credit,
        character: credit.character,
      })),
      ...(person.combined_credits?.crew || []).map((credit: any) => ({
        ...credit,
        job: credit.job,
      })),
    ]

    // Conta i film
    const movieCount = allCredits.filter(
      (credit: any) => credit.media_type === "movie" || (!credit.media_type && credit.title),
    ).length

    return (
      <main className="min-h-screen bg-black text-white">
        <Header />

        <div className="relative w-full h-[500px] bg-gradient-to-b from-gray-900 to-black">
          {/* Immagine di sfondo sfocata */}
          {person.profile_path && (
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <Image
                src={profileImage}
                alt={person.name}
                fill
                className="object-cover blur-sm"
                priority
              />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          
          <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-end pb-12">
            {/* Immagine profilo */}
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-gray-800 shadow-2xl md:translate-y-16">
              <Image
                src={profileImage}
                alt={person.name}
                width={256}
                height={256}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            
            {/* Nome e informazioni principali */}
            <div className="mt-6 md:mt-0 md:ml-8 md:mb-4">
              <h1 className="text-4xl font-bold">{person.name}</h1>
              <div className="mt-2 text-gray-300 flex flex-wrap items-center gap-x-4">
                {person.known_for_department && (
                  <span>{person.known_for_department}</span>
                )}
                {person.birthday && (
                  <span>
                    {new Date(person.birthday).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                    {age && ` (${age} anni)`}
                  </span>
                )}
                {person.place_of_birth && <span>{person.place_of_birth}</span>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Biografia */}
            <div className="w-full">
              <h2 className="text-2xl font-semibold mb-4">Biografia</h2>
              <div className="bg-gray-900/30 rounded-lg">
                <EditableBio initialBio={person.biography} />
              </div>
              
              <div className="mt-4 text-gray-400 text-sm">
                <p>Doppio click per modificare la biografia</p>
              </div>
            </div>
          </div>
          
          {/* Sezione Filmografia */}
          <div className="mt-16">
            <PersonFilmography credits={allCredits} name={person.name} />
          </div>
        </div>
        
        <Footer />
      </main>
    )
  } catch (error) {
    console.error("Error rendering person page:", error)
    throw error
  }
}

