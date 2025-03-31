export interface Movie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date?: string
  first_air_date?: string
  vote_average: number
  popularity: number
  media_type?: string
  runtime?: number
  episode_run_time?: number[]
  number_of_seasons?: number
  number_of_episodes?: number
  genres?: { id: number; name: string }[]
  tagline?: string
  original_language?: string
  production_countries?: { iso_3166_1: string; name: string }[]
  production_companies?: { id: number; name: string; logo_path: string | null }[]
  credits?: {
    cast: {
      id: number
      name: string
      character: string
      profile_path: string | null
    }[]
    crew: {
      id: number
      name: string
      job: string
      profile_path?: string | null
    }[]
  }
  videos?: {
    results: {
      key: string
      name: string
      site: string
    }[]
  }
  recommendations?: {
    results: Movie[]
  }
  similar?: {
    results: Movie[]
  }
}

export interface Post {
  slug: string
  title: string
  date: string
  author: string
  excerpt: string
  content: string
  coverImage: string
}

