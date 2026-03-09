"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
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
  Clock,
  Search,
  Download,
  Edit,
  Save,
  X,
  AlertTriangle,
  UserCheck,
  Eye,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Check,
  CheckCheck
} from 'lucide-react'
import { format } from 'date-fns'

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

interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number
  attendanceRate: number
}

interface ChildInfo {
  id: string
  name: string
  class: string
}

interface MyAttendanceRecord {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  notes?: string
  student?: {
    name: string
    studentNumber: string
  }
}

export default function AttendancePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  // Admin/Teacher states for taking attendance
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [formData, setFormData] = useState<AttendanceFormData>({
    classId: '',
    date: new Date().toISOString().split('T')[0],
    records: []
  })
  
  // Student/Parent states for viewing attendance
  const [myRecords, setMyRecords] = useState<MyAttendanceRecord[]>([])
  const [filteredMyRecords, setFilteredMyRecords] = useState<MyAttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    excusedDays: 0,
    attendanceRate: 0
  })
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  
  // Common states
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view, setView] = useState<'list' | 'take'>('list')
  
  const isAdmin = session?.user?.role === 'ADMIN'
  const isTeacher = session?.user?.role === 'TEACHER'
  const isStudent = session?.user?.role === 'STUDENT'

  const fetchAttendance = useCallback(async () => {
    try {
      // Students and Parents view their own attendance
      if (isStudent) {
        let url = '/api/attendance'

        const response = await fetch(url)
        const result = await response.json()
        
        if (result.success) {
          setMyRecords(result.data.records || [])
          setFilteredMyRecords(result.data.records || [])
          setStats(result.data.stats)
          if (result.data.children) {
            setChildren(result.data.children)
            if (!selectedChild && result.data.children.length > 0) {
              setSelectedChild(result.data.children[0].id)
            }
          }
        }
      }
      // Admin and Teachers view attendance management
      else if (isAdmin || isTeacher) {
        const response = await fetch('/api/admin/attendance')
        const result = await response.json()
        
        if (result.success) {
          setAttendanceSessions(result.data.sessions || [])
        } else {
          toast.error("Failed to load attendance data", {
            description: result.error || "Something went wrong"
          })
        }
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
      toast.error("Failed to load attendance", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [toast, isStudent, isAdmin, isTeacher, selectedChild])

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

  // Filter records for student/parent view
  useEffect(() => {
    if (isStudent) {
      let filtered = [...myRecords]
      
      if (searchTerm && (isTeacher || isAdmin)) {
        filtered = filtered.filter(r => 
          r.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.student?.studentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      filtered = filtered.filter(r => {
        const recordDate = new Date(r.date)
        return recordDate.getMonth() === selectedMonth.getMonth() &&
               recordDate.getFullYear() === selectedMonth.getFullYear()
      })
      
      setFilteredMyRecords(filtered)
    }
  }, [myRecords, searchTerm, selectedMonth, isStudent, isTeacher, isAdmin])

  const sessionStats = {
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

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 95) return { text: 'Excellent', color: 'text-green-600', icon: <TrendingUp className="w-4 h-4" /> }
    if (rate >= 85) return { text: 'Good', color: 'text-blue-600', icon: <TrendingUp className="w-4 h-4" /> }
    if (rate >= 75) return { text: 'Average', color: 'text-orange-600', icon: <TrendingDown className="w-4 h-4" /> }
    return { text: 'Poor', color: 'text-red-600', icon: <TrendingDown className="w-4 h-4" /> }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ABSENT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'LATE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'EXCUSED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <Check className="w-3 h-3" />
      case 'ABSENT': return <X className="w-3 h-3" />
      case 'LATE': return <Clock className="w-3 h-3" />
      case 'EXCUSED': return <CheckCheck className="w-3 h-3" />
      default: return null
    }
  }

  // Student/Parent View
  if (isStudent) {
    const attendanceStatus = getAttendanceStatus(stats.attendanceRate)
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              My Attendance
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              {isStudent && 'Track your attendance record'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.lateDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Excused
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.excusedDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${attendanceStatus.color}`}>
                  {stats.attendanceRate}%
                </div>
                <div className={attendanceStatus.color}>
                  {attendanceStatus.icon}
                </div>
              </div>
              <p className={`text-xs ${attendanceStatus.color} mt-1`}>
                {attendanceStatus.text}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Month Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-center">
              <Label>Filter by Month:</Label>
              <select
                value={selectedMonth.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(selectedMonth)
                  newDate.setMonth(parseInt(e.target.value))
                  setSelectedMonth(newDate)
                }}
                className="px-3 py-2 border rounded-md"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {format(new Date(2000, i, 1), 'MMMM')}
                  </option>
                ))}
              </select>
              <select
                value={selectedMonth.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(selectedMonth)
                  newDate.setFullYear(parseInt(e.target.value))
                  setSelectedMonth(newDate)
                }}
                className="px-3 py-2 border rounded-md"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i
                  return <option key={year} value={year}>{year}</option>
                })}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Attendance Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMyRecords.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">No attendance records found for this month</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMyRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">
                          {format(new Date(record.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {record.notes && (
                        <span className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {record.notes}
                        </span>
                      )}
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1">{record.status}</span>
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin/Teacher View
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Attendance Management
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Track and manage student attendance across all classes
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button variant="outline" onClick={() => setView(view === 'list' ? 'take' : 'list')} size="sm" className="md:h-10">
            <span className="hidden sm:inline">{view === 'list' ? 'Take Attendance' : 'View Records'}</span>
            <span className="sm:hidden">{view === 'list' ? 'Take' : 'View'}</span>
          </Button>
          <Button variant="outline" onClick={exportAttendance} size="sm" className="md:h-10">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
          <Button onClick={startTakeAttendance} size="sm" className="md:h-10">
            <UserCheck className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Take Attendance</span>
            <span className="sm:hidden">Take</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Today&apos;s Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{sessionStats.todaySessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sessionStats.avgAttendance}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Classes Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{sessionStats.classesToday}</div>
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
