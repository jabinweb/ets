// Event types for the timetable/calendar system
export type EventType = {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  location: string
  type: 'class' | 'exam' | 'meeting' | 'holiday' | 'other'
  recurring: boolean
  recurringPattern?: 'weekly' | 'daily' | 'monthly'
  subject?: {
    name: string
    code: string
  }
}

// Reminder types
export type ReminderType = {
  id: string
  userId: string
  eventId: string | null
  title: string
  description: string | null
  reminderTime: string
  eventTime: string | null
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}
