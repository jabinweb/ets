"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Building
} from 'lucide-react'
import Link from 'next/link'

interface Teacher {
  id: string
  name: string
  email: string
  phone?: string
  qualification?: string
  experience?: number
  specialization?: string
  dateOfJoining?: string
  subjectCount: number
  classCount: number
}

interface TeachersData {
  teachers: Teacher[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTeachers, setTotalTeachers] = useState(0)
  const { toast } = useToast()

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/teachers?page=${currentPage}&search=${searchTerm}`)
      const result = await response.json()
      
      if (result.success) {
        const data = result.data as TeachersData
        setTeachers(data.teachers || [])
        setTotalPages(data.pagination.pages)
        setTotalTeachers(data.pagination.total)
      } else {
        toast.error("Failed to load teachers", {
          description: result.error || "Something went wrong"
        })
      }
    } catch {
      toast.error("Failed to load teachers", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm, toast])

  useEffect(() => {
    fetchTeachers()
  }, [fetchTeachers])

  const handleDelete = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.name}?`)) {
      return
    }

    const toastId = toast.loading("Deleting teacher...")

    try {
      const response = await fetch(`/api/admin/teachers/${teacher.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Teacher deleted!", {
          description: `${teacher.name} has been removed from the system`
        })
        fetchTeachers()
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

  const stats = {
    totalTeachers,
    activeTeachers: teachers.filter(t => t.subjectCount > 0).length,
    newThisMonth: teachers.filter(t => {
      if (!t.dateOfJoining) return false
      const joinDate = new Date(t.dateOfJoining)
      const now = new Date()
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
    }).length,
    avgExperience: teachers.length > 0 
      ? Math.round(teachers.reduce((sum, t) => sum + (t.experience || 0), 0) / teachers.length)
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Teachers Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage faculty members and their assignments
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/teachers/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Link>
        </Button>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeTeachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgExperience} yrs</div>
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
                placeholder="Search teachers by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Subject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Teachers ({totalTeachers})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading teachers...</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No teachers found</p>
              <Button asChild className="mt-4">
                <Link href="/admin/teachers/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Teacher
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teachers.map((teacher) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {teacher.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{teacher.email}</span>
                          </div>
                          {teacher.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{teacher.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(teacher)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Qualification</div>
                        <div className="text-sm font-medium">{teacher.qualification || 'Not specified'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Subjects</div>
                        <div className="text-sm font-medium">{teacher.subjectCount} assigned</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Classes</div>
                        <div className="text-sm font-medium">{teacher.classCount} assigned</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Experience</div>
                        <div className="text-sm font-medium">{teacher.experience || 0} years</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    {teacher.specialization && (
                      <Badge variant="outline">{teacher.specialization}</Badge>
                    )}
                    {teacher.subjectCount > 0 && (
                      <Badge variant="default">Active</Badge>
                    )}
                    {teacher.dateOfJoining && (
                      <Badge variant="outline">
                        Joined {new Date(teacher.dateOfJoining).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
                      