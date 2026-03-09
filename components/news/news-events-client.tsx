"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import { 
  Clock, 
  ArrowRight, 
  MapPin,
} from 'lucide-react'
import Image from 'next/image'

type NewsArticle = {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  image: string
  featured: boolean
}

type UpcomingEvent = {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
}

type NewsEventsClientProps = {
  newsArticles: NewsArticle[]
  upcomingEvents: UpcomingEvent[]
}

export function NewsEventsClient({ newsArticles, upcomingEvents }: NewsEventsClientProps) {
  // Fallback data if no news articles
  if (newsArticles.length === 0) {
    return (
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              No News Available
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Check back later for the latest updates and announcements.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const featuredArticle = newsArticles.find(article => article.featured) || newsArticles[0]
  const otherArticles = newsArticles.filter(article => !article.featured).slice(0, 6)

  return (
    <>
      {/* Featured News */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-12 text-slate-900 dark:text-white text-center">
              Featured News
            </h2>
            
            {/* Featured Article */}
            <Card className="overflow-hidden mb-12 shadow-xl">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-64 lg:h-auto">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-white">
                    {featuredArticle.category}
                  </Badge>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {new Date(featuredArticle.date).toLocaleDateString()}
                  </div>
                  <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  <Button variant="outline">
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Other News */}
          {otherArticles.length > 0 && (
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {otherArticles.map((article) => (
                <motion.div key={article.id} variants={staggerItem}>
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-3 left-3 bg-accent text-white text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        {new Date(article.date).toLocaleDateString()}
                      </div>
                      <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white">
                        {article.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                        {article.excerpt}
                      </p>
                      <Button variant="ghost" size="sm">
                        Read More
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              Upcoming Events
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Mark your calendars for these important school events
            </p>
          </motion.div>

          <motion.div 
            className="space-y-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <motion.div key={event.id} variants={staggerItem}>
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="md:w-1/4">
                        <div className="text-2xl font-bold text-primary">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="md:w-3/4">
                        <h3 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">
                          {event.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-3">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div variants={staggerItem}>
                <Card className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    No Upcoming Events
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Check back later for upcoming school events and activities.
                  </p>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  )
}
