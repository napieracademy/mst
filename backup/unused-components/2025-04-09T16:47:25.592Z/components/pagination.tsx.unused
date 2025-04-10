"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname()

  return (
    <div className="flex justify-center mt-8">
      <nav className="inline-flex">
        <Link
          href={`${pathname}?page=${currentPage - 1}`}
          className={`px-4 py-2 border rounded-l-md ${
            currentPage <= 1
              ? "bg-gray-100 text-gray-400 pointer-events-none"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
          aria-disabled={currentPage <= 1}
        >
          Previous
        </Link>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={`${pathname}?page=${page}`}
            className={`px-4 py-2 border-t border-b ${
              currentPage === page ? "bg-blue-600 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
            }`}
          >
            {page}
          </Link>
        ))}

        <Link
          href={`${pathname}?page=${currentPage + 1}`}
          className={`px-4 py-2 border rounded-r-md ${
            currentPage >= totalPages
              ? "bg-gray-100 text-gray-400 pointer-events-none"
              : "bg-white text-blue-600 hover:bg-blue-50"
          }`}
          aria-disabled={currentPage >= totalPages}
        >
          Next
        </Link>
      </nav>
    </div>
  )
}

