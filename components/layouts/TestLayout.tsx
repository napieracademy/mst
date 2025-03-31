import { ReactNode } from 'react'

interface TestLayoutProps {
  children: ReactNode
  title: string
}

export default function TestLayout({ children, title }: TestLayoutProps) {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900 text-center">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  )
} 