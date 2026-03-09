"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'

interface SchoolSettings {
  schoolName: string
  schoolShortName: string
  schoolDescription: string | null
  schoolEmail: string | null
  schoolPhone: string | null
  schoolAddress: string | null
}

export function Footer() {
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: 'Evangelical Theological Seminary',
    schoolShortName: 'ETS',
    schoolDescription: 'An Institute of Asian Christian Academy of India',
    schoolEmail: 'ets@acaindia.org',
    schoolPhone: '+91 9876543210',
    schoolAddress: 'Hosur, Tamil Nadu, India'
  })

  useEffect(() => {
    fetch('/api/school/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings({
            schoolName: data.data.schoolName,
            schoolShortName: data.data.schoolShortName,
            schoolDescription: data.data.schoolDescription,
            schoolEmail: data.data.schoolEmail,
            schoolPhone: data.data.schoolPhone,
            schoolAddress: data.data.schoolAddress
          })
        }
      })
      .catch(err => console.error('Failed to fetch school settings:', err))
  }, [])

  const linkClasses = "text-white/60 hover:text-[#C9A84C] transition-colors duration-300 text-sm"

  return (
    <footer className="bg-[#0A0C28] relative overflow-hidden">
      {/* Top accent */}
      <div className="h-[2px] bg-gradient-to-r from-[#981b1e] via-[#C9A84C] to-[#981b1e]" />

      <div className="container mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo & Info */}
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-1.5">
                <Image src="/ets_logo.png" alt="ETS Logo" width={36} height={36} className="object-contain" />
              </div>
              <div>
                <div className="text-white font-black text-base">ETS</div>
                <div className="text-[#C9A84C] text-[9px] font-semibold tracking-[0.15em] uppercase">Seminary</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              {settings.schoolDescription}
            </p>
            <div className="flex items-start gap-2 text-white/60 text-sm">
              <MapPin className="h-4 w-4 text-[#981b1e] flex-shrink-0 mt-0.5" />
              <span>{settings.schoolAddress}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-white text-xs font-bold tracking-[0.15em] uppercase mb-5">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className={linkClasses}>About Us</Link></li>
              <li><Link href="/programs" className={linkClasses}>Programs</Link></li>
              <li><Link href="/faculty" className={linkClasses}>Faculty</Link></li>
            </ul>
          </div>

          {/* Admissions */}
          <div className="md:col-span-2">
            <h4 className="text-white text-xs font-bold tracking-[0.15em] uppercase mb-5">Admissions</h4>
            <ul className="space-y-3">
              <li><Link href="/admissions/apply" className={linkClasses}>Apply Now</Link></li>
              <li><Link href="/fee-structure" className={linkClasses}>Tuition & Fees</Link></li>
              <li><Link href="/admissions/financial-aid" className={linkClasses}>Financial Aid</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h4 className="text-white text-xs font-bold tracking-[0.15em] uppercase mb-5">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/auth/signin" className={linkClasses}>Student Portal</Link></li>
              <li><Link href="/auth/signin" className={linkClasses}>Faculty Portal</Link></li>
              <li><Link href="#" className={linkClasses}>Library</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="text-white text-xs font-bold tracking-[0.15em] uppercase mb-5">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className={linkClasses}>Privacy Policy</Link></li>
              <li><Link href="/terms-of-use" className={linkClasses}>Terms of Use</Link></li>
              <li><Link href="/accessibility" className={linkClasses}>Accessibility</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 mt-12 pt-6">
          <div className="text-center text-white/40 text-xs">
            © 2026 {settings.schoolName}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
