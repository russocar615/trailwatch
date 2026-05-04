'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <html lang="en">
      <body className="min-h-screen bg-hunter-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-serif text-3xl text-creme-100 mb-3">Something went wrong</h2>
          <p className="text-hunter-400 mb-8">An unexpected error occurred. Please try again.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset}
              className="bg-hunter-600 text-creme-50 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-hunter-500 transition-colors">
              Try Again
            </button>
            <Link href="/"
              className="bg-hunter-800 text-hunter-200 px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-hunter-700 transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
