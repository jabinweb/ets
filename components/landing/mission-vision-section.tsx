"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Target, Eye } from 'lucide-react'

export function MissionVisionSection() {
  return (
    <section className="py-24 md:py-32 bg-[#FAF8F4] relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section label */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="w-8 h-[2px] bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">What Drives Us</span>
            <div className="w-8 h-[2px] bg-[#C9A84C]" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group"
          >
            <div className="bg-white rounded-2xl p-8 md:p-10 h-full shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#981b1e]/10 transition-all duration-500 relative overflow-hidden">
              {/* Left accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#981b1e] to-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#981b1e]/8 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-[#981b1e]" />
                </div>
                <h3 className="text-2xl font-black text-[#0D103F]">Our Mission</h3>
              </div>
              <p className="text-[#0D103F]/55 leading-relaxed">
                Our mission is to glorify God by educating, equipping, and entrusting faithful leaders
                to prepare the future generation to interpret the Word of God accurately and impart sound doctrine.
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group"
          >
            <div className="bg-[#0D103F] rounded-2xl p-8 md:p-10 h-full shadow-sm hover:shadow-lg transition-all duration-500 relative overflow-hidden">
              {/* Right accent */}
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#C9A84C] to-[#981b1e] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#981b1e]/10 rounded-full blur-3xl" />

              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 bg-white/8 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-[#C9A84C]" />
                </div>
                <h3 className="text-2xl font-black text-white">Our Vision</h3>
              </div>
              <p className="text-white/50 leading-relaxed relative z-10">
                ACA is committed to providing sound Biblical and theological education to create a community
                of those committed to obeying the Great Commission given by the Lord Jesus Christ.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
