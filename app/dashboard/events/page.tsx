import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default async function DashboardEventsPage() {
  const events = await prisma.announcement.findMany({
    where: {
      type: "EVENT",
      isActive: true,
      publishDate: { gte: new Date() }
    },
    orderBy: { publishDate: "asc" }
  })

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white flex items-center gap-3">
        <Calendar className="h-7 w-7 text-primary" />
        Upcoming Events
      </h1>
      <div className="space-y-6">
        {events.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-slate-500 dark:text-slate-400">
              No upcoming events found.
            </CardContent>
          </Card>
        )}
        {events.map(event => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-700 dark:text-slate-300 mb-2">
                <span className="font-semibold">Date:</span>{" "}
                {event.publishDate.toLocaleDateString()}{" "}
                <span className="ml-2 font-semibold">Time:</span>{" "}
                {event.publishDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                {event.content}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
