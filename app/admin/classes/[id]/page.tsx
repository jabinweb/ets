"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClassHeader } from "@/components/admin/class-details/class-header"
import { ClassStats } from "@/components/admin/class-details/class-stats"
import { TeacherSection } from "@/components/admin/class-details/teacher-section"
import { StudentsSection } from "@/components/admin/class-details/students-section"
import { ClassTabs } from "@/components/admin/class-details/class-tabs"
import { 
  UserCheck,
  FileText,
  Calendar,
  Edit,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface ClassData {
  id: string
  name: string
  section: string
  grade: number
  capacity: number
  teacher: {
    id: string
    name: string
    email: string
    phone?: string
    qualification?: string
    specialization?: string
  } | null
  students: Array<{
    id: string
    name: string
    email: string
    studentNumber: string
    phone?: string
    parentName?: string
    parentEmail?: string
  }>
  subjects: Array<{
    id: string
    name: string
    code: string
    credits: number
  }>
  schedule: Array<{
    id: string
    day: string
    startTime: string
    endTime: string
    subject: {
      name: string
      code: string
    }
  }>
  stats: {
    totalStudents: number
    averageAttendance: number
    totalSubjects: number
    scheduleHours: number
  }
}

interface ClassDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'subjects' | 'schedule'>('overview')
  const [classId, setClassId] = useState<string>('')
  
  const router = useRouter()
  const { toast } = useToast()

  // Extract class ID from params
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setClassId(resolvedParams.id)
    }
    getParams()
  }, [params])

  const fetchClassData = useCallback(async () => {
    if (!classId) return
    
    try {
      const response = await fetch(`/api/admin/classes/${classId}`)
      const result = await response.json()
      
      if (result.success) {
        setClassData(result.data)
      } else {
        toast.error("Failed to load class data", {
          description: result.error || "Something went wrong"
        })
      }
    } catch (error) {
      console.error('Error fetching class data:', error)
      toast.error("Failed to load class", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [classId, toast])

  useEffect(() => {
    fetchClassData()
  }, [fetchClassData])

  const handleDeleteClass = async () => {
    if (!classData || !classId) return
    
    const confirmed = confirm(`Are you sure you want to delete ${classData.name}? This action cannot be undone.`)
    if (!confirmed) return

    const toastId = toast.loading("Deleting class...")

    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Class deleted successfully!", {
          description: `${classData.name} has been removed from the system`
        })
        router.push('/admin/classes')
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

  const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">Loading class details...</p>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <Alert>
          <AlertDescription>
            Class not found. It may have been deleted or the ID is incorrect.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/admin/classes">
            Back to Classes
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ClassHeader
        className={classData.name}
        grade={classData.grade}
        section={classData.section}
        capacity={classData.capacity}
        onDelete={handleDeleteClass}
      />

      <ClassStats stats={classData.stats} capacity={classData.capacity} />

      <TeacherSection
        teacher={classData.teacher}
        classId={classId}
        className={classData.name}
        onTeacherChange={fetchClassData}
      />

      <ClassTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Class Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Grade Level</div>
                    <div className="text-lg font-semibold">Grade {classData.grade}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Section</div>
                    <div className="text-lg font-semibold">{classData.section}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Enrollment</div>
                    <div className="text-lg font-semibold">{classData.stats.totalStudents}/{classData.capacity}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Occupancy Rate</div>
                    <div className="text-lg font-semibold">
                      {Math.round((classData.stats.totalStudents / classData.capacity) * 100)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>Attendance taken for today</span>
                    <span className="text-slate-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Math assignment submitted</span>
                    <span className="text-slate-500 ml-auto">5 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span>Schedule updated</span>
                    <span className="text-slate-500 ml-auto">1 day ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'students' && (
          <StudentsSection
            students={classData.students}
            classId={classId}
            className={classData.name}
            onStudentsChange={fetchClassData}
          />
        )}

        {activeTab === 'subjects' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assigned Subjects ({classData.subjects.length})</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classData.subjects.map((subject) => (
                  <Card key={subject.id} className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">{subject.name}</h4>
                        <Badge variant="outline">{subject.code}</Badge>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {subject.credits} credits
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'schedule' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Class Schedule</CardTitle>
                <Button asChild>
                  <Link href={`/admin/classes/schedules?classId=${classData.id}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Schedule
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="border border-slate-300 dark:border-slate-600 p-3 text-left font-medium">
                        Time
                      </th>
                      {daysOrder.map(day => (
                        <th key={day} className="border border-slate-300 dark:border-slate-600 p-3 text-center font-medium">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(classData.schedule.map(s => s.startTime))).sort().map(time => (
                      <tr key={time}>
                        <td className="border border-slate-300 dark:border-slate-600 p-3 font-medium bg-slate-50 dark:bg-slate-800">
                          {time}
                        </td>
                        {daysOrder.map(day => {
                          const scheduleItem = classData.schedule.find(s => s.day === day && s.startTime === time)
                          return (
                            <td key={day} className="border border-slate-300 dark:border-slate-600 p-2 align-top">
                              {scheduleItem && (
                                <div className="p-2 rounded text-xs bg-blue-100 text-blue-800 border-l-4 border-blue-500">
                                  <div className="font-medium">{scheduleItem.subject.name}</div>
                                  <div className="truncate">{scheduleItem.subject.code}</div>
                                  <div className="text-xs opacity-75">
                                    {scheduleItem.startTime} - {scheduleItem.endTime}
                                  </div>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
         