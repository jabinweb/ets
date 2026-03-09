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
import { Progress } from "@/components/ui/progress"
import { 
  Download, Users, AlertCircle, CheckCircle, Search, Plus, Eye, Star, 
  Target, Award, GraduationCap} from 'lucide-react'

interface TeacherPerformance {
  id: string
  name: string
  email: string
  subject: string
  classesAssigned: number
  studentsCount: number
  averageGrade: number
  attendanceRate: number
  completionRate: number
  overallRating: number
  status: 'excellent' | 'good' | 'average' | 'needs_improvement'
  lastEvaluation: string
  goals: {
    completed: number
    total: number
  }
}

export default function TeacherPerformancePage() {
  const [teachers, setTeachers] = useState<TeacherPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherPerformance | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const { toast } = useToast()

  const fetchTeachers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/teachers/performance')
      const result = await response.json()
      
      if (result.success) {
        setTeachers(result.data || [])
      } else {
        toast.error("Failed to load teacher performance data")
      }
    } catch {
      toast.error("Failed to load teacher performance data")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || !statusFilter || teacher.status === statusFilter
    const matchesSubject = subjectFilter === 'all' || !subjectFilter || teacher.subject === subjectFilter
    return matchesSearch && matchesStatus && matchesSubject
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200'
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'average': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'needs_improvement': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPerformanceIcon = (rating: number) => {
    if (rating >= 4.5) return <Award className="h-4 w-4 text-green-600" />
    if (rating >= 4.0) return <Star className="h-4 w-4 text-blue-600" />
    if (rating >= 3.5) return <Target className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  const handleViewDetails = (teacher: TeacherPerformance) => {
    setSelectedTeacher(teacher)
    setShowDetails(true)
  }

  const stats = {
    totalTeachers: teachers.length,
    excellentPerformers: teachers.filter(t => t.status === 'excellent').length,
    averageRating: teachers.reduce((sum, t) => sum + t.overallRating, 0) / teachers.length || 0,
    averageCompletion: teachers.reduce((sum, t) => sum + t.completionRate, 0) / teachers.length || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Teacher Performance
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor and evaluate teacher performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast.success("Export started")}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Evaluation
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Users className="h-3 w-3 mr-1" />
              Active faculty
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Excellent Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.excellentPerformers}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Award className="h-3 w-3 mr-1" />
              Top rated teachers
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}/5</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Star className="h-3 w-3 mr-1" />
              Overall performance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.averageCompletion.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Goal achievement
            </div>
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
                placeholder="Search teachers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="History">History</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance List */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading performance data...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teachers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeachers.map(teacher => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {teacher.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {teacher.subject} • {teacher.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPerformanceIcon(teacher.overallRating)}
                      <div className="text-right mr-4">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {teacher.overallRating.toFixed(1)}/5
                        </div>
                        <div className="text-xs text-slate-500">Overall Rating</div>
                      </div>
                      <Badge className={getStatusColor(teacher.status)}>
                        {teacher.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-primary">{teacher.classesAssigned}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Classes</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-accent">{teacher.studentsCount}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Students</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{teacher.averageGrade}%</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Avg Grade</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{teacher.attendanceRate}%</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Attendance</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Goal Completion</span>
                      <span>{teacher.goals.completed}/{teacher.goals.total}</span>
                    </div>
                    <Progress value={(teacher.goals.completed / teacher.goals.total) * 100} />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Last evaluation: {new Date(teacher.lastEvaluation).toLocaleDateString()}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(teacher)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teacher Details Modal */}
      {showDetails && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Performance Details - {selectedTeacher.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="feedback">Feedback</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Teacher Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Subject:</strong> {selectedTeacher.subject}</div>
                        <div><strong>Email:</strong> {selectedTeacher.email}</div>
                        <div><strong>Classes:</strong> {selectedTeacher.classesAssigned}</div>
                        <div><strong>Students:</strong> {selectedTeacher.studentsCount}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Performance Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Overall Rating:</strong> {selectedTeacher.overallRating}/5</div>
                        <div><strong>Status:</strong> {selectedTeacher.status}</div>
                        <div><strong>Last Evaluation:</strong> {new Date(selectedTeacher.lastEvaluation).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="metrics" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Student Grades</span>
                          <span>{selectedTeacher.averageGrade}%</span>
                        </div>
                        <Progress value={selectedTeacher.averageGrade} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Attendance Rate</span>
                          <span>{selectedTeacher.attendanceRate}%</span>
                        </div>
                        <Progress value={selectedTeacher.attendanceRate} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Completion Rate</span>
                          <span>{selectedTeacher.completionRate}%</span>
                        </div>
                        <Progress value={selectedTeacher.completionRate} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="goals">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Performance Goals</h4>
                    <div className="space-y-3">
                      {[
                        { goal: "Improve student test scores by 10%", status: "completed" },
                        { goal: "Complete professional development course", status: "completed" },
                        { goal: "Implement new teaching methodology", status: "in_progress" },
                        { goal: "Increase parent engagement", status: "pending" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <span>{item.goal}</span>
                          <Badge variant={item.status === 'completed' ? 'default' : item.status === 'in_progress' ? 'secondary' : 'outline'}>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="feedback">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Feedback</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 border border-green-200 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">Principal Review</span>
                          <span className="text-sm text-green-600">Excellent</span>
                        </div>
                        <p className="text-sm text-slate-600">Outstanding performance in engaging students and maintaining high academic standards.</p>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">Peer Review</span>
                          <span className="text-sm text-blue-600">Good</span>
                        </div>
                        <p className="text-sm text-slate-600">Great collaboration and willingness to share teaching resources with colleagues.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
                 