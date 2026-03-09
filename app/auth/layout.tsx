"use client"

import Link from 'next/link'
import { GraduationCap, ArrowLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useEffect, useState } from 'react'

interface SchoolSettings {
  schoolShortName: string
  schoolName: string
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolShortName: 'ACA',
    schoolName: 'North India Baptist Seminary'
  })

  useEffect(() => {
    fetch('/api/school/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Failed to fetch school settings:', err))
  }, [])
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Website</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-primary">{settings.schoolShortName}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-800 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <p>© 2024 {settings.schoolName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
             