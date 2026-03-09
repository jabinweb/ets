"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  GraduationCap,
  Search,
  Save,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  Users,
  Edit,
  Clock,
  AlertCircle,
  FileText,
  BarChart3,
} from 'lucide-react'

interface Student {
  id: string
  name: string
  studentNumber: string
  email: string
}

interface Exam {
  id: string
  title: string
  type: string
  date: string
  totalMarks: number
  passMarks: number
  duration: number
  class: {
    name: string
    grade: number
  }
  subject: {
    name: string
    code: string
  }
  results: ExamResult[]
}

interface ExamResult {
  id: string
  examId: string
  studentId: string
  marksObtained: number
  grade: string | null
  remarks: string | null
  student: Student
  createdAt: string
  updatedAt: string
}

interface GradingEntry {
  studentId: string
  studentName: string
  studentNumber: string
  marksObtained: string
  grade: string
  remarks: string
  status: 'not-graded' | 'graded' | 'updated'
}

const GRADE_SCALE = [
  { grade: 'A+', min: 90, max: 100 },
  { grade: 'A', min: 80, max: 89 },
  { grade: 'B+', min: 75, max: 79 },
  { grade: 'B', min: 70, max: 74 },
  { grade: 'C+', min: 65, max: 69 },
  { grade: 'C', min: 60, max: 64 },
  { grade: 'D', min: 50, max: 59 },
  { grade: 'F', min: 0, max: 49 }
]

