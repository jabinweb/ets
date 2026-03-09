"use client"

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

const videos = [
    {
        title: "Biblical Education",
        url: "https://www.youtube.com/embed/m7DaX8nn2s4"
    },
    {
        title: "Seminary Life",
        url: "https://player.vimeo.com/video/251160355?badge=0&autopause=0&player_id=0&app_id=58479"
    },
    {
        title: "Mission & Purpose",
        url: "https://www.youtube.com/embed/YPzpvngKwDY"
    }
]

export function EtsLifeSection() {
    return (
        <section className="py-24 bg-[#FDFBF7] relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex items-center gap-3 justify-center mb-6"
                    >
                        <div className="w-8 h-[2px] bg-[#C9A84C]" />
                        <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">Student Experience</span>
                        <div className="w-8 h-[2px] bg-[#C9A84C]" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-3xl md:text-5xl font-[900] text-[#0D103F] mb-6"
                    >
                        ETS <span className="text-[#981b1e]">Life</span> in Motion
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg text-[#0D103F]/60 max-w-2xl mx-auto font-medium"
                    >
                        Experience the vibrant community, rigorous academics, and spiritual growth
                        that defines life at Evangelical Theological Seminary.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {videos.map((v, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="flex flex-col group"
                        >
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 shadow-lg group-hover:shadow-2xl transition-all duration-500 border-4 border-white">
                                <iframe
                                    className="absolute inset-0 w-full h-full border-none"
                                    src={v.url}
                                    title={v.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                            <h3 className="mt-5 text-xl font-bold text-[#0D103F] tracking-tight text-center">
                                {v.title}
                            </h3>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
