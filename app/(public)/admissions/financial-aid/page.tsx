"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/ui/page-hero"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { 
  HeartHandshake, 
  CalendarDays, 
  FileCheck2, 
  PiggyBank, 
  ArrowRight, 
  BadgePercent, 
  Clock, 
  Info, 
  CheckCircle,
  Search,
  Calculator,
  Award,
  Users,
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function FinancialAidPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Financial Aid"
        description="Making quality education accessible to all students"
        badge={{
          icon: HeartHandshake,
          text: "Affordability Programs"
        }}
        gradient="orange"
      />

      <section className="py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-12 md:mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white">
              Our Commitment to <span className="text-primary">Educational Access</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300">
              We believe that financial circumstances should not be a barrier to an excellent education.
              Our financial aid program is designed to help bridge the gap between the cost of education
              and what a family can reasonably contribute.
            </p>
          </motion.div>

          {/* Overview with image */}
          <motion.div
            className="max-w-7xl mx-auto mb-16 grid md:grid-cols-2 gap-8 items-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="space-y-5 order-2 md:order-1">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                Helping Families Access Quality Education
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Our mission is to provide excellent education to students from diverse backgrounds. 
                Each year, we dedicate significant resources to our financial aid programs, supporting 
                families who demonstrate financial need.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">30%</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">of students receive aid</p>
                </div>
                <div className="bg-accent/10 rounded-lg p-4 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-accent">₹2.1 Cr+</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">annual aid budget</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="flex-1 min-w-[120px]" asChild>
                  <Link href="#programs">
                    View Programs <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="flex-1 min-w-[120px]" asChild>
                  <Link href="#application">
                    How to Apply
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-60 md:h-80 rounded-xl overflow-hidden order-1 md:order-2">
              <Image 
                src="https://images.unsplash.com/flagged/photo-1574097656146-0b43b7660cb6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" 
                alt="Students in classroom"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </motion.div>

          {/* Aid Programs */}
          <motion.div 
            id="programs"
            className="max-w-4xl mx-auto mb-16 md:mb-20 scroll-mt-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center text-slate-900 dark:text-white">
              Financial Aid Programs
            </h3>

            <Tabs defaultValue="need-based" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
                <TabsTrigger value="need-based">Need-Based Aid</TabsTrigger>
                <TabsTrigger value="merit">Merit Scholarships</TabsTrigger>
                <TabsTrigger value="sibling">Sibling Discounts</TabsTrigger>
                <TabsTrigger value="payment">Payment Plans</TabsTrigger>
              </TabsList>

              <TabsContent value="need-based">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <HeartHandshake className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Need-Based Financial Aid</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      Financial assistance awarded based on demonstrated financial need. Awards range from 10% to 75% of tuition costs,
                      depending on family circumstances.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white">Eligibility Criteria</h4>
                        <ul className="space-y-2">
                          {[
                            "Demonstrated financial need",
                            "Complete application with financial documentation",
                            "Academic standing in good condition",
                            "Timely submission of all required forms"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-primary mt-1" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white">Application Process</h4>
                        <ul className="space-y-2">
                          {[
                            "Submit financial aid application",
                            "Provide income proof and tax returns",
                            "Complete family financial statement",
                            "Interview with financial aid committee"
                          ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <FileCheck2 className="h-4 w-4 text-primary mt-1" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Important Note</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Need-based financial aid is reassessed each academic year, and families must reapply annually.
                            Applications for the upcoming academic year should be submitted by February 1st.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3">
                      <Button size="sm" asChild>
                        <Link href="/admissions/financial-aid/apply">
                          Apply for Need-Based Aid <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="merit">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Merit Scholarships</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      Awards recognizing exceptional academic achievement, leadership abilities, and special talents.
                      Merit scholarships are based on student performance rather than financial need.
                    </p>
                    
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        {
                          title: "Academic Excellence",
                          amount: "₹1,50,000 - ₹3,00,000",
                          criteria: "Top 5% academic performance, exceptional test scores, academic competitions"
                        },
                        {
                          title: "Leadership & Service",
                          amount: "₹1,00,000 - ₹2,00,000",
                          criteria: "Demonstrated leadership, community service, positive impact on community"
                        },
                        {
                          title: "Arts & Athletics",
                          amount: "₹75,000 - ₹1,50,000",
                          criteria: "Excellence in fine arts, performing arts, or athletic achievements"
                        }
                      ].map((scholarship, idx) => (
                        <Card key={idx} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{scholarship.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="text-lg font-bold text-primary">{scholarship.amount}</div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{scholarship.criteria}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Selection Process</h4>
                      <ol className="space-y-2">
                        {[
                          "Submit merit scholarship application with supporting documentation",
                          "Complete student achievements portfolio",
                          "Participate in scholarship assessment day (if applicable)",
                          "Interview with scholarship committee"
                        ].map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-primary">{idx+1}</span>
                            </div>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-amber-800 dark:text-amber-300">
                        Merit scholarships are renewable annually provided students maintain qualifying academic standing and continue to demonstrate excellence in their area of achievement.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sibling">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Sibling Discounts</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      We offer automatic tuition discounts for families with multiple children enrolled simultaneously,
                      making it more affordable for siblings to attend our school together.
                    </p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Number of Children</th>
                            <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Discount (on younger sibling&apos;s tuition)</th>
                            <th className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Typical Annual Savings</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-3 px-4">2 children</td>
                            <td className="py-3 px-4 text-primary font-medium">5% for second child</td>
                            <td className="py-3 px-4">₹60,000 - ₹90,000</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-3 px-4">3 children</td>
                            <td className="py-3 px-4 text-primary font-medium">10% for third child</td>
                            <td className="py-3 px-4">₹1,20,000 - ₹1,80,000</td>
                          </tr>
                          <tr>
                            <td className="py-3 px-4">4+ children</td>
                            <td className="py-3 px-4 text-primary font-medium">15% for fourth+ child</td>
                            <td className="py-3 px-4">₹1,80,000 - ₹2,70,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Automatic Benefit</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            No application required. Sibling discounts are applied automatically when you enroll multiple children.
                            The discount applies to the tuition of the younger siblings.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 text-sm text-slate-600 dark:text-slate-300">
                      <p>
                        <span className="font-medium text-slate-900 dark:text-white">Note:</span> Sibling discounts can be combined with need-based financial aid and payment plans, but generally not with merit scholarships.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="payment">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <PiggyBank className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Flexible Payment Plans</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-300">
                      We offer flexible payment options to help families manage educational expenses
                      by spreading tuition payments throughout the year to improve cash flow management.
                    </p>
                    
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        {
                          title: "Annual Payment",
                          discount: "3% Discount",
                          description: "One payment due by July 15th",
                          benefit: "Largest discount available"
                        },
                        {
                          title: "Semester Payment",
                          discount: "1.5% Discount",
                          description: "Two payments (July & December)",
                          benefit: "Balance of savings and flexibility"
                        },
                        {
                          title: "Monthly Payment",
                          discount: "No Discount",
                          description: "Ten monthly payments (July-April)",
                          benefit: "Maximum flexibility for budgeting"
                        }
                      ].map((plan, idx) => (
                        <Card key={idx} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{plan.title}</CardTitle>
                            <div className="text-sm font-medium text-primary">{plan.discount}</div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm">{plan.description}</p>
                            <div className="text-xs text-slate-600 dark:text-slate-400">{plan.benefit}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Payment Methods</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { method: "Bank Transfer", fee: "No fee" },
                          { method: "Credit Card", fee: "2% processing fee" },
                          { method: "Cheque", fee: "No fee" },
                          { method: "UPI", fee: "No fee" }
                        ].map((payment, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                            <div className="font-medium text-slate-900 dark:text-white">{payment.method}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{payment.fee}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Payment plans can be combined with all other forms of financial aid. A payment plan selection form will be provided with your enrollment contract.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Application Process */}
          <motion.div 
            id="application"
            className="max-w-4xl mx-auto mb-16 md:mb-20 scroll-mt-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-center text-slate-900 dark:text-white">
              Financial Aid Application Process
            </h3>

            <div className="relative mb-12">
              {/* Process Timeline Line */}
              {/* <div className="absolute left-16 sm:left-24 top-0 bottom-0 w-1 bg-primary/20 ml-[7px] hidden sm:block"></div> */}
              
              {/* Process Steps */}
              <div className="space-y-8 sm:space-y-12">
                {[
                  { 
                    title: "Submit Financial Aid Application", 
                    description: "Complete the online financial aid application through our student portal. You'll need tax returns, income proof, and details about assets and liabilities.", 
                    icon: FileCheck2,
                    date: "Deadline: February 1"
                  },
                  { 
                    title: "Financial Documentation Review", 
                    description: "Our financial aid committee will review your application and documentation to assess your family's financial situation and need.", 
                    icon: Search,
                    date: "2-3 weeks after submission"
                  },
                  { 
                    title: "Need Assessment", 
                    description: "We calculate your estimated family contribution based on income, assets, family size, expenses, and other relevant factors.", 
                    icon: Calculator,
                    date: "March process"
                  },
                  { 
                    title: "Award Notification", 
                    description: "Financial aid decisions are communicated along with admission decisions. Your package may include various types of aid based on your situation.", 
                    icon: BadgePercent,
                    date: "By April 15"
                  },
                  { 
                    title: "Accept & Enroll", 
                    description: "Accept your financial aid package and complete the enrollment process, including payment of the deposit to secure your spot.", 
                    icon: CheckCircle,
                    date: "Within 2 weeks of offer"
                  }
                ].map((step, index) => (
                  <div key={index} className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center min-w-[48px] h-12 rounded-full bg-primary text-white z-10">
                        <step.icon className="h-6 w-6" />
                      </div>
                      {/* Mobile-only date display */}
                      <div className="sm:hidden text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {step.date}
                      </div>
                    </div>
                    
                    <div className="sm:ml-6 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="text-lg font-bold mb-1 sm:mb-0 text-slate-900 dark:text-white">{step.title}</h4>
                        {/* Desktop date display */}
                        <div className="hidden sm:block text-sm text-primary font-medium">{step.date}</div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300">
              <Info className="h-5 w-5" />
              <AlertDescription className="flex-1">
                <span className="font-medium">Important Note:</span> Financial aid applications are processed separately from admission applications, but both should be submitted by the same deadline for priority consideration.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Important Dates */}
          <motion.div 
            className="max-w-4xl mx-auto mb-16 md:mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Key Financial Aid Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-6">
                {[
                  { 
                    event: "Priority Application Deadline", 
                    date: "February 1, 2025",
                    description: "For maximum consideration, submit financial aid applications by this date" 
                  },
                  { 
                    event: "Regular Application Deadline", 
                    date: "April 1, 2025",
                    description: "Final deadline for financial aid applications for the upcoming academic year" 
                  },
                  { 
                    event: "Award Notifications", 
                    date: "March 15, 2025 (Priority) / May 1, 2025 (Regular)",
                    description: "Financial aid decisions communicated to families" 
                  },
                  { 
                    event: "Aid Acceptance Deadline", 
                    date: "Within 2 weeks of award",
                    description: "Deadline to accept your financial aid package" 
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white">{item.event}</div>
                      <div className="text-primary font-medium text-sm mt-1">{item.date}</div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQs */}
          <motion.div
            className="max-w-3xl mx-auto mb-16 md:mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-center mb-8">
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h3>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Find answers to common questions about our financial aid programs and application process.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
              {[
                {
                  question: "How is financial need determined?",
                  answer: "Financial need is assessed based on a comprehensive review of your family's financial situation, including income, assets, expenses, family size, and other relevant factors. We use a standardized methodology to ensure fair and consistent evaluation of all applications."
                },
                {
                  question: "Can I apply for financial aid after the admission process?",
                  answer: "We strongly recommend that families apply for financial aid at the same time as admission to ensure maximum consideration. While late applications may be considered, funding may be limited after the priority deadline."
                },
                {
                  question: "Will applying for financial aid affect my child's chances of admission?",
                  answer: "For most applicants, the admission and financial aid processes are separate, and applying for aid does not impact admission decisions. However, as we have limited financial aid resources, we may not be able to offer aid to all admitted students who demonstrate need."
                },
                {
                  question: "Do I need to reapply for financial aid each year?",
                  answer: "Yes, families must reapply for financial aid each academic year. This allows us to account for changes in your financial circumstances and ensure that aid is distributed equitably based on current need."
                },
                {
                  question: "Can international students apply for financial aid?",
                  answer: "Yes, international students are eligible to apply for financial aid, though the documentation requirements may differ. Please contact our financial aid office for specific instructions for international applicants."
                },
                {
                  question: "What documents are required for the financial aid application?",
                  answer: "Required documents typically include recent tax returns, income statements, bank statements, proof of assets and liabilities, and family expense documentation. A complete list will be provided with your application."
                },
                {
                  question: "How much financial aid can my family receive?",
                  answer: "Financial aid awards vary based on individual circumstances and demonstrated need. We aim to bridge the gap between the cost of education and what your family can reasonably afford to pay. Awards can range from partial tuition assistance to full scholarships."
                },
                {
                  question: "Can financial aid be combined with merit scholarships?",
                  answer: "Yes, students may receive both need-based financial aid and merit scholarships. However, the total combined aid cannot exceed the full cost of tuition and fees."
                }
              ].map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border-0 border border-slate-200 dark:border-slate-700 rounded-lg px-6 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-slate-900 dark:text-white text-base py-5 hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-300 pb-5 pt-0 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 text-center">
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Still have questions about financial aid?
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact">
                  Contact Financial Aid Office
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="relative text-center max-w-2xl mx-auto rounded-2xl overflow-hidden"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/90 z-0"></div>
            <div className="relative z-10 p-8 md:p-12">
              <GraduationCap className="h-12 w-12 text-white/90 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                Ready to Begin Your Journey?
              </h3>
              <p className="text-white/90 mb-6 max-w-lg mx-auto">
                Don&apos;t let financial constraints hold back your child&apos;s education. Explore our financial aid options and take the first step toward a brighter future.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link href="/admissions/financial-aid/apply">
                    Apply for Financial Aid <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white bgtext-white hover:bg-white/10">
                  <Link href="/admissions/apply">
                    Begin Admission Process
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
