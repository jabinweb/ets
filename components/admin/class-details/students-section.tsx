"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck, 
  Mail, 
  Edit,
  X,
  Check,
  UserMinus
} from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  studentNumber: string
  phone?: string
  parentName?: string
  parentEmail?: string
}

interface AvailableStudent {
  id: string
  name: string
  email: string
  studentNumber: string
  class?: {
    name: string
    grade: number
  } | null
}

interface StudentsSectionProps {
  students: Student[]
  classId: string
  className: string
  onStudentsChange: () => void
}

export function StudentsSection({ students, classId, className, onStudentsChange }: StudentsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const { toast } = useToast()

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchAvailableStudents = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/students?unassigned=true')
      const result = await response.json()
      
      if (result.success && result.data?.students) {
        setAvailableStudents(result.data.students)
      } else {
        setAvailableStudents([])
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      setAvailableStudents([])
      toast.error("Failed to load available students")
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const handleAssignStudents = async () => {
    if (selectedStudents.size === 0) {
      toast.error("Please select at least one student")
      return
    }

    const confirmed = confirm(`Are you sure you want to assign ${selectedStudents.size} student(s) to ${className}?`)
    if (!confirmed) return

    setIsAssigning(true)
    const toastId = toast.loading("Assigning students...")

    try {
      const response = await fetch(`/api/admin/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: Array.from(selectedStudents) })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Students assigned successfully!", {
          description: `${selectedStudents.size} student(s) have been assigned to ${className}`
        })
        
        onStudentsChange()
        setShowAssignModal(false)
        setSelectedStudents(new Set())
      } else {
        throw new Error(result.error || 'Failed to assign students')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign students'
      toast.error("Assignment failed", { description: errorMessage })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    const confirmed = confirm(`Are you sure you want to remove ${studentName} from ${className}?`)
    if (!confirmed) return

    const toastId = toast.loading("Removing student...")

    try {
      const response = await fetch(`/api/admin/classes/${classId}/students/${studentId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Student removed successfully!", {
          description: `${studentName} has been removed from ${className}`
        })
        
        onStudentsChange()
      } else {
        throw new Error(result.error || 'Failed to remove student')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove student'
      toast.error("Removal failed", { description: errorMessage })
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents)
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId)
    } else {
      newSelection.add(studentId)
    }
    setSelectedStudents(newSelection)
  }

  const selectAllStudents = () => {
    if (selectedStudents.size === availableStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(availableStudents.map(s => s.id)))
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({students.length})
            </CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => {
                setShowAssignModal(true)
                fetchAvailableStudents()
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Students
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="" alt={student.name} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{student.name}</h4>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {student.studentNumber} • {student.email}
                    </div>
                    {student.parentName && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Parent: {student.parentName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <UserCheck className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveStudent(student.id, student.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
            
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found</p>
                <Button onClick={() => {
                  setShowAssignModal(true)
                  fetchAvailableStudents()
                }} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign First Student
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assign Students Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assign Students to {className}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAssignModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading available students...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedStudents.size === availableStudents.length && availableStudents.length > 0}
                        onCheckedChange={selectAllStudents}
                      />
                      <span className="text-sm font-medium">
                        Select All ({availableStudents.length} available)
                      </span>
                    </div>
                    <Badge variant="outline">
                      {selectedStudents.size} selected
                    </Badge>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Checkbox
                          checked={selectedStudents.has(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id)}
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">{student.name}</h4>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {student.studentNumber} • {student.email}
                          </div>
                          {student.class && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Currently in {student.class.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {availableStudents.length === 0 && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No available students to assign</p>
                      <p className="text-sm">All students are already assigned to classes</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAssignModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAssignStudents}
                      disabled={selectedStudents.size === 0 || isAssigning}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {isAssigning ? 'Assigning...' : `Assign ${selectedStudents.size} Student(s)`}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
