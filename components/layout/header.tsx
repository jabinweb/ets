"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Menu, X, ChevronDown } from 'lucide-react'

interface SchoolSettings {
  schoolName: string
  schoolShortName: string
  schoolTagline: string | null
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: 'Evangelical Theological Seminary',
    schoolShortName: 'ETS',
    schoolTagline: 'TEACH. PRACTICE. THE WORD'
  })

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)

    fetch('/api/school/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSettings({
            schoolName: data.data.schoolName,
            schoolShortName: data.data.schoolShortName,
            schoolTagline: data.data.schoolTagline || 'Excellence in Education'
          })
        }
      })
      .catch(err => console.error('Failed to fetch school settings:', err))

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
    }
  }, [])

  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current)
    setOpenDropdown(name)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 300)
  }

  const navigation = [
    {
      name: 'About',
      href: '/about',
      hasDropdown: true,
      dropdown: [
        { name: 'About ACA', href: '/about' },
        { name: 'Statement of Faith', href: '/about/statement-of-faith' },
        { name: 'Faith Values', href: '/about/faith-values' }
      ]
    },
    {
      name: 'Programs',
      href: '/programs',
      hasDropdown: true,
      dropdown: [
        { name: 'All Programs', href: '/programs' },
        { name: 'Faculty & Staff', href: '/faculty' },
        { name: 'ETS Life', href: '/ets-life' }
      ]
    },
    {
      name: 'Admissions',
      href: '/admissions',
      hasDropdown: true,
      dropdown: [
        { name: 'Apply Now', href: '/admissions' },
        { name: 'Fee Structure', href: '/fee-structure' },
        { name: 'Financial Aid', href: '/admissions/financial-aid' }
      ]
    },
    { name: 'Give', href: '/give' },
    { name: 'Contact', href: '/contact' },
  ]

  if (!mounted) return null

  return (
    <>
      {/* Top utility bar */}
      <div className={`w-full z-[60] transition-all duration-500 ${isScrolled ? 'fixed top-0' : 'absolute top-0'
        }`}>
        {/* Thin gold top line */}
        <div className="h-[2px] bg-gradient-to-r from-[#981b1e] via-[#C9A84C] to-[#981b1e]" />

        {/* Main header */}
        <motion.header
          className={`transition-all duration-500 border-b border-[#C9A84C]/20 ${isScrolled
            ? 'bg-[#FDFBF7] shadow-xl'
            : 'bg-[#FDFBF7]/95 backdrop-blur-md'
            }`}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <nav className="container mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center h-[72px]">
              {/* Logo section */}
              <Link href="/" className="flex items-center gap-4 group">
                <div className="relative flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/ets_logo.png"
                    alt="ETS Logo"
                    width={56}
                    height={56}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="text-[#0D103F] font-black text-sm md:text-base tracking-normal leading-tight">
                    EVANGELICAL THEOLOGICAL SEMINARY
                  </div>
                  <div className="text-[#981b1e] text-[9px] md:text-[11px] font-black tracking-[0.25em] uppercase mt-0.5">
                    TEACH. PRACTICE. THE WORD
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1 h-full">
                {navigation.map((item) => (
                  <div
                    key={item.name}
                    className="relative h-full flex items-center"
                    onMouseEnter={() => item.hasDropdown && handleDropdownEnter(item.name)}
                    onMouseLeave={() => item.hasDropdown && handleDropdownLeave()}
                  >
                    <Link
                      href={item.href}
                      className="relative text-[#0D103F]/75 hover:text-[#981b1e] px-4 py-2 text-sm font-black tracking-[0.1em] uppercase transition-all duration-300 flex items-center gap-1 group"
                    >
                      {item.name}
                      {item.hasDropdown && (
                        <ChevronDown className={`h-3 w-3 opacity-50 transition-all duration-300 ${openDropdown === item.name ? 'rotate-180 opacity-100 text-[#981b1e]' : ''}`} />
                      )}
                      {/* Hover underline */}
                      <span className={`absolute bottom-0 left-4 right-4 h-[2px] bg-[#981b1e] transition-transform duration-300 origin-left ${openDropdown === item.name ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                    </Link>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {item.hasDropdown && openDropdown === item.name && (
                        <motion.div
                          className="absolute top-full left-0 w-64 pt-0 z-50 pointer-events-auto"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="rounded-xl shadow-2xl shadow-black/10 bg-white border border-[#C9A84C]/20 overflow-hidden">
                            <div className="h-[2px] bg-gradient-to-r from-[#981b1e] to-[#C9A84C]" />
                            <ul className="py-2">
                              {item.dropdown?.map((sub, subIdx) => (
                                <li key={subIdx}>
                                  <Link
                                    href={sub.href}
                                    className="block px-5 py-2.5 text-[13px] text-[#0D103F]/70 hover:text-[#981b1e] hover:bg-[#FDFBF7] transition-all duration-200 font-black uppercase tracking-wider"
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/admissions"
                  className="text-[#0D103F]/70 hover:text-[#981b1e] text-[13px] font-bold tracking-wide transition-colors duration-300"
                >
                  Apply Now
                </Link>
                <Link href="/auth/signin">
                  <div className="bg-[#981b1e] hover:bg-[#7a1518] text-white text-[13px] font-black px-5 py-2.5 rounded-lg transition-all duration-300 shadow-xl shadow-[#981b1e]/20">
                    Student Portal
                  </div>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-[#0D103F] rounded-lg hover:bg-[#0D103F]/5"
                >
                  <AnimatePresence mode="wait">
                    {isMenuOpen ? (
                      <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <X className="h-6 w-6" />
                      </motion.div>
                    ) : (
                      <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Menu className="h-6 w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </nav>
        </motion.header>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[55] bg-[#FDFBF7] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col h-full pt-24 px-8 pb-8">
              <div className="space-y-1 flex-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="block py-3.5 text-[#0D103F] hover:text-[#981b1e] text-xl font-black tracking-[0.1em] uppercase transition-colors border-b border-[#0D103F]/5"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.hasDropdown && item.dropdown && (
                      <div className="pl-5 space-y-0">
                        {item.dropdown.map((sub, subIdx) => (
                          <Link
                            key={subIdx}
                            href={sub.href}
                            className="block py-2 text-[#0D103F]/50 hover:text-[#981b1e] text-sm font-black uppercase tracking-widest transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-3 pt-6 border-t border-[#0D103F]/10">
                <Button asChild variant="outline" className="w-full rounded-lg border-[#0D103F]/20 text-[#0D103F] hover:bg-[#0D103F]/5 h-12 font-bold">
                  <Link href="/admissions">Apply Now</Link>
                </Button>
                <Button asChild className="w-full rounded-lg bg-[#981b1e] hover:bg-[#7a1518] text-white h-12 font-black">
                  <Link href="/auth/signin">Student Portal</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
