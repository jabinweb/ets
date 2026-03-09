"use client"

import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { EventType } from '@/lib/types'
import { Clock, MapPin } from 'lucide-react'

interface WeekViewProps {
  currentDate: Date
  events: EventType[]
  isLoading: boolean
  onDayClick?: (date: Date) => void
}

export function WeekView({ currentDate, events, isLoading, onDayClick }: WeekViewProps) {
  const { toast } = useToast()
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 })
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i))
  const today = new Date()
  
  const handleEventClick = (event: EventType) => {
    toast({
      title: event.title,
      description: `${format(new Date(event.startTime), 'h:mm a')} - ${format(new Date(event.endTime), 'h:mm a')}`,
    })
  }
  
  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const dateStr = event.startTime.substring(0, 10)
      const [year, month, day] = dateStr.split('-').map(Number)
      return year === date.getFullYear() &&
             month === date.getMonth() + 1 &&
             day === date.getDate()
    }).sort((a, b) => {
      // Sort by time string directly without Date conversion to avoid timezone issues
      return a.startTime.localeCompare(b.startTime)
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-[500px] rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Day Headers */}
      <div className="hidden md:grid md:grid-cols-7 gap-2 lg:gap-3">
        {daysOfWeek.map((day, index) => {
          const isToday = isSameDay(day, today)
          const eventsCount = getEventsForDay(day).length
          
          return (
            <div
              key={index}
              onClick={() => onDayClick?.(day)}
              className={`p-3 lg:p-4 rounded-xl text-center transition-all ${
                isToday
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800/70'
              } ${onDayClick ? 'cursor-pointer' : ''}`}
            >
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                isToday ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-xl lg:text-2xl font-bold ${
                isToday ? 'text-white' : 'text-slate-100'
              }`}>
                {format(day, 'd')}
              </div>
              {eventsCount > 0 && (
                <div className={`mt-2 text-xs font-medium ${
                  isToday ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  {eventsCount} {eventsCount === 1 ? 'class' : 'classes'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: Horizontal scroll view */}
      <div className="md:hidden overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-2 min-w-max">
          {daysOfWeek.map((day, index) => {
            const isToday = isSameDay(day, today)
            const eventsCount = getEventsForDay(day).length
            
            return (
              <div
                key={index}
                onClick={() => onDayClick?.(day)}
                className={`p-3 rounded-xl text-center transition-all min-w-[80px] ${
                  isToday
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/50 text-slate-300 active:bg-slate-800/70'
                } ${onDayClick ? 'cursor-pointer' : ''}`}
              >
                <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  isToday ? 'text-blue-100' : 'text-slate-500'
                }`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-xl font-bold ${
                  isToday ? 'text-white' : 'text-slate-100'
                }`}>
                  {format(day, 'd')}
                </div>
                {eventsCount > 0 && (
                  <div className={`mt-1 text-xs font-medium ${
                    isToday ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {eventsCount}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Events Grid - Desktop */}
      <div className="hidden md:grid md:grid-cols-7 gap-2 lg:gap-3">
        {daysOfWeek.map((day, dayIndex) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          const isPast = day < today && !isToday
          
          return (
            <div
              key={dayIndex}
              className={`rounded-xl p-3 min-h-[500px] ${
                isToday
                  ? 'bg-blue-600/5 ring-2 ring-blue-600/20'
                  : 'bg-slate-800/30'
              }`}
            >
              <div className="space-y-2 h-full overflow-y-auto pr-1 custom-scrollbar">
                {dayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600">
                    <svg className="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">No classes</span>
                  </div>
                ) : (
                  dayEvents.map((event) => (
                    <Card
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`group cursor-pointer border-l-4 transition-all hover:shadow-lg ${
                        isPast ? 'opacity-60' : 'hover:translate-x-1'
                      } ${getEventStyles(event.type)}`}
                    >
                      <div className="p-3">
                        <div className="mb-2">
                          <h4 className="text-sm font-semibold text-slate-100 leading-tight line-clamp-2 mb-1">
                            {event.title}
                          </h4>
                          <span className={`text-[10px] font-medium uppercase tracking-wide ${getEventTextColor(event.type)}`}>
                            {event.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{format(new Date(event.startTime), 'h:mm a')}</span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: List View */}
      <div className="md:hidden space-y-3">
        {daysOfWeek.map((day, dayIndex) => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, today)
          
          if (dayEvents.length === 0) return null
          
          return (
            <div key={dayIndex} className="space-y-2">
              <div className={`text-sm font-semibold px-2 py-1 rounded ${
                isToday ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400'
              }`}>
                {format(day, 'EEEE, MMM d')}
              </div>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <Card
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={`group cursor-pointer border-l-4 transition-all active:scale-98 ${getEventStyles(event.type)}`}
                  >
                    <div className="p-3">
                      <div className="mb-2">
                        <h4 className="text-sm font-semibold text-slate-100 leading-tight mb-1">
                          {event.title}
                        </h4>
                        <span className={`text-[10px] font-medium uppercase tracking-wide ${getEventTextColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{format(new Date(event.startTime), 'h:mm a')}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
        {daysOfWeek.every(day => getEventsForDay(day).length === 0) && (
          <div className="text-center py-12 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">No classes this week</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getEventStyles(type: string): string {
  switch (type) {
    case 'class':
      return 'bg-slate-800/60 border-l-blue-500 hover:bg-slate-800/80'
    case 'exam':
      return 'bg-slate-800/60 border-l-red-500 hover:bg-slate-800/80'
    case 'meeting':
      return 'bg-slate-800/60 border-l-purple-500 hover:bg-slate-800/80'
    case 'holiday':
      return 'bg-slate-800/60 border-l-green-500 hover:bg-slate-800/80'
    default:
      return 'bg-slate-800/60 border-l-slate-500 hover:bg-slate-800/80'
  }
}

function getEventTextColor(type: string): string {
  switch (type) {
    case 'class':
      return 'text-blue-400'
    case 'exam':
      return 'text-red-400'
    case 'meeting':
      return 'text-purple-400'
    case 'holiday':
      return 'text-green-400'
    default:
      return 'text-slate-400'
  }
}
