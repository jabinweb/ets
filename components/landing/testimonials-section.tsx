"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: "Amit Timothy",
      role: "ACA Student",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      content: "After joining ACA, my ministry became more practical and productive, as I applied the lessons I learned. It not only impacted my ministry but also blessed my personal life, changing my perspective on family and faith.",
      rating: 5,
    },
    {
      name: "Raju Abraham",
      role: "Pastor, Noida, UP",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      content: "I thank ACA for helping me improve my preaching and teaching at my church, as well as deepening my understanding of the Bible. This has positively impacted my personal life and ministry.",
      rating: 5,
    },
    {
      name: "Silas John",
      role: "M.Div Student",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      content: "After a year of studying at ACA, my understanding of the Bible has deepened. The teachings and professors are outstanding, always giving their best to ensure we fully grasp the lessons.",
      rating: 5,
    },
    {
      name: "Aruna Abigail",
      role: "Seminary Student",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
      content: "ACA has transformed my life by deepening my understanding of the Bible, preaching, worship, and prayer. ACA has equipped me to confidently prepare and deliver sermons.",
      rating: 5,
    }
  ]

  const next = () => setCurrentIndex((p) => (p + 1) % testimonials.length)
  const prev = () => setCurrentIndex((p) => (p - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="relative py-24 md:py-32 bg-[#0D103F] overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#981b1e]/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#C9A84C]/5 rounded-full blur-3xl" />

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
            <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">Testimonials</span>
            <div className="w-8 h-[2px] bg-[#C9A84C]" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Transforming Lives for{" "}
            <span className="text-[#C9A84C]">God&apos;s Mission</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto font-light">
            Hear from our students and graduates about their ACA experience
          </p>
        </motion.div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-16 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 md:p-12">
                {/* Quote icon */}
                <Quote className="h-10 w-10 text-[#C9A84C]/25 mb-6" />

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#C9A84C] text-[#C9A84C]" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed font-light italic">
                  &ldquo;{testimonials[currentIndex].content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#C9A84C]/20">
                    <Image
                      src={testimonials[currentIndex].avatar}
                      alt={testimonials[currentIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-white font-bold">{testimonials[currentIndex].name}</div>
                    <div className="text-[#C9A84C] text-sm">{testimonials[currentIndex].role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-[#C9A84C]' : 'w-2 bg-white/15 hover:bg-white/25'
                    }`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mini Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
          {testimonials.map((t, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className={`text-left p-4 rounded-xl border transition-all duration-300 ${index === currentIndex
                ? 'bg-white/[0.08] border-[#C9A84C]/30'
                : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'
                }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                </div>
                <div className="text-xs font-semibold text-white truncate">{t.name}</div>
              </div>
              <div className="text-[11px] text-white/30 line-clamp-2 leading-relaxed">
                {t.content.substring(0, 60)}...
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
