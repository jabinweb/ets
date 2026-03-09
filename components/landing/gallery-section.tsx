"use client"

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import { Camera, Users, BookOpen, Trophy } from 'lucide-react'
import Image from 'next/image'

export function GallerySection() {
  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80",
      alt: "Students in science lab",
      category: "Science",
      icon: BookOpen
    },
    {
      src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
      alt: "Basketball team celebration",
      category: "Sports",
      icon: Trophy
    },
    {
      src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&auto=format&fit=crop&q=80",
      alt: "Students collaborating on project",
      category: "Collaboration",
      icon: Users
    },
    {
      src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&auto=format&fit=crop&q=80",
      alt: "Modern school building",
      category: "Campus",
      icon: Camera
    },
    {
      src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80",
      alt: "Art class in session",
      category: "Arts",
      icon: BookOpen
    },
    {
      src: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80",
      alt: "Graduation ceremony",
      category: "Events",
      icon: Trophy
    }
  ]

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Camera className="h-4 w-4 text-accent mr-2" />
            <span className="text-sm font-medium text-accent">Campus Life</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
            Experience Our <span className="text-accent">Vibrant Community</span>
          </h2>
          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
            Take a glimpse into daily life at North India Baptist Seminary through our photo gallery.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {galleryImages.map((image, index) => (
            <motion.div 
              key={index} 
              variants={staggerItem}
              className="group relative overflow-hidden rounded-2xl aspect-4/3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <image.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{image.category}</span>
                </div>
                <p className="text-xs opacity-90">{image.alt}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
