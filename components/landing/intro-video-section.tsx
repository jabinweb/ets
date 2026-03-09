"use client"

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export function IntroVideoSection() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="flex items-center gap-3 justify-center mb-6"
                    >
                        <div className="w-8 h-[2px] bg-[#981b1e]" />
                        <span className="text-[#981b1e] text-xs font-bold tracking-[0.2em] uppercase">Welcome to ETS</span>
                        <div className="w-8 h-[2px] bg-[#981b1e]" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-3xl md:text-5xl font-[900] text-[#0D103F] mb-6 leading-tight"
                    >
                        Watch Our <span className="text-[#981b1e]">Introduction</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-lg text-[#0D103F]/60 max-w-2xl mx-auto font-medium"
                    >
                        Journey through our campus and witness the heartbeat of our seminary.
                        Discover how we are training leaders for Christ&apos;s mission across Asia.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(13,16,63,0.3)] bg-slate-900 group"
                >
                    <div className="aspect-video relative">
                        <iframe
                            className="absolute inset-0 w-full h-full border-none"
                            src="https://www.youtube.com/embed/f8bU5ZqIdxU"
                            title="ETS Introduction Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Decorative frame */}
                    <div className="absolute inset-0 border-[12px] border-white/5 pointer-events-none rounded-3xl" />
                </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#981b1e]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        </section>
    )
}
