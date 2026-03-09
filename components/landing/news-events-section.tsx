"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import { Calendar, Clock, ArrowRight, MapPin, Loader2 } from 'lucide-react'
import Link from 'next/link'

type NewsItem = {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
}

type EventItem = {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  type: string
}

// Format events data
// Define an interface for the raw event data from the API
interface ApiEvent {
  id: string
  title: string
  publishDate: string
  location?: string
  content: string
}

// Format news data
interface ApiNewsItem {
  id: string
  title: string
  content: string
  createdAt: string
  type: string
}

export function NewsEventsSection() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNewsAndEvents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/public/news-events')
        
        if (!response.ok) {
          throw new Error('Failed to fetch news and events')
        }
        
        const data = await response.json()
        
        // Check if data has the expected structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format')
        }

        // Safely map news data
        if (Array.isArray(data.news) && data.news.length > 0) {
          setNews(
            data.news.map((item: ApiNewsItem): NewsItem => ({
              id: item.id,
              title: item.title,
              excerpt:
                item.content.length > 100
                  ? item.content.substring(0, 100) + '...'
                  : item.content,
              date: new Date(item.createdAt).toISOString(),
              category: item.type,
            }))
          )
        } else {
          setNews([])
        }

        // Safely map events data
        if (Array.isArray(data.events) && data.events.length > 0) {
          setEvents(
            data.events.map((event: ApiEvent): EventItem => ({
              id: event.id,
              title: event.title,
              date: new Date(event.publishDate).toISOString(),
              time: new Date(event.publishDate).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
              location: event.location || 'School Campus',
              description:
                event.content.length > 100
                  ? event.content.substring(0, 100) + '...'
                  : event.content,
              type: 'Event',
            }))
          )
        } else {
          setEvents([])
        }

      } catch (err) {
        console.error('Error fetching news and events:', err)
        setError('Failed to load latest news and events')
        
        // Fallback to empty arrays
        setNews([])
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewsAndEvents()
  }, [])

  // Render loading state
  if (isLoading) {
    return (
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate-600 dark:text-slate-400">Loading latest news and events...</p>
        </div>
      </section>
    )
  }

  // Render error state
  if (error) {
    return (
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
              Latest <span className="text-accent">News & Events</span>
            </h2>
            <p className="text-xl text-slate-500 dark:text-slate-400">
              {error}
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

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
            <Calendar className="h-4 w-4 text-accent mr-2" />
            <span className="text-sm font-medium text-accent">Stay Connected</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
            Latest <span className="text-accent">News & Events</span>
          </h2>
          <p className="text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto">
            Stay updated with the latest happenings at our school.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* News Section */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <div className="w-4 h-4 bg-primary rounded-full mr-3"></div>
              Latest News
            </h3>
            <motion.div 
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {news.length === 0 ? (
                <Card className="bg-slate-50 dark:bg-slate-800">
                  <CardContent className="p-6 text-center">
                    <p className="text-slate-600 dark:text-slate-400">No news articles found</p>
                  </CardContent>
                </Card>
              ) : (
                news.slice(0, 3).map((item) => (
                  <motion.div key={item.id} variants={staggerItem}>
                    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-slate-50 dark:bg-slate-800">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-sm text-slate-700 dark:text-slate-400">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                          {item.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/news">
                View All News <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Events Section */}
          <motion.div
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
              <div className="w-4 h-4 bg-accent rounded-full mr-3"></div>
              Upcoming Events
            </h3>
            <motion.div 
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {events.length === 0 ? (
                <Card className="bg-slate-50 dark:bg-slate-800">
                  <CardContent className="p-6 text-center">
                    <p className="text-slate-600 dark:text-slate-400">No upcoming events found</p>
                  </CardContent>
                </Card>
              ) : (
                events.slice(0, 3).map((event) => (
                  <motion.div key={event.id} variants={staggerItem}>
                    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-slate-50 dark:bg-slate-800">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs border-accent text-accent">
                            {event.type}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-slate-700 dark:text-slate-400 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {event.time}
                            </div>
                          </div>
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-accent transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                          {event.description}
                        </p>
                        <div className="flex items-center text-xs text-slate-700 dark:text-slate-400">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/events">
                View All Events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
