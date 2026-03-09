"use client"

import { useState, useEffect } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { CalendarHeader } from '@/components/timetable/calendar-header'
import { DayView } from '@/components/timetable/day-view'
import { WeekView } from '@/components/timetable/week-view'
import { MonthView } from '@/components/timetable/month-view'
import { ReminderSidebar } from '@/components/timetable/reminder-sidebar'
import { EventType, ReminderType } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export default function TimetablePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [events, setEvents] = useState<EventType[]>([])
  const [reminders, setReminders] = useState<ReminderType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Fetch events data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Calculate date range based on current view
        let startDate: Date
        let endDate: Date
        
        if (view === 'day') {
          startDate = new Date(currentDate)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(currentDate)
          endDate.setHours(23, 59, 59, 999)
        } else if (view === 'week') {
          startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
          endDate = endOfWeek(currentDate, { weekStartsOn: 1 })
          // Ensure we include the full day
          endDate.setHours(23, 59, 59, 999)
        } else {
          startDate = startOfMonth(currentDate)
          endDate = endOfMonth(currentDate)
        }
        
        console.log('Fetching events from', startDate.toISOString(), 'to', endDate.toISOString())
        
        const response = await fetch(`/api/timetable/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)
        const data = await response.json()
        
        if (data.success) {
          setEvents(data.events)
        } else {
          toast({
            variant: "destructive",
            title: "Failed to load events",
            description: data.error
          })
        }
        
        // Fetch user reminders (announcements marked for the user)
        const reminderResponse = await fetch('/api/timetable/reminders')
        const reminderData = await reminderResponse.json()
        
        if (reminderData.success) {
          // Transform UserAnnouncement data to ReminderType format
          interface UserAnnouncementItem {
            id: string
            userId: string
            announcementId: string
            isRead: boolean
            announcement?: {
              title: string
              content: string
              publishDate: string
              createdAt: string
              updatedAt: string
            }
          }
          
          const transformedReminders = reminderData.reminders.map((item: UserAnnouncementItem) => ({
            id: item.id,
            userId: item.userId,
            eventId: item.announcementId,
            title: item.announcement?.title || 'Reminder',
            description: item.announcement?.content || null,
            reminderTime: item.announcement?.publishDate || new Date().toISOString(),
            eventTime: item.announcement?.publishDate || null,
            isCompleted: item.isRead,
            createdAt: item.announcement?.createdAt || new Date().toISOString(),
            updatedAt: item.announcement?.updatedAt || new Date().toISOString()
          }))
          setReminders(transformedReminders)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load timetable",
          description: "Please check your connection and try again"
        })
        console.error("Error loading timetable:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentDate, view, toast])

  // Create a new reminder (only for announcements)
  const handleCreateReminder = async (eventId: string) => {
    try {
      // Extract announcement ID from event ID (format: announcement-{announcementId})
      if (!eventId.startsWith('announcement-')) {
        toast({
          variant: "destructive",
          title: "Cannot create reminder",
          description: "Reminders can only be set for announcements"
        })
        return
      }
      
      const announcementId = eventId.replace('announcement-', '')
      
      const response = await fetch('/api/timetable/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          announcementId: announcementId
        })
      })
      
      const data = await response.json()
      if (data.success) {
        // Transform UserAnnouncement to ReminderType
        const newReminder: ReminderType = {
          id: data.reminder.id,
          userId: data.reminder.userId,
          eventId: data.reminder.announcementId,
          title: data.reminder.announcement?.title || 'Reminder',
          description: data.reminder.announcement?.content || null,
          reminderTime: new Date().toISOString(),
          eventTime: data.reminder.announcement?.publishDate || null,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        setReminders([...reminders, newReminder])
        toast({
          title: "Reminder created",
          description: "Your reminder has been set successfully"
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create reminder",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  // Delete a reminder
  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/timetable/reminders/${reminderId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        setReminders(reminders.filter(r => r.id !== reminderId))
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete reminder",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Timetable & Schedule</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">View your class schedule and upcoming events</p>
      </div>
      
      <CalendarHeader 
        currentDate={currentDate} 
        onDateChange={setCurrentDate} 
        view={view} 
        onViewChange={setView} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="col-span-1 lg:col-span-3 order-2 lg:order-1">
          {view === 'day' && (
            <DayView 
              currentDate={currentDate} 
              events={events} 
              isLoading={isLoading} 
            />
          )}
          {view === 'week' && (
            <WeekView 
              currentDate={currentDate} 
              events={events} 
              isLoading={isLoading}
              onDayClick={(date) => {
                setCurrentDate(date)
                setView('day')
              }}
            />
          )}
          {view === 'month' && (
            <MonthView 
              currentDate={currentDate} 
              events={events} 
              isLoading={isLoading} 
              onDayClick={(date) => {
                setCurrentDate(date)
                setView('day')
              }}
            />
          )}
        </div>
        <div className="col-span-1 order-1 lg:order-2">
          <ReminderSidebar 
            events={events} 
            reminders={reminders} 
            onCreateReminder={handleCreateReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        </div>
      </div>
    </div>
  )
}
