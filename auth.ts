import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { Role } from "@prisma/client"
import type { Adapter } from "next-auth/adapters"
import type { Provider } from "next-auth/providers"
import bcrypt from "bcryptjs"

// Build providers array - conditionally include Nodemailer based on runtime
const providers: Provider[] = [
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  }),
  Credentials({
    id: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      try {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user || !user.password) {
          console.log('User not found or no password set:', credentials.email)
          return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          console.log('Invalid password for user:', credentials.email)
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      } catch (error) {
        console.error('Error in authorize:', error)
        return null
      }
    }
  })
]

// Only add Nodemailer in non-edge runtime environments
// @ts-expect-error EdgeRuntime is a global in edge runtime
if (typeof EdgeRuntime === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Nodemailer = require("next-auth/providers/nodemailer").default
  providers.push(
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    })
  )
}

export const config = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.AUTH_SECRET,
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "nodemailer") {
        if (!user.email) return false
        
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { accounts: true }
          })
          
          // For magic link, user must already exist in database
          if (account?.provider === "nodemailer" && !existingUser) {
            console.log('Magic link: User not found in database:', user.email)
            return false
          }
          
          // For Google OAuth
          if (account?.provider === "google") {
            if (!existingUser) {
              // Create new user if doesn't exist
              await prisma.user.create({
                data: {
                  email: user.email,
                  name: user.name,
                  image: user.image,
                  role: Role.STUDENT, // Default role for OAuth users
                }
              })
            } else {
              // User exists - check if Google account is already linked
              const googleAccount = existingUser.accounts.find(
                acc => acc.provider === "google"
              )
              
              if (!googleAccount && account.providerAccountId) {
                // Link Google account to existing user
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type || "oauth",
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    refresh_token: account.refresh_token,
                  }
                })
                console.log('Linked Google account to existing user:', user.email)
              }
            }
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      } else if (token.email && (trigger === "signIn" || !token.role)) {
        // Fetch role from database if not in token
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { role: true, id: true }
          })
          if (dbUser) {
            token.role = dbUser.role
            token.id = dbUser.id
          }
        } catch (error) {
          console.error("Error fetching user role:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Use AUTH_URL from env if available, otherwise use baseUrl
      const envBaseUrl = process.env.AUTH_URL || baseUrl
      // Admin users go to admin panel, others go to dashboard
      if (url.startsWith("/")) return `${envBaseUrl}/dashboard`
      else if (new URL(url).origin === envBaseUrl) return url
      return `${envBaseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
