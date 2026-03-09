"use client"

import { useState } from 'react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  onViewChange: (view: 'day' | 'week' | 'month') => void
  view: 'day' | 'week' | 'month'
}

export function CalendarHeader({ currentDate, onDateChange, onViewChange, view }: CalendarHeaderProps) {
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>(view)

  const handleViewChange = (value: string) => {
    const newView = value as 'day' | 'week' | 'month'
    setSelectedView(newView)
    onViewChange(newView)
  }

  const handlePrevious = () => {
    if (view === 'day') {
      onDateChange(new Date(currentDate.setDate(currentDate.getDate() - 1)))
    } else if (view === 'week') {
      onDateChange(subWeeks(currentDate, 1))
    } else {
      onDateChange(subMonths(currentDate, 1))
    }
  }

  const handleNext = () => {
    if (view === 'day') {
      onDateChange(new Date(currentDate.setDate(currentDate.getDate() + 1)))
    } else if (view === 'week') {
      onDateChange(addWeeks(currentDate, 1))
    } else {
      onDateChange(addMonths(currentDate, 1))
    }
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const getHeaderText = () => {
    if (view === 'day') {
      return format(currentDate, 'PPPP')
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    } else {
      return format(currentDate, 'MMMM yyyy')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 w-full sm:w-auto">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleToday} className="text-xs sm:text-sm">
            Today
          </Button>
          <div className="flex items-center">
          <Button size="icon" variant="ghost" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        </div>
        <div className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <span className="text-sm sm:text-base md:text-lg">{getHeaderText()}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <Select value={selectedView} onValueChange={handleViewChange}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
