"use client"

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CommonCTA } from '@/components/layout/common-cta'
import { usePathname } from 'next/navigation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-1 ${!isHomePage ? 'pt-[74px]' : ''}`}>
        {children}
      </main>
      <CommonCTA />
      <Footer />
    </div>
  )
}

