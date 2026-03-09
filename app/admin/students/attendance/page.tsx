"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Edit,
  Save,
  X,
  AlertTriangle,
  UserCheck,
  Eye,
  RefreshCw
} from 'lucide-react'

interface Student {
  id: string
  name: string
  studentNumber: string
  class: {
    name: string
    grade: number
  } | null
}

interface AttendanceRecord {
  id: string
  studentId: string
  student: Student
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  notes?: string
  date: string
}

interface AttendanceSession {
  id: string
  classId: string
  class: {
    name: string
    grade: number
  }
  date: string
  takenBy: {
    name: string
  }
  records: AttendanceRecord[]
  createdAt: string
}

interface AttendanceFormData {
  classId: string
  date: string
  records: {
    studentId: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
    notes?: string
  }[]
}

interface Class {
  id: string
  name: string
  grade: number
  section: string
}

export default function AttendancePage() {
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view, setView] = useState<'list' | 'take'>('list')
  const [formData, setFormData] = useState<AttendanceFormData>({
    classId: '',
    date: new Date().toISOString().split('T')[0],
    records: []
  })
  const { toast } = useToast()

  const fetchAttendance = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/attendance')
      const result = await response.json()
      
      if (result.success) {
        setAttendanceSessions(result.data.sessions || [])
      } else {
        toast.error("Failed to load attendance data", {
          description: result.error || "Something went wrong"
        })
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error("Failed to load attendance", {
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

  const fetchStudentsByClass = useCallback(async (classId: string) => {
    if (!classId) {
      setStudents([])
      return
    }

    try {
      const response = await fetch(`/api/admin/students?classId=${classId}`)
      const result = await response.json()
      
      if (result.success) {
        const classStudents = result.data.students || []
        setStudents(classStudents)
        
        // Initialize form records with all students marked as present
        setFormData(prev => ({
          ...prev,
          classId,
          records: classStudents.map((student: Student) => ({
            studentId: student.id,
            status: 'PRESENT' as const,
            notes: ''
          }))
        }))
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error("Failed to load students", {
        description: "Could not fetch students for selected class"
      })
    }
  }, [toast])

  useEffect(() => {
    fetchAttendance()
    fetchClasses()
  }, [fetchAttendance, fetchClasses])

  useEffect(() => {
    if (formData.classId) {
      fetchStudentsByClass(formData.classId)
    }
  }, [formData.classId, fetchStudentsByClass])

  const filteredSessions = attendanceSessions.filter(session => {
    const matchesSearch = session.class.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = !selectedClass || session.classId === selectedClass
    const matchesDate = !selectedDate || session.date === selectedDate
    return matchesSearch && matchesClass && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800'
      case 'ABSENT': return 'bg-red-100 text-red-800'
      case 'LATE': return 'bg-yellow-100 text-yellow-800'
      case 'EXCUSED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle className="h-4 w-4" />
      case 'ABSENT': return <XCircle className="h-4 w-4" />
      case 'LATE': return <Clock className="h-4 w-4" />
      case 'EXCUSED': return <AlertTriangle className="h-4 w-4" />
      default: return <UserCheck className="h-4 w-4" />
    }
  }

  const updateAttendanceRecord = (studentId: string, field: 'status' | 'notes', value: string) => {
    setFormData(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.studentId === studentId 
          ? { ...record, [field]: value }
          : record
      )
    }))
  }

  const handleSubmitAttendance = async () => {
    if (!formData.classId || formData.records.length === 0) {
      toast.error("Please select a class and ensure students are loaded")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Saving attendance...")

    try {
      const response = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Attendance saved successfully!", {
          description: `Recorded attendance for ${formData.records.length} students`
        })
        
        resetForm()
        fetchAttendance()
        setView('list')
      } else {
        throw new Error(result.error || 'Failed to save attendance')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save attendance'
      toast.error("Save failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      classId: '',
      date: new Date().toISOString().split('T')[0],
      records: []
    })
    setStudents([])
  }

  const startTakeAttendance = () => {
    resetForm()
    setView('take')
  }

  const exportAttendance = () => {
    toast.success("Export started", {
      description: "Attendance report will be downloaded shortly"
    })
  }

  const stats = {
    totalSessions: attendanceSessions.length,
    todaySessions: attendanceSessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length,
    avgAttendance: attendanceSessions.length > 0 
      ? Math.round(
          attendanceSessions.reduce((acc, session) => {
            const present = session.records.filter(r => r.status === 'PRESENT').length
            const total = session.records.length
            return acc + (total > 0 ? (present / total) * 100 : 0)
          }, 0) / attendanceSessions.length
        )
      : 0,
    classesToday: new Set(attendanceSessions.filter(s => s.date === new Date().toISOString().split('T')[0]).map(s => s.classId)).size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Attendance Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track and manage student attendance across all classes
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setView(view === 'list' ? 'take' : 'list')}>
            {view === 'list' ? 'Take Attendance' : 'View Records'}
          </Button>
          <Button variant="outline" onClick={exportAttendance}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={startTakeAttendance}>
            <UserCheck className="h-4 w-4 mr-2" />
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Today&apos;s Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.todaySessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.avgAttendance}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Classes Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.classesToday}</div>
          </CardContent>
        </Card>
      </div>

      {view === 'list' ? (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by class name..."
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
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
                <Button variant="outline" onClick={fetchAttendance}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records ({filteredSessions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading attendance records...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attendance records found</p>
                  <Button onClick={startTakeAttendance} className="mt-4">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Take First Attendance
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map(session => {
                    const totalStudents = session.records.length
                    const presentCount = session.records.filter(r => r.status === 'PRESENT').length
                    const absentCount = session.records.filter(r => r.status === 'ABSENT').length
                    const lateCount = session.records.filter(r => r.status === 'LATE').length
                    const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {session.class.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(session.date).toLocaleDateString()} • Taken by {session.takenBy.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-medium">
                              {attendanceRate.toFixed(1)}% Present
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Present: {presentCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm">Absent: {absentCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm">Late: {lateCount}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">Total: {totalStudents}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                            Student Status
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {session.records.slice(0, 10).map(record => (
                              <div key={record.id} className="flex items-center gap-1">
                                <Badge className={getStatusColor(record.status)} variant="outline">
                                  {getStatusIcon(record.status)}
                                  <span className="ml-1 text-xs">{record.student.name.split(' ')[0]}</span>
                                </Badge>
                              </div>
                            ))}
                            {session.records.length > 10 && (
                              <Badge variant="outline" className="text-xs">
                                +{session.records.length - 10} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Take Attendance Form */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Take Attendance</CardTitle>
              <Button variant="outline" onClick={() => setView('list')}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Class and Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Select Class *</Label>
                <select
                  id="class"
                  className="w-full p-2 border rounded-md"
                  value={formData.classId}
                  onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                >
                  <option value="">Choose a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Grade {cls.grade})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            {/* Students List */}
            {students.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Students ({students.length})</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          records: prev.records.map(r => ({ ...r, status: 'PRESENT' }))
                        }))
                      }}
                    >
                      Mark All Present
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          records: prev.records.map(r => ({ ...r, status: 'ABSENT' }))
                        }))
                      }}
                    >
                      Mark All Absent
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {students.map((student) => {
                    const record = formData.records.find(r => r.studentId === student.id)
                    
                    return (
                      <div key={student.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {student.studentNumber}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(status => (
                            <Button
                              key={status}
                              variant={record?.status === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateAttendanceRecord(student.id, 'status', status)}
                              className={record?.status === status ? getStatusColor(status) : ''}
                            >
                              {getStatusIcon(status)}
                              <span className="ml-1 text-xs">{status}</span>
                            </Button>
                          ))}
                        </div>
                        
                        <Input
                          placeholder="Notes (optional)"
                          value={record?.notes || ''}
                          onChange={(e) => updateAttendanceRecord(student.id, 'notes', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitAttendance}
                    disabled={isSubmitting || !formData.classId}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Saving...' : 'Save Attendance'}
                  </Button>
                </div>
              </div>
            )}

            {formData.classId && students.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No students found in the selected class. Please ensure the class has enrolled students.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