export default function ExamGradingPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [gradingEntries, setGradingEntries] = useState<GradingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('grading')
  const { toast } = useToast()

  // Fetch exams
  const fetchExams = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/exams?includeResults=true')
      const result = await response.json()
      
      if (result.success) {
        setExams(result.data || [])
      } else {
        toast.error("Failed to load exams")
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
      toast.error("Failed to load exams")
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Fetch students for selected exam's class
  const fetchStudents = useCallback(async (classId: string) => {
    try {
      const response = await fetch(`/api/admin/classes/${classId}/students`)
      const result = await response.json()
      
      if (result.success) {
        return result.data || []
      }
      return []
    } catch (error) {
      console.error('Error fetching students:', error)
      return []
    }
  }, [])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  // When exam is selected, load students and initialize grading entries
  useEffect(() => {
    if (selectedExam) {
      const loadStudentsAndResults = async () => {
        setLoading(true)
        
        // Get class ID from the exam (we'll need to fetch this)
        const response = await fetch(`/api/admin/exams/${selectedExam.id}`)
        const result = await response.json()
        
        if (result.success && result.data.classId) {
          const studentsData = await fetchStudents(result.data.classId)
          
          // Initialize grading entries
          const entries: GradingEntry[] = studentsData.map((student: Student) => {
            const existingResult = selectedExam.results?.find(r => r.studentId === student.id)
            
            if (existingResult) {
              return {
                studentId: student.id,
                studentName: student.name,
                studentNumber: student.studentNumber,
                marksObtained: existingResult.marksObtained.toString(),
                grade: existingResult.grade || '',
                remarks: existingResult.remarks || '',
                status: 'graded' as const
              }
            }
            
            return {
              studentId: student.id,
              studentName: student.name,
              studentNumber: student.studentNumber,
              marksObtained: '',
              grade: '',
              remarks: '',
              status: 'not-graded' as const
            }
          })
          
          setGradingEntries(entries)
        }
        
        setLoading(false)
      }
      
      loadStudentsAndResults()
    }
  }, [selectedExam, fetchStudents])

  // Calculate grade based on marks
  const calculateGrade = (marks: number, totalMarks: number): string => {
    const percentage = (marks / totalMarks) * 100
    const gradeInfo = GRADE_SCALE.find(g => percentage >= g.min && percentage <= g.max)
    return gradeInfo?.grade || 'F'
  }

  // Handle marks input change
  const handleMarksChange = (studentId: string, value: string) => {
    const marks = parseFloat(value)
    
    setGradingEntries(prev => prev.map(entry => {
      if (entry.studentId === studentId) {
        const isValidMarks = !isNaN(marks) && marks >= 0 && marks <= (selectedExam?.totalMarks || 100)
        const newGrade = isValidMarks ? calculateGrade(marks, selectedExam?.totalMarks || 100) : ''
        
        return {
          ...entry,
          marksObtained: value,
          grade: newGrade,
          status: entry.status === 'graded' ? 'updated' : entry.status
        }
      }
      return entry
    }))
  }

  // Handle remarks change
  const handleRemarksChange = (studentId: string, value: string) => {
    setGradingEntries(prev => prev.map(entry => {
      if (entry.studentId === studentId) {
        return {
          ...entry,
          remarks: value,
          status: entry.status === 'graded' ? 'updated' : entry.status
        }
      }
      return entry
    }))
  }

  // Save individual grade
  const saveGrade = async (entry: GradingEntry) => {
    if (!selectedExam || !entry.marksObtained) {
      toast.error("Please enter marks")
      return
    }

    const marks = parseFloat(entry.marksObtained)
    if (isNaN(marks) || marks < 0 || marks > selectedExam.totalMarks) {
      toast.error(`Marks must be between 0 and ${selectedExam.totalMarks}`)
      return
    }

    try {
      const response = await fetch('/api/admin/exam-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: selectedExam.id,
          studentId: entry.studentId,
          marksObtained: marks,
          grade: entry.grade,
          remarks: entry.remarks
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Grade saved for ${entry.studentName}`)
        setGradingEntries(prev => prev.map(e => 
          e.studentId === entry.studentId ? { ...e, status: 'graded' } : e
        ))
      } else {
        throw new Error(result.error || 'Failed to save grade')
      }
    } catch (error) {
      toast.error("Failed to save grade", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    }
  }

  // Save all grades
  const saveAllGrades = async () => {
    if (!selectedExam) return

    const unsavedEntries = gradingEntries.filter(
      e => (e.status === 'not-graded' || e.status === 'updated') && e.marksObtained
    )

    if (unsavedEntries.length === 0) {
      toast.info("No new grades to save")
      return
    }

    setSaving(true)
    const toastId = toast.loading(`Saving ${unsavedEntries.length} grades...`)

    try {
      const results = await Promise.all(
        unsavedEntries.map(entry => 
          fetch('/api/admin/exam-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              examId: selectedExam.id,
              studentId: entry.studentId,
              marksObtained: parseFloat(entry.marksObtained),
              grade: entry.grade,
              remarks: entry.remarks
            })
          }).then(res => res.json())
        )
      )

      const failed = results.filter(r => !r.success)
      
      if (failed.length === 0) {
        toast.dismiss(toastId)
        toast.success(`Successfully saved ${unsavedEntries.length} grades!`)
        setGradingEntries(prev => prev.map(e => ({ ...e, status: 'graded' })))
        fetchExams() // Refresh to get updated results
      } else {
        toast.dismiss(toastId)
        toast.warning(`Saved ${results.length - failed.length} grades, ${failed.length} failed`)
      }
    } catch {
      toast.dismiss(toastId)
      toast.error("Failed to save grades")
    } finally {
      setSaving(false)
    }
  }

  // Calculate statistics
  const stats = {
    totalStudents: gradingEntries.length,
    graded: gradingEntries.filter(e => e.status === 'graded').length,
    pending: gradingEntries.filter(e => e.status === 'not-graded').length,
    passed: gradingEntries.filter(e => {
      const marks = parseFloat(e.marksObtained)
      return !isNaN(marks) && marks >= (selectedExam?.passMarks || 0)
    }).length,
    averageMarks: gradingEntries.length > 0 
      ? gradingEntries.reduce((sum, e) => {
          const marks = parseFloat(e.marksObtained)
          return sum + (isNaN(marks) ? 0 : marks)
        }, 0) / gradingEntries.filter(e => e.marksObtained).length
      : 0
  }

  // Filter entries
  const filteredEntries = gradingEntries.filter(entry => {
    const matchesSearch = entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Grade distribution
  const gradeDistribution = GRADE_SCALE.map(gradeInfo => ({
    grade: gradeInfo.grade,
    count: gradingEntries.filter(e => e.grade === gradeInfo.grade).length
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Exam Grading
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Enter and manage exam grades for students
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast.info("Export feature coming soon")}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button variant="outline" onClick={() => toast.info("Import feature coming soon")}>
            <Upload className="h-4 w-4 mr-2" />
            Import Grades
          </Button>
        </div>
      </div>

      {/* Exam Selection */}
      {!selectedExam ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Exam to Grade</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500">Loading exams...</p>
              </div>
            ) : !exams || exams.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exams found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exams.map((exam) => {
                  const gradedCount = exam.results?.length || 0
                  
                  return (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedExam(exam)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {exam.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {exam.subject.name} • {exam.class.name}
                          </p>
                        </div>
                        <Badge variant="outline">{exam.type}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Date</span>
                          <span className="font-medium">{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Total Marks</span>
                          <span className="font-medium">{exam.totalMarks}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Graded</span>
                          <span className="font-medium">{gradedCount} students</span>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Start Grading
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Selected Exam Info */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {selectedExam.title}
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Subject</div>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">
                        {selectedExam.subject.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Class</div>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">
                        {selectedExam.class.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Total Marks</div>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">
                        {selectedExam.totalMarks}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Pass Marks</div>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">
                        {selectedExam.passMarks}
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedExam(null)}>
                  Change Exam
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  In this class
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Graded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.totalStudents > 0 ? Math.round((stats.graded / stats.totalStudents) * 100) : 0}% complete
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Not graded yet
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Passed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.passed}</div>
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Above pass marks
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.averageMarks.toFixed(1)}
                </div>
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Out of {selectedExam.totalMarks}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grading">Grade Entry</TabsTrigger>
              <TabsTrigger value="statistics">Statistics & Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="grading" className="space-y-4">
              {/* Filters and Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search by name or student number..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="graded">Graded</SelectItem>
                        <SelectItem value="not-graded">Not Graded</SelectItem>
                        <SelectItem value="updated">Updated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={saveAllGrades} 
                      disabled={saving || gradingEntries.filter(e => e.status !== 'graded' && e.marksObtained).length === 0}
                      className="whitespace-nowrap"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save All Grades
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Grading Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Grades ({filteredEntries.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-slate-500">Loading students...</p>
                    </div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No students found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEntries.map((entry, index) => {
                        const marks = parseFloat(entry.marksObtained)
                        const isPassing = !isNaN(marks) && marks >= selectedExam.passMarks
                        
                        return (
                          <motion.div
                            key={entry.studentId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-4">
                              {/* Student Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                    {entry.studentName}
                                  </h3>
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      entry.status === 'graded' 
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : entry.status === 'updated'
                                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                                        : 'bg-slate-100 text-slate-800 border-slate-200'
                                    }
                                  >
                                    {entry.status === 'graded' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {entry.status === 'updated' && <Edit className="h-3 w-3 mr-1" />}
                                    {entry.status === 'not-graded' && <Clock className="h-3 w-3 mr-1" />}
                                    {entry.status.replace('-', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Student #: {entry.studentNumber}
                                </p>
                              </div>

                              {/* Grading Inputs */}
                              <div className="flex items-center gap-3">
                                <div className="w-32">
                                  <Label className="text-xs">Marks ({selectedExam.totalMarks})</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={selectedExam.totalMarks}
                                    value={entry.marksObtained}
                                    onChange={(e) => handleMarksChange(entry.studentId, e.target.value)}
                                    className={
                                      entry.marksObtained && !isNaN(parseFloat(entry.marksObtained))
                                        ? isPassing
                                          ? 'border-green-500'
                                          : 'border-red-500'
                                        : ''
                                    }
                                    placeholder="0"
                                  />
                                </div>

                                <div className="w-20">
                                  <Label className="text-xs">Grade</Label>
                                  <div className="flex items-center justify-center h-10 font-bold text-lg">
                                    {entry.grade && (
                                      <Badge 
                                        variant="outline"
                                        className={
                                          ['A+', 'A'].includes(entry.grade)
                                            ? 'bg-green-100 text-green-800 border-green-200'
                                            : ['B+', 'B'].includes(entry.grade)
                                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                                            : ['C+', 'C'].includes(entry.grade)
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                            : entry.grade === 'D'
                                            ? 'bg-orange-100 text-orange-800 border-orange-200'
                                            : 'bg-red-100 text-red-800 border-red-200'
                                        }
                                      >
                                        {entry.grade}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="w-64">
                                  <Label className="text-xs">Remarks (Optional)</Label>
                                  <Input
                                    value={entry.remarks}
                                    onChange={(e) => handleRemarksChange(entry.studentId, e.target.value)}
                                    placeholder="Add remarks..."
                                  />
                                </div>

                                <div className="flex items-end">
                                  <Button
                                    size="sm"
                                    onClick={() => saveGrade(entry)}
                                    disabled={!entry.marksObtained || entry.status === 'graded'}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              {/* Grade Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gradeDistribution.map((dist) => (
                      <div key={dist.grade} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline"
                              className={
                                ['A+', 'A'].includes(dist.grade)
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : ['B+', 'B'].includes(dist.grade)
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : ['C+', 'C'].includes(dist.grade)
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : dist.grade === 'D'
                                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }
                            >
                              Grade {dist.grade}
                            </Badge>
                            <span className="text-slate-600 dark:text-slate-400">
                              {GRADE_SCALE.find(g => g.grade === dist.grade)?.min}-{GRADE_SCALE.find(g => g.grade === dist.grade)?.max}%
                            </span>
                          </div>
                          <span className="font-medium">{dist.count} students</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ 
                              width: `${gradingEntries.length > 0 ? (dist.count / gradingEntries.length) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pass/Fail Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                          <div className="text-sm text-green-700 dark:text-green-300">Passed</div>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {stats.totalStudents - stats.passed}
                          </div>
                          <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pass Rate</div>
                        <div className="text-2xl font-bold">
                          {stats.totalStudents > 0 
                            ? Math.round((stats.passed / stats.totalStudents) * 100)
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Highest Score</span>
                        <span className="font-bold">
                          {gradingEntries.length > 0 
                            ? Math.max(...gradingEntries.map(e => parseFloat(e.marksObtained) || 0))
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Lowest Score</span>
                        <span className="font-bold">
                          {gradingEntries.filter(e => e.marksObtained).length > 0
                            ? Math.min(...gradingEntries.filter(e => e.marksObtained).map(e => parseFloat(e.marksObtained)))
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Average Score</span>
                        <span className="font-bold">{stats.averageMarks.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Median Score</span>
                        <span className="font-bold">
                          {(() => {
                            const sortedMarks = gradingEntries
                              .filter(e => e.marksObtained)
                              .map(e => parseFloat(e.marksObtained))
                              .sort((a, b) => a - b)
                            const mid = Math.floor(sortedMarks.length / 2)
                            return sortedMarks.length > 0
                              ? sortedMarks.length % 2 === 0
                                ? ((sortedMarks[mid - 1] + sortedMarks[mid]) / 2).toFixed(2)
                                : sortedMarks[mid].toFixed(2)
                              : 0
                          })()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
