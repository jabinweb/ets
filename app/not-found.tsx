import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-background px-4 text-center">
      <h1 className="text-9xl font-extrabold text-primary mb-4">404</h1>
      <p className="text-2xl font-semibold text-foreground mb-2">
        Oops! Page not found.
      </p>
      <p className="max-w-md text-slate-600 dark:text-slate-400 mb-8">
        The page you’re looking for doesn’t exist or has been moved.  
        Let’s get you back on track.
      </p>
      <Button asChild size="lg" className="px-6 py-3">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Go Home
        </Link>
      </Button>
    </div>
  )
}
