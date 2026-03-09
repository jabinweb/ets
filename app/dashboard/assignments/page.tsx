"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  BookOpen,
  Users,
  GraduationCap,
  X,
  Save,
  MoreHorizontal,
  Star,
  Flag,
  Upload,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Assignment {
  id: string
  title: string
  description: string
  type: 'ASSIGNMENT' | 'PROJECT' | 'QUIZ' | 'MIDTERM' | 'FINAL'
  classId: string
  class: {
    name: string
    grade: number
    section: string
  }
  subjectId: string
  subject: {
    name: string
    code: string
  }
  dueDate: string
  totalMarks: number
  instructions?: string
  attachments?: string[]
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  submissions?: {
    total: number
    submitted: number
    graded: number
  }
  submission?: {
    id: string
    marksObtained: number
    grade: string | null
    remarks: string | null
    createdAt: string
  } | null
  createdAt?: string
  updatedAt?: string
}

interface Class {
  id: string
  name: string
  grade: number
  section: string
  students: { count: number }
}

interface Subject {
  id: string
  name: string
  code: string
}

interface AssignmentFormData {
  title: string
  description: string
  type: 'ASSIGNMENT' | 'PROJECT' | 'QUIZ' | 'MIDTERM' | 'FINAL'
  classId: string
  subjectId: string
  dueDate: string
  totalMarks: number
  instructions: string
  status: 'DRAFT' | 'PUBLISHED'
}

