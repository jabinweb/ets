"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar, Search, Plus, Clock, MapPin, Filter, Download,
  ChevronLeft, ChevronRight, RefreshCw, Check, AlertCircle
} from 'lucide-react'

interface Teacher {
  id: string
  name: string
  email: string
  subjects: string[]
  totalClasses: number
  weeklyHours: number
  schedules: Array<{
    id: string
    day: string
    startTime: string
    endTime: string
    subjectName: string
    className: string
    room?: string
  }>
}

interface ScheduleEntry {
  id: string
  teacherId: string
  teacherName: string
  subjectName: string
  className: string
  day: string
  startTime: string
  endTime: string
  room: string
}

export default function TeacherSchedulePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [filteredSchedules, setFilteredSchedules] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all')
  const [selectedDay, setSelectedDay] = useState<string>('all')
  const [currentWeek] = useState(new Date())
  const { toast } = useToast()

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const timeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00', 
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00'
  ]

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/teachers/schedule')
      const result = await response.json()
      
      if (result.success && result.data) {
        setTeachers(result.data.teachers || [])
        setSchedules(result.data.schedules || [])
        toast.success("Schedule data loaded successfully")
      } else {
        throw new Error(result.error || 'Failed to load schedules')
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
      toast.error("Failed to load schedule data")
      // Set empty arrays as fallback
      setTeachers([])
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    let filtered = schedules

    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.className.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedTeacher !== 'all') {
      filtered = filtered.filter(schedule => schedule.teacherId === selectedTeacher)
    }

    if (selectedDay !== 'all') {
      filtered = filtered.filter(schedule => schedule.day === selectedDay)
    }

    setFilteredSchedules(filtered)
  }, [schedules, searchTerm, selectedTeacher, selectedDay])

  const getScheduleForTimeSlot = (day: string, timeSlot: string) => {
    const [startTime] = timeSlot.split(' - ')
    return filteredSchedules.find(
      schedule => schedule.day === day && schedule.startTime === startTime
    )
  }

  const detectConflicts = () => {
    const conflicts: Array<{
      day: string
      time: string
      conflictType: 'room' | 'teacher' | 'class'
      details: string[]
    }> = []

    // Group schedules by day and time
    const timeSlotMap = new Map<string, ScheduleEntry[]>()

    schedules.forEach(schedule => {
      const key = `${schedule.day}-${schedule.startTime}`
      if (!timeSlotMap.has(key)) {
        timeSlotMap.set(key, [])
      }
      timeSlotMap.get(key)!.push(schedule)
    })

    timeSlotMap.forEach((entries, key) => {
      if (entries.length > 1) {
        const [day, time] = key.split('-')
        
        // Check for teacher conflicts (same teacher, multiple classes at same time)
        const teacherGroups = new Map<string, ScheduleEntry[]>()
        entries.forEach(entry => {
          if (!teacherGroups.has(entry.teacherId)) {
            teacherGroups.set(entry.teacherId, [])
          }
          teacherGroups.get(entry.teacherId)!.push(entry)
        })

        teacherGroups.forEach((teacherEntries) => {
          if (teacherEntries.length > 1) {
            const teacher = teacherEntries[0]
            const classes = [...new Set(teacherEntries.map(e => e.className))]
            const subjects = [...new Set(teacherEntries.map(e => e.subjectName))]
            
            conflicts.push({
              day,
              time,
              conflictType: 'teacher',
              details: [
                `Teacher: ${teacher.teacherName}`,
                `Classes: ${classes.join(', ')}`,
                `Subjects: ${subjects.join(', ')}`
              ]
            })
          }
        })

        // Check for class conflicts (same class, multiple subjects at same time)
        const classGroups = new Map<string, ScheduleEntry[]>()
        entries.forEach(entry => {
          if (!classGroups.has(entry.className)) {
            classGroups.set(entry.className, [])
          }
          classGroups.get(entry.className)!.push(entry)
        })

        classGroups.forEach((classEntries, className) => {
          if (classEntries.length > 1) {
            const subjects = [...new Set(classEntries.map(e => e.subjectName))]
            const teachers = [...new Set(classEntries.map(e => e.teacherName))]
            
            conflicts.push({
              day,
              time,
              conflictType: 'class',
              details: [
                `Class: ${className}`,
                `Subjects: ${subjects.join(', ')}`,
                `Teachers: ${teachers.join(', ')}`
              ]
            })
          }
        })

        // Check for room conflicts (same room, multiple classes at same time)
        const roomGroups = new Map<string, ScheduleEntry[]>()
        entries.forEach(entry => {
          if (!roomGroups.has(entry.room)) {
            roomGroups.set(entry.room, [])
          }
          roomGroups.get(entry.room)!.push(entry)
        })

        roomGroups.forEach((roomEntries, room) => {
          if (roomEntries.length > 1) {
            const classes = [...new Set(roomEntries.map(e => e.className))]
            const teachers = [...new Set(roomEntries.map(e => e.teacherName))]
            
            conflicts.push({
              day,
              time,
              conflictType: 'room',
              details: [
                `Room: ${room}`,
                `Classes: ${classes.join(', ')}`,
                `Teachers: ${teachers.join(', ')}`
              ]
            })
          }
        })
      }
    })

    return conflicts
  }

  const conflicts = detectConflicts()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading schedule data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Teacher Schedules
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and view teacher class schedules and workloads
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search teachers, subjects, or classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Workload</TabsTrigger>
          <TabsTrigger value="conflicts">
            Schedule Conflicts
            {conflicts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {conflicts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Weekly Schedule View */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Schedule Grid
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">Week of {currentWeek.toLocaleDateString()}</span>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No Schedule Data
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    No timetable entries found. Create some schedule entries to see them here.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schedule Entry
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800 text-left font-medium">
                          Time
                        </th>
                        {daysOfWeek.map((day) => (
                          <th key={day} className="border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800 text-left font-medium min-w-[200px]">
                            {day.charAt(0) + day.slice(1).toLowerCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot}>
                          <td className="border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800 font-medium">
                            {timeSlot}
                          </td>
                          {daysOfWeek.map((day) => {
                            const schedule = getScheduleForTimeSlot(day, timeSlot)
                            return (
                              <td key={`${day}-${timeSlot}`} className="border border-slate-200 dark:border-slate-700 p-2">
                                {schedule ? (
                                  <motion.div
                                    className="bg-primary/10 border border-primary/20 rounded-lg p-3 cursor-pointer hover:bg-primary/20 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                                      {schedule.subjectName}
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                      {schedule.className}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                      {schedule.teacherName}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                      <MapPin className="h-3 w-3 text-slate-400" />
                                      <span className="text-xs text-slate-400">{schedule.room}</span>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <div className="h-16 flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs">
                                    Free
                                  </div>
                                )}
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
        </TabsContent>

        {/* Teacher Workload View */}
        <TabsContent value="teachers">
          <div className="grid gap-6">
            {teachers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No Teachers Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    No teachers with schedules found in the system.
                  </p>
                </CardContent>
              </Card>
            ) : (
              teachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{teacher.name}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{teacher.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{teacher.totalClasses} Classes</Badge>
                        <Badge variant="outline">{teacher.weeklyHours} Hours/Week</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Subjects Taught</h4>
                        <div className="flex gap-2 flex-wrap">
                          {teacher.subjects.length > 0 ? (
                            teacher.subjects.map((subject) => (
                              <Badge key={subject} variant="secondary">{subject}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No subjects assigned</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Weekly Schedule</h4>
                        <div className="grid gap-2">
                          {teacher.schedules.length > 0 ? (
                            teacher.schedules.map((schedule) => (
                              <div key={schedule.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Clock className="h-4 w-4 text-slate-400" />
                                  <div>
                                    <div className="font-medium text-sm">
                                      {schedule.day.charAt(0) + schedule.day.slice(1).toLowerCase()}, {schedule.startTime}-{schedule.endTime}
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                      {schedule.subjectName} - {schedule.className}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="h-3 w-3" />
                                  {schedule.room}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-slate-500">
                              No schedule entries found
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Schedule Conflicts View */}
        <TabsContent value="conflicts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Schedule Conflicts Detection
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchData}
                  className="ml-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No Schedule Conflicts Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    All teacher schedules are properly arranged with no time conflicts.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <span className="font-medium text-amber-800 dark:text-amber-200">
                        {conflicts.length} scheduling conflicts detected
                      </span>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        These conflicts need to be resolved to ensure proper scheduling.
                      </p>
                    </div>
                  </div>

                  {conflicts.map((conflict, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${
                      conflict.conflictType === 'teacher' 
                        ? 'border-red-200 bg-red-50 dark:bg-red-900/10' 
                        : conflict.conflictType === 'class'
                        ? 'border-orange-200 bg-orange-50 dark:bg-orange-900/10'
                        : 'border-purple-200 bg-purple-50 dark:bg-purple-900/10'
                    }`}>
                      <div className="flex items-start gap-3 mb-3">
                        <AlertCircle className={`h-5 w-5 mt-0.5 ${
                          conflict.conflictType === 'teacher' ? 'text-red-600' 
                          : conflict.conflictType === 'class' ? 'text-orange-600'
                          : 'text-purple-600'
                        }`} />
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            conflict.conflictType === 'teacher' 
                              ? 'text-red-900 dark:text-red-100' 
                              : conflict.conflictType === 'class'
                              ? 'text-orange-900 dark:text-orange-100'
                              : 'text-purple-900 dark:text-purple-100'
                          }`}>
                            {conflict.conflictType === 'teacher' ? 'Teacher Double-Booking' 
                             : conflict.conflictType === 'class' ? 'Class Schedule Conflict'
                             : 'Room Conflict'} - {conflict.day.charAt(0) + conflict.day.slice(1).toLowerCase()} at {conflict.time}
                          </h4>
                          <div className={`text-sm space-y-1 mt-2 ${
                            conflict.conflictType === 'teacher' 
                              ? 'text-red-700 dark:text-red-300' 
                              : conflict.conflictType === 'class'
                              ? 'text-orange-700 dark:text-orange-300'
                              : 'text-purple-700 dark:text-purple-300'
                          }`}>
                            {conflict.details.map((detail, idx) => (
                              <div key={idx}>{detail}</div>
                            ))}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            toast.info("Resolution", {
                              description: "Please use the schedule management tools to resolve this conflict."
                            })
                          }}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Resolution Suggestions */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      How to Resolve Conflicts:
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                      <li>• <strong>Teacher conflicts:</strong> Assign different teachers or change time slots</li>
                      <li>• <strong>Class conflicts:</strong> Move one subject to a different time slot</li>
                      <li>• <strong>Room conflicts:</strong> Assign different rooms or reschedule classes</li>
                      <li>• Use the &quot;Add Schedule&quot; feature to create new entries with conflict checking</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
