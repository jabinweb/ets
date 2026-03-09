import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter,
  FileText,
  Plus,
  Edit,
  Eye,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { ExamType } from '@prisma/client'

async function getExamsData() {
  try {
    const [exams, upcomingExams, completedExams] = await Promise.all([
      prisma.exam.findMany({
        include: {
          class: {
            select: {
              name: true,
              grade: true
            }
          },
          subject: {
            select: {
              name: true,
              code: true
            }
          },
          results: {
            select: {
              id: true,
              marksObtained: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }),
      
      prisma.exam.count({
        where: {
          date: {
            gte: new Date()
          }
        }
      }),
      
      prisma.exam.count({
        where: {
          date: {
            lt: new Date()
          }
        }
      })
    ])

    return { exams, upcomingExams, completedExams }
  } catch (error) {
    console.error('Error fetching exams data:', error)
    return { exams: [], upcomingExams: 0, completedExams: 0 }
  }
}

function getExamTypeColor(type: ExamType) {
  switch (type) {
    case 'QUIZ': return 'bg-blue-100 text-blue-800'
    case 'MIDTERM': return 'bg-orange-100 text-orange-800'
    case 'FINAL': return 'bg-red-100 text-red-800'
    case 'ASSIGNMENT': return 'bg-green-100 text-green-800'
    case 'PROJECT': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getExamStatus(examDate: Date) {
  const now = new Date()
  const timeDiff = examDate.getTime() - now.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
  
  if (daysDiff < 0) return { status: 'completed', text: 'Completed', color: 'text-green-600' }
  if (daysDiff === 0) return { status: 'today', text: 'Today', color: 'text-red-600' }
  if (daysDiff <= 7) return { status: 'upcoming', text: `In ${daysDiff} days`, color: 'text-orange-600' }
  return { status: 'scheduled', text: `In ${daysDiff} days`, color: 'text-blue-600' }
}

export default async function ExamsPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const { exams, upcomingExams, completedExams } = await getExamsData()

  const stats = {
    totalExams: exams.length,
    upcomingExams,
    completedExams,
    averageMarks: exams.length > 0 ? Math.round(
      exams
        .filter(exam => exam.results.length > 0)
        .reduce((sum, exam) => {
          const avgMarks = exam.results.reduce((s, r) => s + r.marksObtained, 0) / exam.results.length
          return sum + avgMarks
        }, 0) / exams.filter(exam => exam.results.length > 0).length
    ) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Examination Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Create, schedule, and manage examinations and assessments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/academics/exams/schedule">
              <Calendar className="h-4 w-4 mr-2" />
              Exam Schedule
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/academics/exams/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExams}</div>
            <p className="text-xs text-slate-500">This academic year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingExams}</div>
            <p className="text-xs text-slate-500">Scheduled ahead</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedExams}</div>
            <p className="text-xs text-slate-500">Results available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageMarks}%</div>
            <p className="text-xs text-slate-500">Across all exams</p>
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
                placeholder="Search exams by title, subject, or class..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exams List */}
      <Card>
        <CardHeader>
          <CardTitle>All Examinations</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exams scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => {
                const status = getExamStatus(exam.date)
                const averageScore = exam.results.length > 0 
                  ? Math.round(exam.results.reduce((sum, r) => sum + r.marksObtained, 0) / exam.results.length)
                  : null
                
                return (
                  <div key={exam.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                            {exam.title}
                          </h3>
                          <Badge className={getExamTypeColor(exam.type)}>
                            {exam.type}
                          </Badge>
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                          {exam.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/academics/exams/${exam.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>{new Date(exam.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{exam.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span>{exam.class.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-slate-400" />
                        <span>{exam.subject.name}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Total Marks:</span>
                            <span className="ml-1 font-medium">{exam.totalMarks}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Pass Marks:</span>
                            <span className="ml-1 font-medium">{exam.passMarks}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Results:</span>
                            <span className="ml-1 font-medium">{exam.results.length} submitted</span>
                          </div>
                        </div>
                        {averageScore && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Average Score:</span>
                            <Badge variant={averageScore >= exam.passMarks ? "default" : "destructive"}>
                              {averageScore}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/academics/exams/question-bank" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Question Bank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Manage exam questions and question papers
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/academics/exams/grading" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Grading System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Configure grading scales and evaluation criteria
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/academics/exams/analytics" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                Exam Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Performance analytics and detailed reports
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
