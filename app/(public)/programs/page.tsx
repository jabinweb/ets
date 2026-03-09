"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHero } from '@/components/ui/page-hero'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import {
  BookOpen,
  GraduationCap,
  Cross,
  Users,
  Church,
  Award,
  Heart,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Download,
  MapPin,
  Calendar,
  GraduationCapIcon
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const iconMap: Record<string, any> = {
  Users,
  BookOpen,
  Cross,
  Church,
  Award,
  Heart,
  GraduationCap
}

interface ProgramFeature {
  id: string
  feature: string
  order: number
}

interface Program {
  id: string
  title: string
  description: string
  level: string
  duration: string
  credits: string
  institution: string
  slug: string
  icon: string
  gradient: string
  features: ProgramFeature[]
}

export default function ProgramsPage() {
  const [nibsPrograms, setNibsPrograms] = useState<Program[]>([])
  const [nibbcPrograms, setNibbcPrograms] = useState<Program[]>([])
  const [nibbiPrograms, setNibbiPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/programs')
        const data = await response.json()

        if (data.success) {
          const programs = data.data
          setNibsPrograms(programs.filter((p: Program) => p.institution === 'ACA'))
          setNibbcPrograms(programs.filter((p: Program) => p.institution === 'NIBBC'))
          setNibbiPrograms(programs.filter((p: Program) => p.institution === 'NIBBI'))
        }
      } catch (error) {
        console.error('Error fetching programs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrograms()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading programs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PageHero
        title="ETS Academic Programs"
        description="Advanced theological education at the Master's and Doctoral levels, specializing in Biblical Studies and Bible Exposition with emphasis on biblical languages and Theological Studies."
        badge={{
          icon: GraduationCap,
          text: "Master's & Doctoral"
        }}
        gradient="red"
      />

      {/* 2026 Important Documents Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              2026 Information & Instructions
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Download the latest information and instructions for residential and online programs for the 2026 academic year
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white dark:bg-slate-700 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center">
                    <GraduationCap className="h-10 w-10 text-primary mb-3" />
                    <h3 className="font-bold text-lg mb-2">Residential Programs</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Download complete information for Hosur campus</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/Latest  2026 Information and Instructions RESIDENTIAL.pdf" target="_blank">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-slate-700 border-accent/20 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center">
                    <BookOpen className="h-10 w-10 text-accent mb-3" />
                    <h3 className="font-bold text-lg mb-2">Online Programs</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Download complete information for web-based programs</p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/Latest 2026 Information and Instructions ETSONLINE.pdf" target="_blank">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-12"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Ready to Apply?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              Take the next step in your theological education journey
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/admissions">
                      Explore Admissions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <Button asChild size="lg" className="w-full">
                    <Link href="/admissions/apply">
                      Start Your Application
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-accent/5 border-accent/20">
                <CardContent className="p-6">
                  <Button asChild size="lg" variant="outline" className="w-full">
                    <Link href="/admissions/requirements">
                      View Requirements
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Residential Programs Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Hosur Campus
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Residential Programs
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Accredited by Asia Theological Association (ATA) - Designed for immersive theological education at our Hosur campus
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* MTH Program */}
            <motion.div variants={staggerItem}>
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
                <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <GraduationCap className="h-7 w-7 text-primary" />
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">Masters</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Master of Theology (MTH)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    4-Year program with 126 credit hours. Includes Greek & Hebrew (Basic to Advanced) with specialization options in Theological Studies, Biblical Studies, and Pastoral Studies. Requires thesis completion.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>4 Years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>126 Credits</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">Specializations:</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Theological Studies</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Biblical Studies</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Pastoral Studies</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="w-full rounded-full" size="sm">
                      <Link href={`/admissions/apply?program=mth`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* MDIV Program */}
            <motion.div variants={staggerItem}>
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
                <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Cross className="h-7 w-7 text-primary" />
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">Masters</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Master of Divinity (MDIV)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    3-Year program with 90 credit hours. No thesis required, designed for practical ministry preparation.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>3 Years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>90 Credits</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="w-full rounded-full" size="sm">
                      <Link href={`/admissions/apply?program=mdiv`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* MABS Program */}
            <motion.div variants={staggerItem}>
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group">
                <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-primary/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="h-7 w-7 text-primary" />
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">Masters</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Master of Arts in Biblical Studies (MABS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    2-Year program with 70 credit hours. No thesis required, focused on biblical studies and interpretation.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>2 Years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>70 Credits</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="w-full rounded-full" size="sm">
                      <Link href={`/admissions/apply?program=mabs`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Online Programs Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Web-Based
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Online Programs
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Designed for pastors, working professionals, and ministry leaders. Delivered via Canvas LMS with video lectures, PDFs, and weekly assessments.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* PGDBS Program */}
            <motion.div variants={staggerItem}>
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/30 group">
                <CardHeader className="bg-gradient-to-br from-accent/5 to-accent/10 border-b border-accent/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Award className="h-7 w-7 text-accent" />
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20">Post Graduate</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Post Graduate Diploma in Biblical Studies (PGDBS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    2-Year program with 24 credit hours. 8 modules (4 per year), each module is 12 weeks with 8-10 hours of study per week.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>2 Years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>24 Credits</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="w-full rounded-full" size="sm">
                      <Link href={`/admissions/apply?program=pgdbs`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* MACS Program */}
            <motion.div variants={staggerItem}>
              <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/30 group">
                <CardHeader className="bg-gradient-to-br from-accent/5 to-accent/10 border-b border-accent/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Heart className="h-7 w-7 text-accent" />
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20">Masters</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Master of Arts in Christian Studies (MACS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                    5-Year program with 60 credit hours. 20 modules (4 per year), no thesis required. Delivered via Canvas LMS platform.
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>5 Years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>60 Credits</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="w-full rounded-full" size="sm">
                      <Link href={`/admissions/apply?program=macs`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Entrance Exam Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              2026 Entrance Exam
            </Badge>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Entrance Examination
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Required for all residential program applicants. Test areas include Bible Knowledge, Christian Theology, and English (Listening, Reading, Writing).
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Hosur Campus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">March 21, 2026</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">08:00 am – 12:30 pm</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Guwahati Campus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">April 18, 2026</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">09:00 am – 12:30 pm</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Following the written examination, successful candidates will participate in an interview. 
              Qualifying exam required for certain non-ATA Theology degree holders.
            </p>
          </div>
        </div>
      </section>

      {/* Application Requirements Section - Simplified to link to admissions page */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-green-500/10 text-green-600 border-green-500/20">Requirements</Badge>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Application Requirements
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              For detailed information about admission requirements, please visit our dedicated requirements page.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto text-center">
            <Button asChild size="lg">
              <Link href="/admissions/requirements">
                View Detailed Requirements
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Fees Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-purple-500/10 text-purple-600 border-purple-500/20">Fees Structure</Badge>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              2026-2027 Fee Structure (Residential)
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Fee information for residential programs at Hosur campus
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="border border-slate-200 dark:border-slate-600 px-4 py-3 text-left">Item</th>
                  <th className="border border-slate-200 dark:border-slate-600 px-4 py-3 text-left">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Admission Fee</td>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">6,500</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Tuition</td>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">800 per credit hour</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Accommodation</td>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">2,100/month</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Food</td>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">4,500/month</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Library Deposit</td>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">4,000 (Refundable)</td>
                </tr>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Technology Fee</td>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">4,200/year</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Medical Fee</td>
                  <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">1,250 (Single)</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Online Program Fees</h3>
              <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="border border-slate-200 dark:border-slate-600 px-4 py-3 text-left">Item</th>
                    <th className="border border-slate-200 dark:border-slate-600 px-4 py-3 text-left">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Annual Technology Fee</td>
                    <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">4,000</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800">
                    <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">Tuition (per subject)</td>
                    <td className="border border-slate-200 dark:border-slate-600 px-4 py-3">3,500</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Application Process Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-orange-500/10 text-orange-600 border-orange-500/20">Process</Badge>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Application Process
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Step-by-step guide to applying for ETS programs
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">1</span>
                  STEP 1 – Submit Application Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Submit only once</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Upload all required documents (PDF format, named properly)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Pay ₹500 application fee</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">2</span>
                  STEP 2 – Register for Entrance Exam
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Register only after submitting application</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Join WhatsApp group</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <span>Email confirmation (for online applicants)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}