import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from 'lucide-react'
import Link from 'next/link'

type UpcomingEvent = {
  title: string
  date: string
  time: string
}

type Props = {
  upcomingEvents: UpcomingEvent[]
}

export function DashboardUpcomingEvents({ upcomingEvents }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {event.date} • {event.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50 text-slate-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming events</p>
            </div>
          )}
        </div>
        <Button variant="outline" className="w-full mt-4" asChild>
          <Link href="/dashboard/events">
            View All Events
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
