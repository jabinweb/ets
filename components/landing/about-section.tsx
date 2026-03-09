"use client"

import { motion } from 'framer-motion'
import { Target, Award, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0D103F]/[0.02] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#981b1e]/[0.02] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            {/* Left — Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-[#0D103F]/10">
                <Image
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000"
                  alt="Seminary Students"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D103F]/70 via-transparent to-transparent" />

                {/* Floating badge */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white rounded-xl p-5 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#981b1e] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-[#0D103F]">Since 1978</div>
                      <div className="text-xs text-[#0D103F]/50 font-medium">Excellence in Theological Education</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative accent frame */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#C9A84C]/20 rounded-2xl -z-10" />
            </motion.div>

            {/* Right — Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              {/* Section label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[2px] bg-[#981b1e]" />
                <span className="text-[#981b1e] text-xs font-bold tracking-[0.2em] uppercase">About ETS</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-black mb-8 text-[#0D103F] leading-[1.1]">
                Exemplary Ministry of{" "}
                <span className="text-[#981b1e]">Biblical Education</span>
              </h2>

              <div className="space-y-5 mb-10">
                <p className="text-[#0D103F]/60 leading-relaxed">
                  The Evangelical Theological Seminary was established by the ACA in 1978 as our first primary area of our school family. The ETS has been developed as a school of excellence in the field of theological education.
                </p>
                <p className="text-[#0D103F]/60 leading-relaxed">
                  ETS has programs at the Master&apos;s and Doctoral levels. Our strengths are in Biblical Studies and Bible Exposition with an emphasis on biblical languages and Theological Studies.
                </p>
              </div>

              {/* Feature list */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  'Biblical Studies & Exposition',
                  'Biblical Languages Focus',
                  'Doctoral Research Programs',
                  'Holistic Spiritual Formation'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#981b1e] flex-shrink-0 mt-0.5" />
                    <span className="text-[#0D103F]/80 text-sm font-medium leading-snug">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}