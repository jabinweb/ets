"use client"

import { motion } from 'framer-motion'
import { Heart, BookOpen, Mic, Globe, Church } from 'lucide-react'

export function FivePillarsSection() {
  const pillars = [
    {
      icon: Heart,
      title: "Christ-Centered",
      description: "Making Jesus Christ the foundation of all theological studies and spiritual formation.",
    },
    {
      icon: BookOpen,
      title: "Bible-Centered",
      description: "Grounded in deep study, reverence, and faithful exposition of the Word of God.",
    },
    {
      icon: Mic,
      title: "Expository Preaching",
      description: "Training students in clear, accurate, and powerful preaching directly from Scripture.",
    },
    {
      icon: Globe,
      title: "Asia Mission-Focused",
      description: "Preparing leaders to advance the gospel throughout India and the Asian continent.",
    },
    {
      icon: Church,
      title: "Church-Centered",
      description: "The local church is central to God's mission — we train leaders accordingly.",
    }
  ]

  return (
    <section className="relative py-24 md:py-32 bg-[#0D103F] overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#981b1e]/8 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#C9A84C]/5 rounded-full blur-3xl translate-y-1/3" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="w-8 h-[2px] bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">Our Foundation</span>
            <div className="w-8 h-[2px] bg-[#C9A84C]" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Five Pillars of ETS
          </h2>
          <p className="text-white/60 max-w-xl mx-auto font-light">
            The foundation of our Christ-centered theological training
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-7xl mx-auto">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group"
            >
              <div className="relative bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm border border-white/[0.06] hover:border-[#C9A84C]/20 rounded-xl p-7 h-full transition-all duration-500">
                {/* Number */}
                <div className="text-[#C9A84C]/20 text-6xl font-black absolute top-3 right-4 leading-none select-none">
                  {index + 1}
                </div>

                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-[#981b1e] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <pillar.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-base leading-tight">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#981b1e] to-[#C9A84C] rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
