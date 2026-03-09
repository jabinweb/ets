"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GraduationCap, BookOpen, ArrowRight, ChevronDown } from 'lucide-react'

export function HeroSection() {
  const scrollToNext = () => {
    const el = document.getElementById('about')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-[100svh] flex items-center overflow-hidden">
      {/* ═══ VIDEO BACKGROUND ═══ */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src="https://player.vimeo.com/video/642567907?h=d77346f4f6&background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              border: 'none',
              width: '177.78vh',
              height: '100vh',
              minWidth: '100vw',
              minHeight: '56.25vw',
            }}
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>

        {/* ═══ OVERLAY SYSTEM ═══ */}
        {/* Deep, neutral charcoal overlay — more professional than blue-tinted */}
        <div className="absolute inset-0 bg-[#050510]/85 z-10" />
        {/* Radial spotlight for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050510_70%)] z-10 opacity-60" />
        {/* Bottom edge fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050510] via-transparent to-transparent z-10" />
      </div>

      {/* ═══ HERO CONTENT ═══ */}
      <div className="relative z-20 w-full pt-[90px] md:pt-[100px] pb-10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Tagline Badge — Centered */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6 md:mb-8"
            >
              <div className="inline-flex items-center gap-4 justify-center">
                <div className="w-8 h-[1px] bg-[#C9A84C]/60" />
                <span className="text-[#C9A84C] text-[10px] sm:text-xs font-black tracking-[0.5em] uppercase">
                  TEACH. PRACTICE. THE WORD
                </span>
                <div className="w-8 h-[1px] bg-[#C9A84C]/60" />
              </div>
            </motion.div>

            {/* Main heading — Centered, premium weight */}
            <motion.h1
              className="text-[clamp(2.5rem,7vw,4rem)] font-black leading-[1.05] tracking-tight mb-6 md:mb-10 text-white"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              Equipping <span className="text-[#C9A84C]">Leaders</span> for
              <br />
              <span className="drop-shadow-[0_0_30px_rgba(201,168,76,0.2)] font-[900]">Christ&apos;s Mission</span>
            </motion.h1>

            {/* Description — Centered */}
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed font-medium tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <span className="text-[#C9A84C]/80 font-bold tracking-wider">AN INSTITUTE OF</span>
              <br />
              Asian Christian Academy of India
            </motion.p>

            {/* Action Group — Centered & Sized appropriately */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 mb-14 md:mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-[#981b1e] hover:bg-[#b82225] text-white h-14 px-8 rounded-lg font-bold text-base shadow-xl shadow-[#981b1e]/30 transition-all duration-300 group"
              >
                <Link href="/admissions">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Apply for Admission
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10 hover:border-white/40 h-14 px-8 rounded-lg font-semibold text-base transition-all duration-300"
              >
                <Link href="/programs">
                  <BookOpen className="mr-2 h-5 w-5 opacity-70" />
                  Explore Programs
                </Link>
              </Button>
            </motion.div>

            {/* Stats row — Centered, clean */}
            <motion.div
              className="flex justify-center gap-12 md:gap-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              {[
                { number: '90+', label: 'Courses' },
                { number: '150+', label: 'Leaders' },
                { number: '45+', label: 'Years' },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-3xl md:text-4xl font-black text-white group-hover:text-[#C9A84C] transition-colors duration-300">
                    {stat.number}
                  </div>
                  <div className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ SCROLL INDICATOR ═══ */}
      <motion.button
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={scrollToNext}
      >
        {/* <span className="text-[10px] tracking-[0.25em] uppercase font-medium">Scroll</span> */}
        <ChevronDown className="h-4 w-4" />
      </motion.button>

      {/* ═══ BOTTOM EDGE ═══ */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent z-20" />
    </section>
  )
}
