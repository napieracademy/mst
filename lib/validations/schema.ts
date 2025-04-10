import { z } from "zod"

// Schema per i film
export const movieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string().nullable(),
  release_date: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),
  original_language: z.string(),
  genre_ids: z.array(z.number()),
})

// Schema per le serie TV
export const tvShowSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string().nullable(),
  first_air_date: z.string().nullable(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  vote_average: z.number(),
  vote_count: z.number(),
  popularity: z.number(),
  original_language: z.string(),
  genre_ids: z.array(z.number()),
})

// Schema per le persone
export const personSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
  known_for_department: z.string(),
  popularity: z.number(),
})

// Schema per i premi
export const awardSchema = z.object({
  category: z.string(),
  isWinner: z.boolean(),
  year: z.string(),
  awardName: z.string(),
  description: z.string(),
  nominees: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      isWinner: z.boolean(),
    })
  ),
})

// Tipi derivati dagli schemi
export type Movie = z.infer<typeof movieSchema>
export type TvShow = z.infer<typeof tvShowSchema>
export type Person = z.infer<typeof personSchema>
export type Award = z.infer<typeof awardSchema> 