"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from 'next/link'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Users,
  Send
} from 'lucide-react'

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [magicLinkEmail, setMagicLinkEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false)
  const [error, setError] = useState('')
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const { status } = useSession()
  const { toast } = useToast()

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl)
      router.refresh()
    }
  }, [status, router, callbackUrl])

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    )
  }

  // Don't render signin form if already authenticated
  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg mb-4">You are already signed in!</p>
          <Button onClick={() => router.push(callbackUrl)}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const demoAccounts = [
    { role: "Admin", email: "admin@school.com", description: "Full system access" },
    { role: "Teacher", email: "teacher@school.com", description: "Classroom & grade management" },
    { role: "Student", email: "student@aca.edu", description: "Seminary student portal access" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const toastId = toast.loading("Signing you in...")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password", {
          description: "Please check your credentials and try again."
        })
        toast.dismiss(toastId)
        setError("Invalid email or password. Please check your credentials and try again.")
      } else if (result?.ok) {
        toast.success("Welcome back!", {
          description: "You have been signed in successfully."
        })
        toast.dismiss(toastId)
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("Something went wrong", {
        description: "An error occurred. Please try again."
      })
      toast.dismiss(toastId)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    const toastId = toast.loading("Connecting to Google...")
    
    try {
      await signIn("google", { callbackUrl })
    } catch {
      toast.error("Google sign-in failed", {
        description: "Failed to sign in with Google. Please try again."
      })
      toast.dismiss(toastId)
      setError("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("password123")
    setShowDemoAccounts(false)
    setError('')
    
    toast.info("Demo credentials loaded", {
      description: `Ready to sign in as ${demoEmail.split('@')[0]}`
    })
  }

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn("nodemailer", {
        email: magicLinkEmail,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        toast.error("Failed to send magic link", {
          description: "Please check your email and try again."
        })
        setError("Failed to send magic link. Please try again.")
      } else {
        setIsMagicLinkSent(true)
        toast.success("Magic link sent!", {
          description: "Check your email for the sign-in link."
        })
      }
    } catch (error) {
      console.error("Magic link error:", error)
      toast.error("Something went wrong", {
        description: "An error occurred. Please try again."
      })
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value)
    if (field === 'password') setPassword(value)
    if (field === 'magicLinkEmail') setMagicLinkEmail(value)
    if (error) setError('') // Clear error when user starts typing
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Choose your preferred sign-in method
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Tabs for Password and Magic Link */}
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          </TabsList>

          {/* Password Sign In */}
          <TabsContent value="password">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Magic Link Sign In */}
          <TabsContent value="magic-link">
            {isMagicLinkSent ? (
              <Alert>
                <Send className="h-4 w-4" />
                <AlertDescription>
                  Check your email! We&apos;ve sent you a magic link to sign in.
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsMagicLinkSent(false)
                        setMagicLinkEmail("")
                      }}
                    >
                      Send another link
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="you@example.com"
                      value={magicLinkEmail}
                      onChange={(e) => handleInputChange('magicLinkEmail', e.target.value)}
                      disabled={isLoading}
                      required
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send you a magic link to sign in without a password
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        {/* Sign Up Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}
