import Link from 'next/link'
import { Mountain } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hunter-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-hunter-700 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Mountain className="w-10 h-10 text-hunter-300" />
        </div>
        <h1 className="font-serif text-6xl text-creme-100 mb-3">404</h1>
        <h2 className="font-serif text-2xl text-hunter-300 mb-4">Trail Not Found</h2>
        <p className="text-hunter-400 mb-8 leading-relaxed">
          Looks like this trail doesn't exist — or maybe it's closed for the season. Let's get you back on the right path.
        </p>
        <Link href="/"
          className="inline-block bg-hunter-600 text-creme-50 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-hunter-500 transition-colors">
          Back to TrailWatch
        </Link>
      </div>
    </div>
  )
}
