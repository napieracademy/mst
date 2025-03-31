import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Formatta una data nel formato italiano
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

