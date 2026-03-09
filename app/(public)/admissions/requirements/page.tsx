"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHero } from "@/components/ui/page-hero"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import { FileText, Calendar, Users, CheckCircle2, Info, ArrowRight, Download, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdmissionRequirementsPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Admission Requirements"
        description="Everything you need to know about applying to our school"
        badge={{
          icon: FileText,
          text: "Application Process"
        }}
        gradient="green"
      />

      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Our <span className="text-primary">Admissions</span> Process
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              We welcome students who are eager to learn, grow, and contribute to our diverse community.
              Below you&apos;ll find the requirements and steps to apply for admission.
            </p>
          </motion.div>

          {/* Process Timeline */}
          <motion.div 
            className="max-w-4xl mx-auto mb-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-slate-900 dark:text-white">
              Application Timeline
            </h3>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20"></div>
              
              {/* Timeline Steps */}
              <div className="space-y-16">
                {[
                  { 
                    title: "Submit Application", 
                    description: "Complete the online application form with all required information.", 
                    icon: FileText 
                  },
                  { 
                    title: "Document Verification", 
                    description: "Our admissions team will review your submitted documents and academic records.", 
                    icon: CheckCircle2 
                  },
                  { 
                    title: "Entrance Assessment", 
                    description: "Students take grade-appropriate assessments to determine academic readiness.", 
                    icon: Calendar 
                  },
                  { 
                    title: "Interview", 
                    description: "Selected candidates and their parents are invited for a personal interview.", 
                    icon: Users 
                  },
                  { 
                    title: "Admission Decision", 
                    description: "Final admission decisions are communicated within 2-3 weeks after completing all steps.", 
                    icon: Info 
                  }
                ].map((step, index) => (
                  <motion.div 
                    key={index} 
                    className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                    variants={staggerItem}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-16 text-right' : 'pl-16 text-left'}`}>
                      <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Grade Level Requirements Tabs */}
          <motion.div 
            className="max-w-4xl mx-auto mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-slate-900 dark:text-white">
              Grade-Specific Requirements
            </h3>

            <Tabs defaultValue="elementary" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="elementary">Elementary School</TabsTrigger>
                <TabsTrigger value="middle">Middle School</TabsTrigger>
                <TabsTrigger value="high">High School</TabsTrigger>
              </TabsList>

              <TabsContent value="elementary" className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Elementary School (Grades K-5)</h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Birth Certificate</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Official birth certificate or passport</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Academic Records</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Previous school records (for grades 1-5)</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Health Records</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Immunization records and health examination form</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Readiness Assessment</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Age-appropriate assessment of basic skills</p>
                    </div>
                  </li>
                </ul>
              </TabsContent>

              <TabsContent value="middle" className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Middle School (Grades 6-8)</h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Academic Transcripts</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Last two years of academic records</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Standardized Test Scores</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Results from any standardized tests taken</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Teacher Recommendations</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Two recommendation letters from current teachers</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Entrance Exam</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Assessment in Mathematics and English</p>
                    </div>
                  </li>
                </ul>
              </TabsContent>

              <TabsContent value="high" className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h4 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">High School (Grades 9-12)</h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Complete Academic Records</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Transcripts from all previous schools attended</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Standardized Test Scores</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Any national or standardized test results</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Personal Statement</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Essay on educational goals and interests</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Comprehensive Entrance Exam</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Subject assessments in core academic areas</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white">Extracurricular Profile</span>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">Documentation of activities, achievements, and community service</p>
                    </div>
                  </li>
                </ul>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* FAQ Section */}
          <motion.div 
            className="max-w-3xl mx-auto mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>

            <Accordion type="single" collapsible className="w-full">
              {[
                {
                  question: "When should I apply for admission?",
                  answer: "Our main application period runs from November to February for the following academic year. However, we accept applications year-round based on available spots. We recommend applying early as some grades fill quickly."
                },
                {
                  question: "Is there an application fee?",
                  answer: "Yes, there is a non-refundable application fee of $75 that covers the processing of your application and the entrance assessment. Fee waivers are available for families demonstrating financial need."
                },
                {
                  question: "Do you accept mid-year transfers?",
                  answer: "Yes, we accept mid-year transfers subject to space availability. The application process is the same, though decisions are typically made more quickly for mid-year applicants."
                },
                {
                  question: "What is the typical class size?",
                  answer: "Our average class size is 18-22 students, depending on the grade level. We maintain small class sizes to ensure personalized attention for each student."
                },
                {
                  question: "Do you offer financial aid?",
                  answer: "Yes, we offer need-based financial aid to qualifying families. Please visit our Financial Aid page for more information about the application process and deadlines."
                }
              ].map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-medium text-slate-900 dark:text-white">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Key Dates */}
          <motion.div 
            className="max-w-4xl mx-auto mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <Calendar className="h-5 w-5 mr-2" />
                  Key Admission Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                {[
                  { 
                    event: "Application Opens", 
                    date: "November 1, 2024",
                    description: "Online application portal opens for the 2025-2026 academic year" 
                  },
                  { 
                    event: "Priority Deadline", 
                    date: "January 15, 2025",
                    description: "Applications received by this date receive priority consideration" 
                  },
                  { 
                    event: "Financial Aid Deadline", 
                    date: "February 1, 2025",
                    description: "Last day to submit financial aid applications for full consideration" 
                  },
                  { 
                    event: "Admission Decisions", 
                    date: "March 15, 2025",
                    description: "Families are notified of admission decisions" 
                  },
                  { 
                    event: "Enrollment Deadline", 
                    date: "April 15, 2025",
                    description: "Deadline to accept offer and submit enrollment deposit" 
                  },
                  { 
                    event: "New Family Orientation", 
                    date: "August 20, 2025",
                    description: "Orientation program for newly admitted students and families" 
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.event}</h4>
                      <p className="text-primary font-medium">{item.date}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center max-w-2xl mx-auto"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
              Ready to Begin Your Journey?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              Start your application process today or download our comprehensive admissions guide.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/admissions/apply">
                  Begin Application <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Download className="mr-2 h-4 w-4" /> Download Admissions Guide
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
