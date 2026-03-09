"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users,
  MapPin,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  GraduationCap,
  PartyPopper,
  BookOpen
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: Date
  startTime?: string
  endTime?: string
  type: 'ACADEMIC' | 'HOLIDAY' | 'EXAM' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'OTHER'
  location?: string
  attendees?: number
  isPublic: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: Date
}

interface EventFormData {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  type: Event['type']
  location: string
  isPublic: boolean
  priority: Event['priority']
}

export default function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'ACADEMIC',
    location: '',
    isPublic: true,
    priority: 'MEDIUM'
  })
  const { toast } = useToast()

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/events')
      const result = await response.json()
      
      if (result.success) {
        // Convert string dates back to Date objects
        const eventsWithDates = result.data.map((event: {
          id: string;
          title: string;
          description: string;
          date: string;
          startTime?: string;
          endTime?: string;
          type: Event['type'];
          location?: string;
          isPublic: boolean;
          priority: Event['priority'];
          createdAt: string;
        }) => ({
          ...event,
          date: new Date(event.date),
          createdAt: new Date(event.createdAt)
        }))
        setEvents(eventsWithDates)
      } else {
        toast.error("Failed to load events", {
          description: result.error || "Something went wrong"
        })
      }
    } catch {
      toast.error("Failed to load events", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Filter events
  useEffect(() => {
    const filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'ALL' || event.type === filterType
      return matchesSearch && matchesFilter
    })
    setFilteredEvents(filtered)
  }, [events, searchTerm, filterType])

  const eventTypes = [
    { value: 'ACADEMIC', label: 'Academic', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
    { value: 'HOLIDAY', label: 'Holiday', icon: PartyPopper, color: 'bg-green-100 text-green-800' },
    { value: 'EXAM', label: 'Examination', icon: GraduationCap, color: 'bg-red-100 text-red-800' },
    { value: 'SPORTS', label: 'Sports', icon: Users, color: 'bg-orange-100 text-orange-800' },
    { value: 'CULTURAL', label: 'Cultural', icon: CalendarDays, color: 'bg-purple-100 text-purple-800' },
    { value: 'MEETING', label: 'Meeting', icon: Users, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'OTHER', label: 'Other', icon: Calendar, color: 'bg-gray-100 text-gray-800' }
  ]

  const getEventTypeInfo = (type: Event['type']) => {
    return eventTypes.find(t => t.value === type) || eventTypes[eventTypes.length - 1]
  }

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'ACADEMIC',
      location: '',
      isPublic: true,
      priority: 'MEDIUM'
    })
    setEditingEvent(null)
    setShowForm(false)
  }

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim() || !formData.date) {
      toast.error("Missing required fields", {
        description: "Please fill in title and date"
      })
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading(editingEvent ? "Updating event..." : "Creating event...")

    try {
      const method = editingEvent ? 'PUT' : 'POST'
      const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success(editingEvent ? "Event updated!" : "Event created!", {
          description: `${formData.title} has been ${editingEvent ? 'updated' : 'scheduled'} successfully`
        })
        
        resetForm()
        fetchEvents()
      } else {
        throw new Error(result.error || 'Operation failed')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Operation failed'
      toast.error(editingEvent ? "Update failed" : "Creation failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.toISOString().split('T')[0],
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      type: event.type,
      location: event.location || '',
      isPublic: event.isPublic,
      priority: event.priority
    })
    setEditingEvent(event)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) {
      return
    }

    const toastId = toast.loading("Deleting event...")

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Event deleted!", {
          description: `${event.title} has been removed`
        })
        fetchEvents()
      } else {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Delete failed'
      toast.error("Delete failed", {
        description: errorMessage
      })
    }
  }

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []
    const today = new Date()

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-slate-200 dark:border-slate-700"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString()

      days.push(
        <div
          key={day}
          className={`h-24 border border-slate-200 dark:border-slate-700 p-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
            isToday ? 'bg-primary/10 border-primary' : ''
          } ${isSelected ? 'bg-accent/10 border-accent' : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map(event => {
              const typeInfo = getEventTypeInfo(event.type)
              return (
                <div
                  key={event.id}
                  className={`text-xs px-1 py-0.5 rounded truncate ${typeInfo.color}`}
                  title={event.title}
                >
                  {event.title}
                </div>
              )
            })}
            {dayEvents.length > 2 && (
              <div className="text-xs text-slate-500 px-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const upcomingEvents = filteredEvents
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  const stats = {
    totalEvents: events.length,
    thisMonth: events.filter(e => 
      e.date.getMonth() === currentDate.getMonth() && 
      e.date.getFullYear() === currentDate.getFullYear()
    ).length,
    upcoming: events.filter(e => e.date >= new Date()).length,
    highPriority: events.filter(e => e.priority === 'HIGH').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            School Calendar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage school events, holidays, and important dates
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
          >
            {view === 'calendar' ? 'List View' : 'Calendar View'}
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border rounded-md"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar/List View */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {view === 'calendar' ? 'Calendar View' : 'Event List'}
                </CardTitle>
                {view === 'calendar' && (
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading events...</p>
                </div>
              ) : view === 'calendar' ? (
                <div>
                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-0 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-0">
                    {renderCalendar()}
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No events found</p>
                    </div>
                  ) : (
                    filteredEvents.map(event => {
                      const typeInfo = getEventTypeInfo(event.type)
                      return (
                        <div key={event.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                                <typeInfo.icon className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900 dark:text-white">
                                  {event.title}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {event.date.toLocaleDateString()}
                                  {event.startTime && ` • ${event.startTime}`}
                                  {event.endTime && ` - ${event.endTime}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(event.priority)}>
                                {event.priority}
                              </Badge>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(event)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.attendees && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{event.attendees} attendees</span>
                              </div>
                            )}
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map(event => {
                  const typeInfo = getEventTypeInfo(event.type)
                  return (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className={`p-1.5 rounded ${typeInfo.color}`}>
                        <typeInfo.icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{event.title}</div>
                        <div className="text-xs text-slate-500">
                          {event.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No upcoming events
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Types Legend */}
          <Card>
            <CardHeader>
              <CardTitle>Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {eventTypes.map(type => (
                  <div key={type.value} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${type.color}`}></div>
                    <span className="text-sm">{type.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Event description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <select 
                    id="type"
                    className="w-full p-2 border rounded-md"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as Event['type'])}
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Event location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <select 
                    id="priority"
                    className="w-full p-2 border rounded-md"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value as Event['priority'])}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPublic">Public Event</Label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
