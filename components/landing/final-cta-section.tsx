"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react'

export function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary/95 to-primary/90 dark:from-primary dark:via-primary/90 dark:to-primary/80 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Are you ready to become a pastor, counselor, or church leader who is
            </h2>
            <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white/95 mb-8">
              Trusted for Truth?
            </div>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join North India Baptist Seminary and receive the theological training 
            that will equip you to faithfully serve Christ and His church.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-white hover:bg-white/90 text-primary h-16 px-10 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all group"
            >
              <Link href="/admissions">
                <GraduationCap className="mr-2 h-6 w-6" />
                Apply Now
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent hover:bg-white/10 border-2 border-white text-white hover:text-white h-16 px-10 rounded-full font-bold text-lg transition-all"
            >
              <Link href="/programs">
                <BookOpen className="mr-2 h-6 w-6" />
                Explore Programs
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
