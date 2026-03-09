"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Unknown error"

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>
          {decodeURIComponent(error)}
        </AlertDescription>
      </Alert>
      <Button asChild>
        <Link href="/auth/signin">Back to Sign In</Link>
      </Button>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
           