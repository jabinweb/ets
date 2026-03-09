"use server"

import { signOut } from "@/auth"
import { cookies } from "next/headers"

export async function logout() {
  // Clear all auth-related cookies
  const cookieStore = await cookies()
  
  const cookiesToDelete = [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'authjs.csrf-token',
    '__Secure-authjs.csrf-token',
    'authjs.callback-url',
    '__Secure-authjs.callback-url',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url'
  ]

  cookiesToDelete.forEach(cookieName => {
    try {
      cookieStore.delete(cookieName)
    } catch (e) {
      // Cookie might not exist, ignore
    }
  })

  // Call NextAuth signOut
  await signOut({ redirect: false })
  
  return { success: true }
}
