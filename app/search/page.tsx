import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchResults } from "@/components/search-results"
import { SearchBar } from "@/components/search-bar"

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ""

  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-white">
      <Header />
      <div className="w-full max-w-[1100px] mx-auto px-4 py-8 mt-16">
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar />
        </div>
        <SearchResults query={query} />
      </div>
      <Footer />
    </main>
  )
}