export default function AssignmentsPage() {
  const { data: session, status } = useSession()
  
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list')
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    type: 'ASSIGNMENT',
    classId: '',
    subjectId: '',
    dueDate: '',
    totalMarks: 100,
    instructions: '',
    status: 'DRAFT'
  })
  const { toast } = useToast()

  // Check if user is a student or parent
  const isStudent = session?.user?.role === 'STUDENT'

  // Student view states
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null)
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [isSubmittingWork, setIsSubmittingWork] = useState(false)

  const fetchAssignments = useCallback(async () => {
    try {
      // Use different API endpoint based on user role
      const endpoint = session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN'
        ? '/api/admin/assignments'
        : '/api/student/assignments'
      
      const response = await fetch(endpoint)
      const result = await response.json()
      
      if (result.success) {
        setAssignments(result.data || result.assignments || [])
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load assignments",
          description: result.error || "Access denied"
        })
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast({
        variant: "destructive",
        title: "Failed to load assignments",
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [toast, session])

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/teacher/classes')
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
      const response = await fetch('/api/admin/teacher/subjects')
      const result = await response.json()
      
      if (result.success) {
        setSubjects(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchAssignments()
      fetchClasses()
      fetchSubjects()
    }
  }, [session, fetchAssignments, fetchClasses, fetchSubjects])

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.class.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter
    const matchesClass = classFilter === 'all' || assignment.classId === classFilter
    const matchesType = typeFilter === 'all' || assignment.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesClass && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return 'bg-blue-100 text-blue-800'
      case 'PROJECT': return 'bg-purple-100 text-purple-800'
      case 'QUIZ': return 'bg-yellow-100 text-yellow-800'
      case 'MIDTERM': return 'bg-orange-100 text-orange-800'
      case 'FINAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT': return <FileText className="h-4 w-4" />
      case 'PROJECT': return <BookOpen className="h-4 w-4" />
      case 'QUIZ': return <Clock className="h-4 w-4" />
      case 'MIDTERM': return <GraduationCap className="h-4 w-4" />
      case 'FINAL': return <Star className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const handleViewDetails = (assignment: Assignment) => {
    setViewingAssignment(assignment)
  }

  const handleSubmitClick = (assignment: Assignment) => {
    setSubmittingAssignment(assignment)
    setSubmissionText('')
    setSubmissionFile(null)
  }

  const handleSubmitAssignment = async () => {
    if (!submittingAssignment || !session?.user?.id) return

    if (!submissionText.trim()) {
      toast.error('Please provide submission details')
      return
    }

    setIsSubmittingWork(true)
    const toastId = toast.loading('Submitting assignment...')

    try {
      const response = await fetch('/api/student/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: submittingAssignment.id,
          submissionText,
          fileName: submissionFile?.name || null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success('Assignment submitted successfully!', {
          description: 'Your teacher will review and grade your submission'
        })
        setSubmittingAssignment(null)
        setSubmissionText('')
        setSubmissionFile(null)
        fetchAssignments()
      } else {
        throw new Error(result.error || 'Failed to submit assignment')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit assignment'
      toast.error('Submission failed', {
        description: errorMessage
      })
    } finally {
      setIsSubmittingWork(false)
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleInputChange = (field: keyof AssignmentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'ASSIGNMENT',
      classId: '',
      subjectId: '',
      dueDate: '',
      totalMarks: 100,
      instructions: '',
      status: 'DRAFT'
    })
    setEditingAssignment(null)
  }

  const handleCreateAssignment = () => {
    resetForm()
    setView('create')
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      dueDate: assignment.dueDate.split('T')[0],
      totalMarks: assignment.totalMarks,
      instructions: assignment.instructions || '',
      status: assignment.status as 'DRAFT' | 'PUBLISHED'
    })
    setEditingAssignment(assignment)
    setView('edit')
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.classId || !formData.subjectId || !formData.dueDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading(editingAssignment ? "Updating assignment..." : "Creating assignment...")

    try {
      const url = editingAssignment 
        ? `/api/admin/assignments/${editingAssignment.id}`
        : '/api/admin/assignments'
      
      const method = editingAssignment ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dueDate: new Date(formData.dueDate).toISOString()
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success(editingAssignment ? "Assignment updated!" : "Assignment created!", {
          description: editingAssignment 
            ? "Assignment has been updated successfully"
            : "New assignment has been created and is ready to publish"
        })
        
        resetForm()
        setView('list')
        fetchAssignments()
      } else {
        throw new Error(result.error || 'Failed to save assignment')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save assignment'
      toast.error("Save failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return
    }

    const toastId = toast.loading("Deleting assignment...")

    try {
      const response = await fetch(`/api/admin/assignments/${assignmentId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Assignment deleted", {
          description: "Assignment has been removed successfully"
        })
        fetchAssignments()
      } else {
        throw new Error(result.error || 'Failed to delete assignment')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete assignment'
      toast.error("Delete failed", {
        description: errorMessage
      })
    }
  }

  const handleStatusToggle = async (assignment: Assignment) => {
    const newStatus = assignment.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    const toastId = toast.loading(`${newStatus === 'PUBLISHED' ? 'Publishing' : 'Unpublishing'} assignment...`)

    try {
      const response = await fetch(`/api/admin/assignments/${assignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success(newStatus === 'PUBLISHED' ? "Assignment published!" : "Assignment unpublished", {
          description: newStatus === 'PUBLISHED' 
            ? "Students can now see and submit this assignment"
            : "Assignment is now hidden from students"
        })
        fetchAssignments()
      } else {
        throw new Error(result.error || 'Failed to update assignment status')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status'
      toast.error("Update failed", {
        description: errorMessage
      })
    }
  }

  const stats = {
    total: assignments.length,
    published: assignments.filter(a => a.status === 'PUBLISHED').length,
    draft: assignments.filter(a => a.status === 'DRAFT').length,
    overdue: assignments.filter(a => a.status === 'PUBLISHED' && isOverdue(a.dueDate)).length
  }

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  // Student View - Show assignments assigned to them
  if (isStudent) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            My Assignments
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            View and submit your assignments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {assignments.filter(a => !a.submission).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {assignments.filter(a => a.submission).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {assignments.filter(a => isOverdue(a.dueDate) && !a.submission).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                className="p-2 border rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="ASSIGNMENT">Assignments</option>
                <option value="PROJECT">Projects</option>
                <option value="QUIZ">Quizzes</option>
                <option value="MIDTERM">Midterms</option>
                <option value="FINAL">Finals</option>
              </select>
            </div>
          </CardHeader>
        </Card>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">Loading assignments...</div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assignments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAssignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{assignment.title}</h3>
                          <Badge className={getTypeColor(assignment.type)}>
                            {assignment.type}
                          </Badge>
                          {isOverdue(assignment.dueDate) && !assignment.submission && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-3">
                          {assignment.description}
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {assignment.subject.name} ({assignment.subject.code})
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {assignment.class.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {assignment.totalMarks} marks
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(assignment)} className="flex-1 sm:flex-none">
                          <Eye className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        {!assignment.submission && (
                          <Button size="sm" onClick={() => handleSubmitClick(assignment)} className="flex-1 sm:flex-none">
                            <Upload className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Submit</span>
                            <span className="sm:hidden">Submit</span>
                          </Button>
                        )}
                        {assignment.submission && (
                          <Badge className="bg-green-100 text-green-800 justify-center w-full sm:w-auto">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted
                          </Badge>
                        )}
                      </div>
                    </div>
                    {assignment.instructions && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <strong>Instructions:</strong> {assignment.instructions}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Details Modal */}
        {viewingAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl sm:text-2xl truncate">{viewingAssignment.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge className={getTypeColor(viewingAssignment.type)}>
                        {viewingAssignment.type}
                      </Badge>
                      {isOverdue(viewingAssignment.dueDate) && (
                        <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setViewingAssignment(null)} className="shrink-0">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-slate-600 dark:text-slate-400">{viewingAssignment.description}</p>
                </div>

                {viewingAssignment.instructions && (
                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {viewingAssignment.instructions}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-slate-500">Subject</p>
                    <p className="font-medium">
                      {viewingAssignment.subject.name} ({viewingAssignment.subject.code})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Class</p>
                    <p className="font-medium">{viewingAssignment.class.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Due Date</p>
                    <p className="font-medium">
                      {new Date(viewingAssignment.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Marks</p>
                    <p className="font-medium">{viewingAssignment.totalMarks} marks</p>
                  </div>
                </div>

                {viewingAssignment.submission && (
                  <div className="pt-4 border-t">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-900 dark:text-green-100">
                          Submitted
                        </h3>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                        Submitted on: {new Date(viewingAssignment.submission.createdAt).toLocaleDateString()}
                      </p>
                      {viewingAssignment.submission.grade && (
                        <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded">
                          <p className="text-sm font-medium">Grade: {viewingAssignment.submission.grade}</p>
                          <p className="text-sm">Marks: {viewingAssignment.submission.marksObtained}/{viewingAssignment.totalMarks}</p>
                        </div>
                      )}
                      {!viewingAssignment.submission.grade && (
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your teacher will review and grade it soon.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setViewingAssignment(null)}>
                    Close
                  </Button>
                  {!viewingAssignment.submission && (
                    <Button onClick={() => {
                      setViewingAssignment(null)
                      handleSubmitClick(viewingAssignment)
                    }}>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Assignment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submission Modal */}
        {submittingAssignment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg sm:text-xl">Submit Assignment: {submittingAssignment.title}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSubmittingAssignment(null)} className="shrink-0">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Submission Guidelines
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        • Make sure to review all instructions before submitting<br />
                        • Double-check your work for accuracy<br />
                        • Submit before the due date: {new Date(submittingAssignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="submissionText">Submission Details *</Label>
                  <Textarea
                    id="submissionText"
                    placeholder="Enter your answer, solution, or describe your submission..."
                    rows={8}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="resize-none"
                  />
                  <p className="text-sm text-slate-500">
                    Provide your answer or describe the work you&apos;ve completed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="submissionFile">Attach File (Optional)</Label>
                  <Input
                    id="submissionFile"
                    type="file"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm text-slate-500">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                  </p>
                </div>

                {submissionFile && (
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm">{submissionFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSubmissionFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setSubmittingAssignment(null)}
                    disabled={isSubmittingWork}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAssignment}
                    disabled={isSubmittingWork || !submissionText.trim()}
                  >
                    {isSubmittingWork ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Assignment
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  // Teacher/Admin View
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Assignment Management
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Create, manage, and track assignments for your classes
          </p>
        </div>
        {(session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN') && (
          <div className="flex gap-2 md:gap-3">
            <Button variant="outline" onClick={() => setView('list')} size="sm" className="md:h-10">
              <Eye className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">View All</span>
            </Button>
            <Button onClick={handleCreateAssignment} size="sm" className="md:h-10">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Create Assignment</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {view === 'list' ? (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search assignments by title, subject, or class..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2 border rounded-md"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <select 
                  className="px-4 py-2 border rounded-md"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <select 
                  className="px-4 py-2 border rounded-md"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="PROJECT">Project</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="MIDTERM">Midterm</option>
                  <option value="FINAL">Final</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Assignments List */}
          <Card>
            <CardHeader>
              <CardTitle>Assignments ({filteredAssignments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading assignments...</p>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No assignments found</p>
                  {(session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN') && (
                    <Button onClick={handleCreateAssignment} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Assignment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAssignments.map(assignment => {
                    const daysUntilDue = getDaysUntilDue(assignment.dueDate)
                    const isAssignmentOverdue = isOverdue(assignment.dueDate)

                    return (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                                {assignment.title}
                              </h3>
                              <Badge className={getTypeColor(assignment.type)} variant="outline">
                                {getTypeIcon(assignment.type)}
                                <span className="ml-1">{assignment.type}</span>
                              </Badge>
                              <Badge className={getStatusColor(assignment.status || 'PUBLISHED')} variant="outline">
                                {assignment.status || 'PUBLISHED'}
                              </Badge>
                              {isAssignmentOverdue && assignment.status === 'PUBLISHED' && (
                                <Badge variant="destructive">
                                  <Flag className="h-3 w-3 mr-1" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-3">
                              {assignment.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4 shrink-0" />
                                <span className="truncate">{assignment.class.name} • {assignment.subject.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 shrink-0" />
                                <span className="whitespace-nowrap">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                {!isAssignmentOverdue && daysUntilDue >= 0 && (
                                  <span className={`ml-1 whitespace-nowrap ${daysUntilDue <= 3 ? 'text-red-500' : 'text-slate-500'}`}>
                                    ({daysUntilDue}d)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 shrink-0" />
                                <span className="whitespace-nowrap">{assignment.totalMarks} marks</span>
                              </div>
                              {assignment.submissions && (
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4 shrink-0" />
                                  <span className="whitespace-nowrap">{assignment.submissions.submitted}/{assignment.submissions.total}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditAssignment(assignment)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusToggle(assignment)}>
                                {assignment.status === 'PUBLISHED' ? (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Submissions
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export Results
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(assignment.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          </div>
                        </div>

                        {assignment.submissions && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="text-xs sm:text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Submissions: </span>
                              <span className="font-medium">{assignment.submissions.submitted}</span>
                              <span className="text-slate-400">/{assignment.submissions.total}</span>
                            </div>
                            <div className="text-xs sm:text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Graded: </span>
                              <span className="font-medium text-green-600">{assignment.submissions.graded}</span>
                            </div>
                            <div className="flex-1">
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${assignment.submissions.total > 0 ? (assignment.submissions.submitted / assignment.submissions.total) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Create/Edit Assignment Form */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {view === 'edit' ? 'Edit Assignment' : 'Create New Assignment'}
              </CardTitle>
              <Button variant="outline" onClick={() => setView('list')}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter assignment title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Assignment Type *</Label>
                <select
                  id="type"
                  className="w-full p-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="PROJECT">Project</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="MIDTERM">Midterm Exam</option>
                  <option value="FINAL">Final Exam</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the assignment"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Class and Subject */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <select
                  id="class"
                  className="w-full p-2 border rounded-md"
                  value={formData.classId}
                  onChange={(e) => handleInputChange('classId', e.target.value)}
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Grade {cls.grade})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <select
                  id="subject"
                  className="w-full p-2 border rounded-md"
                  value={formData.subjectId}
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date and Marks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks *</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  placeholder="100"
                  min="1"
                  value={formData.totalMarks}
                  onChange={(e) => handleInputChange('totalMarks', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Detailed Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Provide detailed instructions for students..."
                rows={6}
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full p-2 border rounded-md"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="DRAFT">Save as Draft</option>
                <option value="PUBLISHED">Publish Immediately</option>
              </select>
              <p className="text-sm text-slate-500">
                {formData.status === 'DRAFT' 
                  ? 'Students won\'t see this assignment until you publish it'
                  : 'Students will be able to see and submit this assignment immediately'
                }
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setView('list')}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.classId || !formData.subjectId || !formData.dueDate}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting 
                  ? (view === 'edit' ? 'Updating...' : 'Creating...') 
                  : (view === 'edit' ? 'Update Assignment' : 'Create Assignment')
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}