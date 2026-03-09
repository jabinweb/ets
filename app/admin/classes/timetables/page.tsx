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
  Download,
  BookOpen,
  RefreshCw,
  X,
  Save,
  Grid,
  List,
  AlertTriangle
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

interface Teacher {
  id: string
  name: string
}

interface TimetableEntry {
  id: string
  classId: string
  subjectId: string
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'
  startTime: string
  endTime: string
  class: Class
  subject: Subject & { teacher?: Teacher }
}

interface TimetableFormData {
  classId: string
  subjectId: string
  day: string
  startTime: string
  endTime: string
}

const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00'
]

export default function TimetablesPage() {
  const [timetables, setTimetables] = useState<TimetableEntry[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState<TimetableFormData>({
    classId: '',
    subjectId: '',
    day: '',
    startTime: '',
    endTime: ''
  })
  const { toast } = useToast()

  const fetchTimetables = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedClass) params.append('classId', selectedClass)
      
      const response = await fetch(`/api/admin/timetables?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setTimetables(result.data || [])
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load timetables",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching timetables:', error)
      toast({
        title: "Error",
        description: "Failed to load timetables",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [selectedClass, toast])

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
    fetchTimetables()
    fetchClasses()
    fetchSubjects()
  }, [fetchTimetables, fetchClasses, fetchSubjects])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.classId || !formData.subjectId || !formData.day || !formData.startTime || !formData.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const endpoint = editingEntry 
        ? `/api/admin/timetables/${editingEntry.id}`
        : '/api/admin/timetables'
      
      const method = editingEntry ? 'PATCH' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: editingEntry 
            ? "Timetable entry updated successfully" 
            : "Timetable entry created successfully"
        })
        
        setShowForm(false)
        setEditingEntry(null)
        setFormData({
          classId: '',
          subjectId: '',
          day: '',
          startTime: '',
          endTime: ''
        })
        fetchTimetables()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save timetable entry",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving timetable:', error)
      toast({
        title: "Error",
        description: "Failed to save timetable entry",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry)
    setFormData({
      classId: entry.classId,
      subjectId: entry.subjectId,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/timetables/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Timetable entry deleted successfully"
        })
        fetchTimetables()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete entry",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive"
      })
    }
  }

  const handleClearSchedule = async () => {
    if (!selectedClass) {
      toast({
        title: "Error",
        description: "Please select a class first",
        variant: "destructive"
      })
      return
    }

    if (!confirm('Are you sure you want to clear all timetable entries for this class? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/timetables/clear?classId=${selectedClass}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Timetable cleared successfully"
        })
        fetchTimetables()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to clear timetable",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error clearing timetable:', error)
      toast({
        title: "Error",
        description: "Failed to clear timetable",
        variant: "destructive"
      })
    }
  }

  const getTimeSlotEntries = (day: string, time: string) => {
    return timetables.filter(entry => {
      if (entry.day !== day) return false
      const entryStart = entry.startTime
      return entryStart === time
    })
  }

  const checkConflict = (classId: string, day: string, startTime: string, endTime: string, excludeId?: string) => {
    const existingEntries = timetables.filter(entry => 
      entry.classId === classId && 
      entry.day === day &&
      entry.id !== excludeId
    )

    for (const entry of existingEntries) {
      // Check for time overlap
      if (
        (startTime >= entry.startTime && startTime < entry.endTime) ||
        (endTime > entry.startTime && endTime <= entry.endTime) ||
        (startTime <= entry.startTime && endTime >= entry.endTime)
      ) {
        return true
      }
    }
    return false
  }

  const stats = {
    totalEntries: timetables.length,
    classesWithSchedule: new Set(timetables.map(t => t.classId)).size,
    subjectsScheduled: new Set(timetables.map(t => t.subjectId)).size,
    avgPeriodsPerDay: timetables.length > 0 ? (timetables.length / 6).toFixed(1) : '0'
  }

  const filteredTimetables = selectedClass 
    ? timetables.filter(t => t.classId === selectedClass)
    : timetables

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Class Timetables
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage weekly class schedules and time slots
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchTimetables}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => {
            setEditingEntry(null)
            setFormData({
              classId: selectedClass || '',
              subjectId: '',
              day: '',
              startTime: '',
              endTime: ''
            })
            setShowForm(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Classes Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.classesWithSchedule}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Subjects Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subjectsScheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Periods/Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPeriodsPerDay}</div>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingEntry ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingEntry(null)
                  setFormData({
                    classId: '',
                    subjectId: '',
                    day: '',
                    startTime: '',
                    endTime: ''
                  })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Class *</Label>
                  <select
                    id="class"
                    value={formData.classId}
                    onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - Grade {cls.grade} {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <select
                    id="subject"
                    value={formData.subjectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    required
                  >
                    <option value="">Select subject</option>
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
                    value={formData.day}
                    onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    required
                  >
                    <option value="">Select day</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {formData.classId && formData.day && formData.startTime && formData.endTime && 
               checkConflict(formData.classId, formData.day, formData.startTime, formData.endTime, editingEntry?.id) && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Warning: Time slot conflict detected! Another subject is already scheduled at this time.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingEntry(null)
                    setFormData({
                      classId: '',
                      subjectId: '',
                      day: '',
                      startTime: '',
                      endTime: ''
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="filterClass">Filter by Class</Label>
              <select
                id="filterClass"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - Grade {cls.grade} {cls.section}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>

            {selectedClass && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleClearSchedule}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Schedule
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {view === 'grid' ? (
        /* Timetable Grid View */
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedClass 
                ? `Weekly Timetable - ${classes.find(c => c.id === selectedClass)?.name}`
                : 'Weekly Timetable (Select a class)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500">Loading timetable...</p>
              </div>
            ) : !selectedClass ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Please select a class to view its timetable
                </p>
              </div>
            ) : filteredTimetables.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No timetable entries found for this class
                </p>
                <Button onClick={() => {
                  setFormData(prev => ({ ...prev, classId: selectedClass }))
                  setShowForm(true)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="border border-slate-300 dark:border-slate-600 p-3 text-left font-medium min-w-[100px]">
                        Time
                      </th>
                      {daysOfWeek.map(day => (
                        <th key={day} className="border border-slate-300 dark:border-slate-600 p-3 text-center font-medium min-w-[150px]">
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
                          const entries = getTimeSlotEntries(day, time)
                          return (
                            <td key={day} className="border border-slate-300 dark:border-slate-600 p-2 min-h-[80px] align-top">
                              {entries.map(entry => (
                                <motion.div
                                  key={entry.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="mb-2 p-2 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-l-4 border-blue-500"
                                >
                                  <div className="font-medium truncate">{entry.subject.name}</div>
                                  <div className="text-xs opacity-75 mt-1">
                                    {entry.startTime} - {entry.endTime}
                                  </div>
                                  <div className="flex gap-1 mt-2">
                                    <button
                                      onClick={() => handleEdit(entry)}
                                      className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(entry.id)}
                                      className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </motion.div>
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
            <CardTitle>Timetable Entries ({filteredTimetables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500">Loading entries...</p>
              </div>
            ) : filteredTimetables.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No timetable entries found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTimetables.map(entry => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {entry.subject.name}
                        </span>
                        <Badge variant="outline">{entry.class.name}</Badge>
                        <Badge>{entry.day}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {entry.startTime} - {entry.endTime}
                        </div>
                        <span>Grade {entry.class.grade} {entry.class.section}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
