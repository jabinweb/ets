import Image from 'next/image'
// remove Link import
// import Link from 'next/link'
import { prisma } from "@/lib/prisma"
import { PageHero } from "@/components/ui/page-hero"
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock } from 'lucide-react'

async function getNewsAndEvents() {
  try {
    // Fetch upcoming events from announcements of type EVENT
    const upcomingEvents = await prisma.announcement.findMany({
      where: {
        type: "EVENT",
        isActive: true,
        publishDate: {
          gte: new Date() // Only future events
        }
      },
      orderBy: {
        publishDate: 'asc'
      },
      take: 10 // Limit to 10 upcoming events
    })

    // Fetch recent news from general announcements
    const newsArticles = await prisma.announcement.findMany({
      where: {
        type: {
          in: ["GENERAL", "ACADEMIC", "URGENT"]
        },
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to 10 recent news
    })

    // Transform events data
    const formattedEvents = upcomingEvents.map(event => ({
      id: event.id,
      title: event.title,
      date: event.publishDate.toISOString(),
      time: event.publishDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      location: "Seminary Campus", // Default location since we don't have location field
      description: event.content
    }))

    // Transform news data
    const formattedNews = newsArticles.map((article, index) => ({
      id: article.id,
      title: article.title,
      excerpt: article.content.length > 150
        ? article.content.substring(0, 150) + "..."
        : article.content,
      date: article.createdAt.toISOString(),
      category: article.type === "ACADEMIC" ? "Academic" :
        article.type === "URGENT" ? "Important" : "General",
      image: `https://images.unsplash.com/photo-${index % 4 === 0 ? '1562774053-701939374585' :
          index % 4 === 1 ? '1581726690015-c9861251f35f' :
            index % 4 === 2 ? '1503676260728-1c00da094a0b' :
              '1427504494785-3a9ca7044f45'
        }?w=600&auto=format&fit=crop&q=80`,
      featured: index === 0 // First article is featured
    }))

    return {
      newsArticles: formattedNews,
      upcomingEvents: formattedEvents
    }
  } catch (error) {
    console.error('Error fetching news and events:', error)
    // Return empty arrays as fallback
    return {
      newsArticles: [],
      upcomingEvents: []
    }
  }
}

export default async function NewsPage() {
  const { newsArticles, upcomingEvents } = await getNewsAndEvents()
  const [featured, ...others] = newsArticles

  return (
    <div className="min-h-screen">
      <PageHero
        title="News & Events"
        description="Stay updated with the latest happenings and upcoming events at Greenwood High."
        badge={{ iconName: "Newspaper", text: "Latest Updates" }}
        gradient="orange"
      />

      <main className="container mx-auto px-4 py-24 space-y-24">
        {/* Featured News */}
        {featured && (
          <section>
            <Card className="lg:flex overflow-hidden shadow-xl">
              <div className="relative lg:w-1/2 h-64 lg:h-auto">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-primary text-white">
                  {featured.category}
                </Badge>
              </div>
              <CardContent className="lg:w-1/2 p-8">
                <div className="text-sm text-slate-500 mb-2">
                  {new Date(featured.date).toLocaleDateString()}
                </div>
                <h2 className="text-3xl font-bold mb-4">{featured.title}</h2>
                <p className="text-lg text-slate-600 mb-6">{featured.excerpt}</p>

              </CardContent>
            </Card>
          </section>
        )}

        {/* More News Grid */}
        {others.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold mb-6">More News</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {others.slice(0, 6).map(item => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-600 mb-4">{item.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* single CTA for all news */}
            <div className="mt-8 text-center">
              <button className="inline-block text-primary font-semibold">
                View All News →
              </button>
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section>
            <h3 className="text-2xl font-bold mb-6">Upcoming Events</h3>
            <div className="space-y-6">
              {upcomingEvents.slice(0, 5).map(evt => (
                <Card key={evt.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-6">
                    <div className="text-center w-20">
                      <div className="text-2xl font-bold text-primary">
                        {new Date(evt.date).getDate()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-xl mb-2">{evt.title}</h4>
                      <p className="text-sm text-slate-600 mb-2">{evt.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {evt.time}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {evt.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}