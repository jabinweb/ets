"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap, BookOpen, Award, ArrowRight, Users, Cross, Globe, Laptop } from 'lucide-react'

const iconMap: Record<string, any> = { Users, BookOpen, Cross, Award, GraduationCap }

interface ProgramFeature { id: string; feature: string; order: number }
interface Program {
  id: string; title: string; description: string; level: string
  duration: string; credits: string; institution: string; slug: string
  icon: string; gradient: string; features: ProgramFeature[]
  mode?: 'online' | 'offline' // Assuming this exists or we mock it
}

export function FeaturesSection() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'offline' | 'online'>('offline')

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/programs?institution=ACA')
        const data = await response.json()
        if (data.success) {
          // Mocking modes for demonstration if not provided by API
          const enhancedPrograms = data.data.map((p: any, i: number) => ({
            ...p,
            mode: i % 2 === 0 ? 'offline' : 'online'
          }))
          setPrograms(enhancedPrograms)
        }
      } catch (error) {
        console.error('Error fetching programs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPrograms()
  }, [])

  const filteredPrograms = programs.filter(p => p.mode === activeTab).slice(0, 3)

  if (loading) {
    return (
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#981b1e] border-t-transparent mx-auto mb-4" />
          <p className="text-[#0D103F]/40 text-sm">Loading programs...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#981b1e]/[0.02] rounded-full -translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="w-8 h-[2px] bg-[#981b1e]" />
            <span className="text-[#981b1e] text-xs font-bold tracking-[0.2em] uppercase">Academic Programs</span>
            <div className="w-8 h-[2px] bg-[#981b1e]" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 text-[#0D103F]">
            Theological Training Programs
          </h2>
          <p className="text-[#0D103F]/40 max-w-2xl mx-auto font-light">
            Advanced theological programs designed to equip you with the knowledge and skills needed for effective ministry.
          </p>
        </motion.div>

        {/* Tabs Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-gray-100/50 p-1.5 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('offline')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'offline'
                  ? 'bg-white text-[#981b1e] shadow-md shadow-black/5'
                  : 'text-[#0D103F]/40 hover:text-[#0D103F]'
                }`}
            >
              <Globe className="h-4 w-4" />
              Offline Programs
            </button>
            <button
              onClick={() => setActiveTab('online')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'online'
                  ? 'bg-white text-[#981b1e] shadow-md shadow-black/5'
                  : 'text-[#0D103F]/40 hover:text-[#0D103F]'
                }`}
            >
              <Laptop className="h-4 w-4" />
              Online Programs
            </button>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16 min-h-[460px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="contents" // Use contents to keep grid layout
            >
              {filteredPrograms.map((program, index) => {
                const Icon = iconMap[program.icon] || BookOpen
                return (
                  <div key={program.id} className="group">
                    <div className="relative h-full bg-white rounded-xl border border-gray-100 hover:border-[#981b1e]/15 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-[#0D103F]/5 flex flex-col">
                      {/* Top accent */}
                      <div className="h-1 bg-gradient-to-r from-[#981b1e] to-[#0D103F]" />

                      <div className="p-7 space-y-5 flex-1 flex flex-col">
                        {/* Icon & Level */}
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 bg-[#0D103F] rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#981b1e] bg-[#981b1e]/5 px-3 py-1.5 rounded-md">
                            {program.level}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-[#0D103F] leading-tight">
                          {program.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[#0D103F]/45 text-sm leading-relaxed line-clamp-4 flex-1">
                          {program.description}
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                          <div>
                            <div className="text-sm font-bold text-[#0D103F]">{program.duration}</div>
                            <div className="text-[10px] text-[#0D103F]/35 uppercase tracking-wider">Duration</div>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-[#0D103F]">{program.credits}</div>
                            <div className="text-[10px] text-[#0D103F]/35 uppercase tracking-wider">Credits</div>
                          </div>
                        </div>

                        {/* CTA */}
                        <Button
                          asChild
                          className="w-full bg-[#981b1e] hover:bg-[#b82225] text-white rounded-lg font-semibold text-sm h-11 transition-all duration-300 group/btn"
                          size="sm"
                        >
                          <Link href={`/admissions/apply?program=${program.slug}`}>
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View all CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            asChild
            size="lg"
            className="bg-[#0D103F] hover:bg-[#181c52] text-white h-13 px-10 rounded-lg font-bold text-sm group shadow-lg shadow-[#0D103F]/15"
          >
            <Link href="/programs">
              View All {activeTab === 'offline' ? 'Offline' : 'Online'} Programs
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}