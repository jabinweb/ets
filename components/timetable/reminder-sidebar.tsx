"use client"

import { useState } from 'react'
import { format, isToday, isTomorrow, isSameWeek, isPast } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Bell, BellOff } from 'lucide-react'
import { EventType, ReminderType } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface ReminderSidebarProps {
  events: EventType[]
  reminders: ReminderType[]
  onCreateReminder: (eventId: string) => void
  onDeleteReminder: (reminderId: string) => void
}

export function ReminderSidebar({ 
  events, 
  reminders, 
  onCreateReminder, 
  onDeleteReminder 
}: ReminderSidebarProps) {
  const [activeTab, setActiveTab] = useState('upcoming')
  const { toast } = useToast()
  
  // Filter to only announcement/meeting events (which have actual announcement IDs)
  // Classes and exams don't have announcements, so reminders can't be created for them
  const reminderableEvents = events.filter(event => 
    event.type === 'meeting' && event.id.startsWith('announcement-')
  )
  
  // Get events for today (all types for display)
  const todayEvents = events
    .filter(event => isToday(new Date(event.startTime)))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // Get events for tomorrow
  const tomorrowEvents = events
    .filter(event => isTomorrow(new Date(event.startTime)))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // Get events for this week (excluding today and tomorrow)
  const thisWeekEvents = events
    .filter(event => {
      const eventDate = new Date(event.startTime)
      return isSameWeek(eventDate, new Date()) && !isToday(eventDate) && !isTomorrow(eventDate)
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // Check if an event has a reminder
  const hasReminder = (eventId: string) => {
    return reminders.some(reminder => reminder.eventId === eventId)
  }
  
  // Check if an event can have a reminder (only announcements)
  const canHaveReminder = (event: EventType) => {
    return event.type === 'meeting' && event.id.startsWith('announcement-')
  }

  // Handle reminder toggle
  const toggleReminder = (eventId: string, hasExistingReminder: boolean) => {
    if (hasExistingReminder) {
      const reminder = reminders.find(r => r.eventId === eventId)
      if (reminder) {
        onDeleteReminder(reminder.id)
        toast.success("Reminder removed", {
          description: "You will no longer be notified for this event"
        })
      }
    } else {
      onCreateReminder(eventId)
      toast.success("Reminder set", {
        description: "You will be notified before this event"
      })
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Reminders & Upcoming
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mx-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          
          {/* Upcoming Events Tab */}
          <TabsContent value="upcoming" className="p-4 pt-6">
            <div className="space-y-6">
              {todayEvents.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Badge variant="default" className="rounded-sm">Today</Badge>
                  </h3>
                  <div className="space-y-2">
                    {todayEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        hasReminder={hasReminder(event.id)} 
                        canHaveReminder={canHaveReminder(event)}
                        onToggleReminder={toggleReminder}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {tomorrowEvents.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Badge variant="outline">Tomorrow</Badge>
                  </h3>
                  <div className="space-y-2">
                    {tomorrowEvents.map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        hasReminder={hasReminder(event.id)} 
                        canHaveReminder={canHaveReminder(event)}
                        onToggleReminder={toggleReminder}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {thisWeekEvents.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Badge variant="secondary">This Week</Badge>
                  </h3>
                  <div className="space-y-2">
                    {thisWeekEvents.slice(0, 3).map(event => (
                      <EventCard 
                        key={event.id} 
                        event={event} 
                        hasReminder={hasReminder(event.id)} 
                        canHaveReminder={canHaveReminder(event)}
                        onToggleReminder={toggleReminder}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {todayEvents.length === 0 && tomorrowEvents.length === 0 && thisWeekEvents.length === 0 && (
                <div className="text-center p-6">
                  <CalendarIcon className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h3 className="font-medium text-slate-600 dark:text-slate-400">No upcoming events</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Your schedule is clear for now
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Reminders Tab */}
          <TabsContent value="reminders" className="p-4 pt-6">
            {reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.map(reminder => {
                  const event = events.find(e => e.id === reminder.eventId)
                  if (!event) return null
                  
                  return (
                    <div key={reminder.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                      <div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          {reminder.reminderTime && format(new Date(reminder.reminderTime), "MMM d, h:mm a")}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => onDeleteReminder(reminder.id)}
                      >
                        <BellOff className="h-4 w-4 text-slate-500 hover:text-red-500" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center p-6">
                <Bell className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="font-medium text-slate-600 dark:text-slate-400">No reminders set</h3>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Add reminders for important events
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface EventCardProps {
  event: EventType
  hasReminder: boolean
  canHaveReminder: boolean
  onToggleReminder: (eventId: string, hasReminder: boolean) => void
}

function EventCard({ event, hasReminder, canHaveReminder, onToggleReminder }: EventCardProps) {
  const isPastEvent = isPast(new Date(event.endTime)) && !isToday(new Date(event.startTime))
  
  return (
    <div 
      className={`p-2 rounded-md border ${
        isPastEvent 
          ? 'border-slate-200 dark:border-slate-700 opacity-60' 
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-medium text-sm">{event.title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {format(new Date(event.startTime), "h:mm a")} • {event.location || 'No location'}
          </div>
        </div>
        {canHaveReminder && (
          <Button 
            size="sm" 
            variant="ghost"
            className="h-8 w-8 p-0"
            disabled={isPastEvent}
            onClick={() => onToggleReminder(event.id, hasReminder)}
          >
            {hasReminder ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <Bell className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            )}
          </Button>
        )}
      </div>
      
      {event.type && (
        <Badge className={`mt-1 text-xs ${getBadgeColor(event.type)}`}>
          {event.type}
        </Badge>
      )}
    </div>
  )
}

function getBadgeColor(type: string): string {
  switch (type) {
    case 'class':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    case 'exam':
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    case 'meeting':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
    case 'holiday':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
  }
}
