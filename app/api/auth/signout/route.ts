import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Signed out successfully"
    })

    // Clear NextAuth cookies
    const cookiesToClear = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url'
    ]

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    return response

  } catch (error) {
    console.error("Signout error:", error)
    return NextResponse.json({
      success: false,
      error: "Signout failed"
    }, { status: 500 })
  }
}
