import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  BarChart3,
  Download,
  TrendingUp,
  Users,
  Target,
  FileText,
  PieChart,
} from 'lucide-react'
import Link from 'next/link'

async function getResultsData() {
  try {
    const [examResults, recentExams, topPerformers] = await Promise.all([
      prisma.examResult.findMany({
        include: {
          exam: {
            include: {
              subject: {
                select: {
                  name: true,
                  code: true
                }
              },
              class: {
                select: {
                  name: true,
                  grade: true
                }
              }
            }
          },
          student: {
            select: {
              name: true,
              email: true,
              studentNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      
      prisma.exam.findMany({
        where: {
          date: {
            lt: new Date()
          }
        },
        include: {
          results: {
            select: {
              marksObtained: true
            }
          },
          subject: {
            select: {
              name: true
            }
          },
          class: {
            select: {
              name: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 10
      }),
      
      prisma.examResult.findMany({
        include: {
          student: {
            select: {
              name: true,
              studentNumber: true,
              class: {
                select: {
                  name: true
                }
              }
            }
          },
          exam: {
            select: {
              totalMarks: true,
              subject: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { marksObtained: 'desc' },
        take: 10
      })
    ])

    return { examResults, recentExams, topPerformers }
  } catch (error) {
    console.error('Error fetching results data:', error)
    return { examResults: [], recentExams: [], topPerformers: [] }
  }
}

function calculateGrade(marksObtained: number, totalMarks: number) {
  const percentage = (marksObtained / totalMarks) * 100
  if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' }
  if (percentage >= 80) return { grade: 'A', color: 'text-green-600' }
  if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' }
  if (percentage >= 60) return { grade: 'B', color: 'text-blue-600' }
  if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-600' }
  if (percentage >= 40) return { grade: 'C', color: 'text-orange-600' }
  return { grade: 'F', color: 'text-red-600' }
}

export default async function ResultsPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const { examResults, recentExams, topPerformers } = await getResultsData()

  const stats = {
    totalResults: examResults.length,
    averageScore: examResults.length > 0 
      ? Math.round(examResults.reduce((sum, r) => sum + (r.marksObtained / r.exam.totalMarks * 100), 0) / examResults.length)
      : 0,
    passRate: examResults.length > 0 
      ? Math.round((examResults.filter(r => r.marksObtained >= r.exam.passMarks).length / examResults.length) * 100)
      : 0,
    subjectsAnalyzed: [...new Set(examResults.map(r => r.exam.subject.name))].length
  }

  const gradeDistribution = {
    'A+': examResults.filter(r => (r.marksObtained / r.exam.totalMarks * 100) >= 90).length,
    'A': examResults.filter(r => {
      const percentage = r.marksObtained / r.exam.totalMarks * 100
      return percentage >= 80 && percentage < 90
    }).length,
    'B': examResults.filter(r => {
      const percentage = r.marksObtained / r.exam.totalMarks * 100
      return percentage >= 60 && percentage < 80
    }).length,
    'C': examResults.filter(r => {
      const percentage = r.marksObtained / r.exam.totalMarks * 100
      return percentage >= 40 && percentage < 60
    }).length,
    'F': examResults.filter(r => (r.marksObtained / r.exam.totalMarks * 100) < 40).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Academic Results
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track student performance and generate academic reports
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Results
          </Button>
          <Button asChild>
            <Link href="/admin/academics/results/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Advanced Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResults}</div>
            <p className="text-xs text-slate-500">Exam results recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageScore}%</div>
            <Progress value={stats.averageScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.passRate}%</div>
            <Progress value={stats.passRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Subjects Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.subjectsAnalyzed}</div>
            <p className="text-xs text-slate-500">Different subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Exam Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Exam Results</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search results..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentExams.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exam results available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExams.map((exam) => {
                  const avgScore = exam.results.length > 0 
                    ? Math.round(exam.results.reduce((sum, r) => sum + r.marksObtained, 0) / exam.results.length)
                    : 0
                  const avgPercentage = (avgScore / exam.totalMarks) * 100
                  
                  return (
                    <div key={exam.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {exam.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {exam.subject.name} • {exam.class.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {Math.round(avgPercentage)}%
                          </div>
                          <div className="text-xs text-slate-500">
                            Avg Score
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{exam.results.length} Results</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span>{exam.totalMarks} Total Marks</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/academics/results/exam/${exam.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Panel */}
        <div className="space-y-6">
          {/* Grade Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        grade === 'A+' || grade === 'A' ? 'bg-green-500' :
                        grade === 'B' ? 'bg-blue-500' :
                        grade === 'C' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">Grade {grade}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{count}</span>
                      <span className="text-xs text-slate-500">
                        ({stats.totalResults > 0 ? Math.round((count / stats.totalResults) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.slice(0, 5).map((result, index) => {
                  const percentage = (result.marksObtained / result.exam.totalMarks) * 100
                  const gradeInfo = calculateGrade(result.marksObtained, result.exam.totalMarks)
                  
                  return (
                    <div key={result.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{result.student.name}</div>
                          <div className="text-xs text-slate-500">
                            {result.student.class?.name} • {result.exam.subject.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${gradeInfo.color}`}>
                          {Math.round(percentage)}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {gradeInfo.grade}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/academics/results/performance" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Detailed performance trends and insights
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/academics/results/reports" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Generate Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Create custom academic progress reports
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/academics/results/comparison" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                Comparative Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Compare performance across classes and subjects
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
