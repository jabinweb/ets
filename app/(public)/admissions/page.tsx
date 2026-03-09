"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHero } from '@/components/ui/page-hero'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  Users, 
  Award,
  Search,
  Phone,
  Mail,
  MapPin,
  Download, GraduationCap
} from 'lucide-react'
import Link from 'next/link'

export default function AdmissionsPage() {
  const admissionSteps = [
    {
      step: "01",
      title: "Submit Application",
      description: "Complete our application form with ministry background and academic transcripts",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      step: "02",
      title: "Document Review",
      description: "Our admissions team reviews your application, calling, and qualifications",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      step: "03",
      title: "Interview",
      description: "Meet with faculty to discuss your ministry calling and educational goals",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      step: "04",
      title: "Admission Decision",
      description: "Receive notification of admission status and next steps",
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ]

  const requirements = [
    "Completed application form",
    "Bachelor's degree transcripts (for Master's programs)",
    "Statement of faith and calling to ministry",
    "Church recommendation letter",
    "Pastor's reference letter",
    "Copy of government-issued ID",
    "Passport-size photographs (2 copies)",
    "Application fee payment"
  ]

  const importantDates = [
    { event: "Application Opens", date: "January 15, 2024", status: "completed" },
    { event: "Application Deadline", date: "July 15, 2024", status: "upcoming" },
    { event: "Interview Period", date: "July 20-31, 2024", status: "upcoming" },
    { event: "Admission Results", date: "August 5, 2024", status: "upcoming" },
    { event: "Fee Payment Deadline", date: "August 15, 2024", status: "upcoming" },
    { event: "Intensive Session Begins", date: "September 1, 2024", status: "upcoming" }
  ]

  const programs = [
    { program: "M.Div", slug: "master-of-divinity", duration: "3-4 years", format: "Modular", description: "Comprehensive ministry preparation" },
    { program: "MA Pastoral Studies", slug: "ma-pastoral-studies", duration: "2-3 years", format: "Modular", description: "Practical pastoral ministry" },
    { program: "MA Theological Studies", slug: "ma-theological-studies", duration: "2-3 years", format: "Modular", description: "Advanced theological study" },
    { program: "Bachelor of Theology", slug: "bachelor-of-theology", duration: "3-4 years", format: "Modular", description: "Undergraduate theological training" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PageHero
        title="Admissions to ETS"
        description="Begin your journey in advanced theological education. Our admission process identifies called servants who will faithfully proclaim the gospel and advance God's kingdom through expository preaching and theological education."
        badge={{
          icon: GraduationCap,
          text: "Join Our Community"
        }}
        gradient="red"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-full">
            <Link href="/admissions/apply">
              <FileText className="mr-2 h-5 w-5" />
              Apply Now
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full">
            <Link href="/admissions/track">
              <Search className="mr-2 h-5 w-5" />
              Track Application
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-full">
            <Link href="/contact">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Tour
            </Link>
          </Button>
        </div>
      </PageHero>

      {/* Admission Process */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Simple Admission Process
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              We&apos;ve streamlined our admission process to make it easy for called servants to join our theological education community
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {admissionSteps.map((step, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="relative h-full text-center hover:shadow-lg transition-shadow">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <CardHeader className="pt-12">
                    <div className={`mx-auto w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center mb-4`}>
                      <step.icon className={`h-8 w-8 ${step.color}`} />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Requirements & Documents */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
                Admission Requirements
              </h2>
              <Card>
                <CardContent className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Required Documents
                  </h3>
                  <div className="space-y-3">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{requirement}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t">
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Application Form
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">
                Important Dates
              </h2>
              <Card>
                <CardContent className="space-y-4">
                  {importantDates.map((date, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{date.event}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{date.date}</p>
                      </div>
                      <Badge variant={date.status === 'completed' ? 'default' : 'secondary'}>
                        {date.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grade Programs & Tuition */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Available Programs
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Choose the theological program that fits your calling and ministry goals
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {programs.map((program, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-center">{program.program}</CardTitle>
                    <p className="text-center text-slate-600 dark:text-slate-400">{program.duration}</p>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <div>
                      <div className="text-lg font-bold text-primary mb-1">{program.format}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Format</div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {program.description}
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/admissions/apply?program=${program.slug}`}>
                        Apply Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      {/* <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                    Questions About Admissions?
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300">
                    Our admissions team is here to help you through every step of the process
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Call Us</h3>
                  <p className="text-slate-600 dark:text-slate-400">+91 9876543210</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email Us</h3>
                  <p className="text-slate-600 dark:text-slate-400">NIBSeminary@gmail.com</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Visit Us</h3>
                  <p className="text-slate-600 dark:text-slate-400">Patiala Campus</p>
                </div>
                </div>
                
                <div className="text-center">
                  <Button asChild size="lg">
                    <Link href="/contact">
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule Campus Visit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section> */}
    </div>
  )
}
