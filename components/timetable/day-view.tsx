"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { EventType } from '@/lib/types'

interface DayViewProps {
  currentDate: Date
  events: EventType[]
  isLoading: boolean
}

export function DayView({ currentDate, events, isLoading }: DayViewProps) {
  const { toast } = useToast()
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  
  // Generate time slots from 8:00 AM to 5:00 PM
  useEffect(() => {
    const slots = []
    for (let i = 8; i <= 17; i++) {
      slots.push(`${i}:00`)
      slots.push(`${i}:30`)
    }
    setTimeSlots(slots)
  }, [])

  // Filter events for the current day
  const dayEvents = events.filter(event => {
    // Parse the date string manually to avoid timezone issues
    // Format is: YYYY-MM-DDTHH:mm:ss
    const dateStr = event.startTime.substring(0, 10) // Get YYYY-MM-DD part
    const [year, month, day] = dateStr.split('-').map(Number)
    
    return year === currentDate.getFullYear() &&
           month === currentDate.getMonth() + 1 &&
           day === currentDate.getDate()
  })

  // Group events by time slot
  const getEventsForTimeSlot = (timeSlot: string) => {
    const [hour, minute] = timeSlot.split(':').map(Number)
    return dayEvents.filter(event => {
      const eventTime = new Date(event.startTime)
      return eventTime.getHours() === hour && Math.floor(eventTime.getMinutes() / 30) * 30 === minute
    })
  }

  const handleEventClick = (event: EventType) => {
    toast({
      title: event.title,
      description: `${event.description || 'No description'} - ${format(new Date(event.startTime), 'h:mm a')} to ${format(new Date(event.endTime), 'h:mm a')}`,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-24 flex-1" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {timeSlots.map((timeSlot, index) => {
        const eventsForSlot = getEventsForTimeSlot(timeSlot)
        const [hour, minute] = timeSlot.split(':')
        const formattedTime = format(new Date().setHours(parseInt(hour), parseInt(minute)), 'h:mm a')
        
        return (
          <div key={index} className="flex items-start gap-4">
            <div className="w-20 text-right py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {formattedTime}
            </div>
            <div className="flex-1 min-h-[60px] border-t border-slate-200 dark:border-slate-700 relative pt-2">
              {eventsForSlot.length > 0 ? (
                <div className="space-y-2">
                  {eventsForSlot.map((event) => (
                    <Card 
                      key={event.id}
                      className={`cursor-pointer transition-transform hover:scale-[1.02] border-l-4 ${getEventBorderColor(event.type)}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <CardContent className="p-3">
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                        </div>
                        {event.location && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            📍 {event.location}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getEventBorderColor(type: string): string {
  switch (type) {
    case 'class':
      return 'border-blue-500'
    case 'exam':
      return 'border-red-500'
    case 'meeting':
      return 'border-purple-500'
    case 'holiday':
      return 'border-green-500'
    default:
      return 'border-gray-500'
  }
}
