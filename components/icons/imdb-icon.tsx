import { SVGProps } from "react"

export function IMDbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 24"
      width="48"
      height="24"
      fill="currentColor"
      {...props}
    >
      <path d="M45.536 0H2.464A2.464 2.464 0 0 0 0 2.464v19.072A2.464 2.464 0 0 0 2.464 24h43.072A2.464 2.464 0 0 0 48 21.536V2.464A2.464 2.464 0 0 0 45.536 0ZM7 18.187h-3v-12.374h3v12.374Zm9.5 0h-2.5v-12.374h2.5v12.374Zm0-12.374 3.75 12.374h-2.5l-.75-2.812h-3l-.75 2.812h-2.5l3.75-12.374h2Zm10.5 12.374h-2.5v-8.437l-1.875 8.437h-1.875l-1.875-8.437v8.437h-2.5v-12.374h3.75l1.563 6.562 1.562-6.562h3.75v12.374Zm10.5 0h-2.5v-4.687h-3.75v4.687h-2.5v-12.374h2.5v4.688h3.75v-4.688h2.5v12.374Z" />
    </svg>
  )
} 