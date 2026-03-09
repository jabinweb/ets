"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHero } from "@/components/ui/page-hero"
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import { 
  Cross, 
  BookOpen, 
  Heart, 
  Globe, 
  Users, 
  GraduationCap,
  Church,
  Languages,
  ArrowRight 
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  const heritage = [
    {
      icon: Cross,
      title: "Christ-Centered Education",
      description: "Every aspect of our seminary is grounded in the person and work of Jesus Christ. We train servants who will proclaim the gospel with conviction and compassion."
    },
    {
      icon: BookOpen,
      title: "Biblical Foundation",
      description: "We hold to the inerrancy and sufficiency of Scripture. Our curriculum is built on careful exegesis and exposition of God's Word for faithful ministry."
    },
    {
      icon: Languages,
      title: "Biblical Languages Focus",
      description: "Our strength lies in Biblical Studies and Bible Exposition with emphasis on biblical languages and Theological Studies."
    },
    {
      icon: Globe,
      title: "Asia Mission Focus",
      description: "We equip students for expository preaching and theological education to impact India and Asia with the gospel."
    }
  ]

  const distinctives = [
    {
      icon: BookOpen,
      title: "Biblical Studies & Exposition",
      description: "Our Master's programs prepare expository preachers and Bible college/seminary teachers. We emphasize deep biblical understanding through careful exegetical study."
    },
    {
      icon: GraduationCap,
      title: "Advanced Research Programs",
      description: "Our D.Min. programs advance training for pastors and practitioners to engage in research on ministry contexts. Our Ph.D. programs prepare scholars for seminary professorship and academic research."
    },
    {
      icon: Heart,
      title: "Holistic Formation",
      description: "Our programs emphasize spiritual and ministry formation, not just academic excellence. We prepare complete servants of God for kingdom service."
    },
    {
      icon: Globe,
      title: "Asian Context Focus",
      description: "We contextualize theological education for the South Asian context, training leaders who understand and effectively minister in their cultural settings."
    }
  ]

  const timeline = [
    { year: "1973", event: "Vision for a theological seminary in India begins with Dr. Isaac John at Dallas Theological Seminary" },
    { year: "1978", event: "Evangelical Theological Seminary officially founded as part of Asian Christian Academy" },
    { year: "1983", event: "ETS transitions from mobile to residential seminary model" },
    { year: "2000s", event: "Expanded programs to Master's and Doctoral levels" },
    { year: "2010", event: "ATS becomes \"A Centre of Excellence in Asia\" according to ATBC" },
    { year: "Today", event: "Over 45 years of faithful theological education service" }
  ]

  return (
    <div className="min-h-screen">
      <PageHero
        title="About Evangelical Theological Seminary"
        description="Training faithful servants of Jesus Christ to proclaim the gospel and advance His kingdom throughout India and Asia."
        badge={{
          icon: Cross,
          text: "Our Story"
        }}
        gradient="red"
      />

      {/* Introduction Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <p className="text-sm font-semibold text-primary">The Only Baptist Seminary in North India</p>
                </div>
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                  Equipping Servants for Gospel Ministry
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  North India Baptist Seminary exists to train faithful men and women for gospel-centered ministry 
                  in one of the world's most spiritually needy regions. With over 400 million people in North India, 
                  the harvest is plentiful but the workers are few.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Since our founding in 2002, we have been committed to providing rigorous biblical education that 
                  is accessible to pastors and ministry leaders. Our unique modular format and bilingual instruction 
                  enable students to pursue theological training while remaining active in their local church ministries.
                </p>
                <Button asChild>
                  <Link href="/programs">
                    Explore Our Programs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&h=500&fit=crop"
                    alt="Seminary students studying Scripture"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Heritage & Beliefs */}
          <motion.div 
            className="max-w-6xl mx-auto mb-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                Our Heritage & Beliefs
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                ACA stands firmly on biblical truth and historic Baptist convictions, training servants who will faithfully proclaim the gospel.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {heritage.map((item, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow border-primary/10">
                    <CardHeader>
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-300 text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Distinctives */}
          <motion.div 
            className="max-w-6xl mx-auto mb-20"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                What Makes ACA Different
              </h2>
              <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Our unique approach to theological education combines academic rigor with ministry accessibility.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {distinctives.map((item, index) => (
                <motion.div key={index} variants={staggerItem}>
                  <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                          <item.icon className="h-6 w-6 text-accent" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div 
            className="max-w-4xl mx-auto mb-20"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                Our Journey
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                God's faithfulness through the years as He builds His church in North India.
              </p>
            </div>

            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-24">
                    <div className="px-3 py-1 bg-primary/10 rounded-full text-sm font-semibold text-primary text-center">
                      {item.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Card className="p-4">
                      <p className="text-slate-700 dark:text-slate-300">{item.event}</p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-white p-12">
              <div className="mb-6">
                <Cross className="h-12 w-12 mx-auto opacity-80" />
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Our Commitment
              </h2>
              <p className="text-lg leading-relaxed mb-8 opacity-95">
                "ACA exists to glorify God by training faithful servants who will proclaim the gospel, 
                plant churches, and shepherd God's people with biblical conviction and Christ-like compassion 
                throughout North India and beyond."
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="secondary" size="lg">
                  <Link href="/admissions">Apply Now</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 border-white/30 text-white">
                  <Link href="/contact">Visit Our Campus</Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
