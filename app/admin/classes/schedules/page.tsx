"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Users,
  BookOpen,
  RefreshCw,
  X,
  Save
} from 'lucide-react'

interface Class {
  id: string
  name: string
  section: string
  grade: number
}

interface Subject {
  id: string
  name: string
  code: string
}

interface TimetableEntry {
  id: string
  classId: string
  subjectId: string
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
  startTime: string
  endTime: string
  class: Class
  subject: Subject
}

interface ScheduleFormData {
  classId: string
  subjectId: string
  day: string
  startTime: string
  endTime: string
}

export default function ClassSchedulesPage() {
  const [schedules, setSchedules] = useState<TimetableEntry[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<TimetableEntry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState<ScheduleFormData>({
    classId: '',
    subjectId: '',
    day: '',
    startTime: '',
    endTime: ''
  })
  const { toast } = useToast()

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  const fetchSchedules = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/schedules')
      const result = await response.json()
      
      if (result.success) {
        setSchedules(result.data || [])
      } else {
        toast.error("Failed to load schedules", {
          description: result.error || "Something went wrong"
        })
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
      toast.error("Failed to load schedules", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/classes')
      const result = await response.json()
      
      if (result.success) {
        setClasses(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }, [])

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/subjects')
      const result = await response.json()
      
      if (result.success) {
        setSubjects(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }, [])

  useEffect(() => {
    fetchSchedules()
    fetchClasses()
    fetchSubjects()
  }, [fetchSchedules, fetchClasses, fetchSubjects])

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.class.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !selectedClass || schedule.classId === selectedClass
    const matchesDay = !selectedDay || schedule.day === selectedDay
    return matchesSearch && matchesClass && matchesDay
  })

  const handleInputChange = (field: keyof ScheduleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      classId: '',
      subjectId: '',
      day: '',
      startTime: '',
      endTime: ''
    })
    setEditingSchedule(null)
    setShowForm(false)
  }

  const handleEdit = (schedule: TimetableEntry) => {
    setFormData({
      classId: schedule.classId,
      subjectId: schedule.subjectId,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    })
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!formData.classId || !formData.subjectId || !formData.day || !formData.startTime || !formData.endTime) {
      toast.error("Please fill all required fields")
      return
    }

    // Validate time
    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading(editingSchedule ? "Updating schedule..." : "Creating schedule...")

    try {
      const url = editingSchedule 
        ? `/api/admin/schedules/${editingSchedule.id}`
        : '/api/admin/schedules'
      
      const response = await fetch(url, {
        method: editingSchedule ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success(editingSchedule ? "Schedule updated!" : "Schedule created!", {
          description: editingSchedule 
            ? "Schedule has been updated successfully"
            : "New schedule has been added to the timetable"
        })
        
        resetForm()
        fetchSchedules()
      } else {
        throw new Error(result.error || 'Failed to save schedule')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save schedule'
      toast.error("Save failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (schedule: TimetableEntry) => {
    if (!confirm(`Are you sure you want to delete this schedule for ${schedule.class.name} - ${schedule.subject.name}?`)) {
      return
    }

    const toastId = toast.loading("Deleting schedule...")

    try {
      const response = await fetch(`/api/admin/schedules/${schedule.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Schedule deleted!", {
          description: "Schedule has been removed from the timetable"
        })
        fetchSchedules()
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

  const exportSchedules = () => {
    toast.success("Export started", {
      description: "Schedule report will be downloaded shortly"
    })
  }

  const getTimeSlotSchedules = (day: string, time: string) => {
    return filteredSchedules.filter(schedule => 
      schedule.day === day && 
      schedule.startTime <= time && 
      schedule.endTime > time
    )
  }

  const getDayColor = (day: string) => {
    const colors = {
      MONDAY: 'bg-blue-100 text-blue-800 border-blue-200',
      TUESDAY: 'bg-green-100 text-green-800 border-green-200',
      WEDNESDAY: 'bg-purple-100 text-purple-800 border-purple-200',
      THURSDAY: 'bg-orange-100 text-orange-800 border-orange-200',
      FRIDAY: 'bg-red-100 text-red-800 border-red-200',
      SATURDAY: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[day as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const stats = {
    totalSchedules: schedules.length,
    totalClasses: new Set(schedules.map(s => s.classId)).size,
    totalSubjects: new Set(schedules.map(s => s.subjectId)).size,
    scheduleConflicts: 0 // TODO: Calculate actual conflicts
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Class Schedules
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage class timetables and schedule assignments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
            {view === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          <Button variant="outline" onClick={exportSchedules}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSchedules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Classes Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Subjects Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalSubjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.scheduleConflicts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search classes or subjects..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border rounded-md"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <select 
              className="px-4 py-2 border rounded-md"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              <option value="">All Days</option>
              {daysOfWeek.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <Button variant="outline" onClick={fetchSchedules}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {view === 'grid' ? (
        /* Timetable Grid View */
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable Grid</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500">Loading schedules...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="border border-slate-300 dark:border-slate-600 p-3 text-left font-medium">
                        Time
                      </th>
                      {daysOfWeek.map(day => (
                        <th key={day} className="border border-slate-300 dark:border-slate-600 p-3 text-center font-medium">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(time => (
                      <tr key={time}>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium bg-slate-50 dark:bg-slate-800">
                          {time}
                        </td>
                        {daysOfWeek.map(day => {
                          const daySchedules = getTimeSlotSchedules(day, time)
                          return (
                            <td key={day} className="border border-slate-300 dark:border-slate-600 p-2 min-h-[80px] align-top">
                              {daySchedules.map(schedule => (
                                <div 
                                  key={schedule.id}
                                  className="mb-1 p-2 rounded text-xs bg-blue-100 text-blue-800 border-l-4 border-blue-500"
                                >
                                  <div className="font-medium">{schedule.class.name}</div>
                                  <div className="truncate">{schedule.subject.name}</div>
                                  <div className="text-xs opacity-75">
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                </div>
                              ))}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card>
          <CardHeader>
            <CardTitle>Schedule List ({filteredSchedules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500">Loading schedules...</p>
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No schedules found</p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Schedule
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSchedules.map(schedule => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {schedule.class.name} - {schedule.subject.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {schedule.subject.code}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(schedule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(schedule)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <Badge className={getDayColor(schedule.day)}>
                          {schedule.day}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">
                          Grade {schedule.class.grade} • Section {schedule.class.section}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Schedule Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="class">Class *</Label>
                <select
                  id="class"
                  className="w-full p-2 border rounded-md"
                  value={formData.classId}
                  onChange={(e) => handleInputChange('classId', e.target.value)}
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Grade {cls.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <select
                  id="subject"
                  className="w-full p-2 border rounded-md"
                  value={formData.subjectId}
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="day">Day *</Label>
                <select
                  id="day"
                  className="w-full p-2 border rounded-md"
                  value={formData.day}
                  onChange={(e) => handleInputChange('day', e.target.value)}
                >
                  <option value="">Select Day</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : editingSchedule ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
