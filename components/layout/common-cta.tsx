"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GraduationCap, ArrowRight, BookOpen, Mail } from 'lucide-react'

export function CommonCTA() {
  return (
    <section className="relative py-24 md:py-28 overflow-hidden bg-white">
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Decorative accent */}
          <div className="flex items-center gap-3 justify-center mb-8">
            <div className="w-8 h-[2px] bg-[#981b1e]" />
            <span className="text-[#981b1e] text-xs font-bold tracking-[0.2em] uppercase">Start Your Journey</span>
            <div className="w-8 h-[2px] bg-[#981b1e]" />
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0D103F] mb-6 leading-tight">
            Ready to Answer the{" "}
            <span className="text-[#981b1e]">Call to Ministry?</span>
          </h2>
          <p className="text-[#0D103F]/45 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Join Evangelical Theological Seminary and receive advanced theological training that will equip you to faithfully serve Christ and His church.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              asChild
              size="lg"
              className="bg-[#981b1e] hover:bg-[#b82225] text-white h-14 px-10 rounded-lg font-bold shadow-xl shadow-[#981b1e]/15 transition-all group text-base"
            >
              <Link href="/admissions">
                <GraduationCap className="mr-2 h-5 w-5" />
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#0D103F]/15 text-[#0D103F] hover:bg-[#0D103F]/5 h-14 px-10 rounded-lg font-bold text-base"
            >
              <Link href="/programs">
                <BookOpen className="mr-2 h-5 w-5" />
                View Programs
              </Link>
            </Button>
          </div>

          {/* Contact */}
          <a
            href="mailto:ets@acaindia.org"
            className="inline-flex items-center gap-2 text-[#0D103F]/30 hover:text-[#981b1e] transition-colors duration-300 text-sm"
          >
            <Mail className="h-3.5 w-3.5" />
            ets@acaindia.org
          </a>
        </motion.div>
      </div>
    </section>
  )
}
