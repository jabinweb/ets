"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PageHero } from '@/components/ui/page-hero'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  Cross,
  GraduationCap,
  MessageCircle,
  Calendar,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface SchoolSettings {
  schoolPhone: string
  schoolEmail: string
  schoolEmail2: string
  schoolAddress: string
}

export default function ContactPage() {
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolPhone: '04344-255800 (ext. 803, 858, 851)',
    schoolEmail: 'ets@acaindia.org',
    schoolEmail2: 'etsonline@acaindia.org',
    schoolAddress: 'Asian Christian Academy,\nJeemangalam, Bagalur (P.O),\nHosur, Krishnagiri (Dist.),\nTamil Nadu - 635103,\nIndia.'
  })

  useEffect(() => {
    fetch('/api/school/settings')
      .then(res => res.json())
      .then(response => {
        if (response.success && response.data) {
          setSettings({
            schoolPhone: response.data.schoolPhone || '04344-255800 (ext. 803, 858, 851)',
            schoolEmail: response.data.schoolEmail || 'ets@acaindia.org',
            schoolEmail2: response.data.schoolEmail2 || 'etsonline@acaindia.org',
            schoolAddress: response.data.schoolAddress || 'Asian Christian Academy,\nJeemangalam, Bagalur (P.O),\nHosur, Krishnagiri (Dist.),\nTamil Nadu - 635103,\nIndia.'
          })
        }
      })
      .catch(err => console.error('Failed to fetch school settings:', err))
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PageHero
        title="Get In Touch"
        description="We're here to answer your questions about theological education, admissions, and ministry preparation."
        badge={{
          icon: MessageCircle,
          text: "Contact Us"
        }}
        gradient="purple"
      />

      {/* Main Content */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact Form - Takes 2 columns */}
            <motion.div
              className="lg:col-span-2"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <Card className="shadow-xl border-0">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <p className="text-slate-600 dark:text-slate-400">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName"
                          placeholder="John" 
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName"
                          placeholder="Doe" 
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input 
                          id="email"
                          type="email" 
                          placeholder="john@example.com" 
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          placeholder="+91 98765 43210" 
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input 
                        id="subject"
                        placeholder="How can we help you?" 
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea 
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className="resize-none"
                      />
                    </div>

                    <Button className="w-full h-12 text-base" size="lg">
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information Sidebar */}
            <motion.div
              className="space-y-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {/* Quick Contact */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/90 text-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-90">Call Us</p>
                      <p className="text-lg font-semibold">{settings.schoolPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-90">Email Us</p>
                      <p className="text-base font-semibold break-all">{settings.schoolEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-90">Online Support</p>
                      <p className="text-base font-semibold break-all">{settings.schoolEmail2}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-90">Visit Us</p>
                      <p className="text-base font-semibold whitespace-pre-line">{settings.schoolAddress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Office Hours</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Monday - Friday</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Saturday</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">By Appointment</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sunday</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Closed</span>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Visit CTA */}
              {/* <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Visit Our Campus</h3>
                    <p className="text-sm opacity-90 leading-relaxed">
                      Experience our seminary community. Schedule a personal tour during our intensive sessions.
                    </p>
                  </div>
                  <Button variant="secondary" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Visit
                  </Button>
                </CardContent>
              </Card> */}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {/* <section className="py-0 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 max-w-7xl pb-20">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="aspect-[21/9] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Interactive Map</p>
                  <Button variant="outline" size="sm">
                    Get Directions
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section> */}
    </div>
  )
}
