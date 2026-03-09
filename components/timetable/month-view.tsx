"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { EventType } from '@/lib/types'

interface MonthViewProps {
  currentDate: Date
  events: EventType[]
  isLoading: boolean
  onDayClick?: (date: Date) => void
}

export function MonthView({ currentDate, events, isLoading, onDayClick }: MonthViewProps) {
  const { toast } = useToast()
  
  // Get days in month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Add days from previous month to start on Monday
  const startDay = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 // 0 is Sunday
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => 
    new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - (startDay - i))
  )

  // Add days from next month to fill the grid
  const endDay = monthEnd.getDay() === 0 ? 0 : 7 - monthEnd.getDay() // 0 is Sunday
  const nextMonthDays = Array.from({ length: endDay }, (_, i) => 
    new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + i + 1)
  )

  // Combine all days
  const calendarDays = [...prevMonthDays, ...monthDays, ...nextMonthDays]

  // Filter events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return isSameDay(eventDate, date)
    })
  }

  const handleEventClick = (event: EventType, e: React.MouseEvent) => {
    e.stopPropagation()
    toast({
      title: event.title,
      description: `${event.description || 'No description'} - ${format(new Date(event.startTime), 'h:mm a')}`,
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  // Get week days headers
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-2">
      {/* Weekdays header */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center p-2 font-medium text-slate-700 dark:text-slate-300">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isToday = isSameDay(day, new Date())
          const dayEvents = getEventsForDay(day)
          
          return (
            <div 
              key={i} 
              className={`min-h-[120px] p-1 border rounded-md ${
                isCurrentMonth 
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' 
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
              } ${isToday ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900' : ''}`}
              onClick={() => onDayClick && onDayClick(day)}
            >
              <div className={`text-right p-1 font-medium ${
                isCurrentMonth 
                  ? isToday 
                    ? 'text-primary'
                    : 'text-slate-900 dark:text-slate-100' 
                  : 'text-slate-400 dark:text-slate-500'
              }`}>
                {format(day, 'd')}
              </div>
              
              <ScrollArea className="h-[80px]">
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded cursor-pointer ${getEventBackgroundColor(event.type)}`}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-[10px] opacity-75">
                        {format(new Date(event.startTime), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {dayEvents.length > 3 && (
                <Badge variant="secondary" className="mt-1 text-[10px] w-full justify-center">
                  +{dayEvents.length - 3} more
                </Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getEventBackgroundColor(type: string): string {
  switch (type) {
    case 'class':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'exam':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'meeting':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    case 'holiday':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'
  }
}
