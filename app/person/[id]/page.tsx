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

    // Verifica se profile_path è valido (deve esistere e iniziare con /)
    const hasValidProfilePath = person.profile_path && 
      typeof person.profile_path === 'string' && 
      person.profile_path.startsWith('/');
    
    const profileImage = hasValidProfilePath
      ? `https://image.tmdb.org/t/p/w780${person.profile_path}`
      : "/placeholder-person.jpg"
    
    // Log per debug dell'immagine
    console.log("Person profile image info:", {
      personId: id,
      profilePath: person.profile_path,
      hasValidPath: hasValidProfilePath,
      finalImageUrl: profileImage
    });
    
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

    // Identifica il ruolo principale (directing, acting, ecc)
    const primaryRole = person.known_for_department || "Cinema"

    return (
      <main className="min-h-screen bg-black text-white">
        <Header />

        <div className="relative w-full bg-gradient-to-b from-gray-900 to-black">
          {/* Hero section con dimensioni ottimizzate */}
          <div className="h-[300px] md:h-[400px] relative">
            {/* Immagine di sfondo sfocata - solo se disponibile */}
            {hasValidProfilePath && (
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
          </div>
          
          {/* Avatar e informazioni - centrati e meglio posizionati */}
          <div className="relative max-w-7xl mx-auto px-2 sm:px-4 flex flex-col items-center -mt-[100px] md:-mt-[120px]">
            {/* Avatar centrato */}
            <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] rounded-full overflow-hidden border-4 border-gray-800 shadow-2xl mx-auto mb-6">
              {hasValidProfilePath ? (
                <Image
                  src={profileImage}
                  alt={person.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-7xl font-bold">
                  {person.name.charAt(0)}
                </div>
              )}
            </div>
            
            {/* Informazioni principali - centrate */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{person.name}</h1>
              
              <div className="text-xl text-yellow-400 font-medium mb-3">{primaryRole}</div>
              
              <div className="text-gray-300 flex flex-wrap justify-center gap-x-6 gap-y-2">
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
        
        {/* Contenuto principale con migliore spaziatura */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
          {/* Biografia */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Biografia</h2>
            <div className="bg-gray-900/30 rounded-lg p-4">
              <EditableBio 
                initialBio={person.biography || "Nessuna biografia disponibile."} 
              />
            </div>
            
            <div className="mt-4 text-gray-400 text-sm text-center">
              <p>Doppio click per modificare la biografia</p>
            </div>
          </div>
          
          {/* Tabs di navigazione della filmografia */}
          <div className="mt-8">
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

