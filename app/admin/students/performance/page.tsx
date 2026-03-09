/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Download,
  Filter,
  Users
} from "lucide-react"
import Link from "next/link"

export default async function StudentsPerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; search?: string; status?: string }>
}) {
  const session = await auth()
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const params = await searchParams
  const classFilter = params.class && params.class !== 'all-classes' ? params.class : undefined
  const searchQuery = params.search
  const statusFilter = params.status && params.status !== 'all-status' ? params.status : undefined

  // Get all classes for filter
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      grade: true
    },
    orderBy: { grade: 'asc' }
  })

  // Build where clause
  const whereClause: {
    role: 'STUDENT'
    classId?: string
    OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' }; studentNumber?: { contains: string; mode: 'insensitive' } }>
  } = {
    role: "STUDENT" as const
  }

  if (classFilter) {
    whereClause.classId = classFilter
  }

  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { email: { contains: searchQuery, mode: 'insensitive' } },
      { studentNumber: { contains: searchQuery, mode: 'insensitive' } }
    ]
  }

  // Get students with their performance data
  const students = await prisma.user.findMany({
    where: whereClause,
    include: {
      class: {
        select: {
          name: true,
          grade: true
        }
      },
      examResults: {
        include: {
          exam: {
            include: {
              subject: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      },
      attendanceRecords: {
        select: {
          status: true
        }
      },
      subjectPerformances: {
        include: {
          subject: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Calculate performance metrics for each student
  const studentsWithMetrics = students.map((student: any) => {
    // Calculate GPA
    const gradesWithScores = student.examResults.filter((r: any) => r.grade)
    const gradeMap: Record<string, number> = { 
      "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, 
      "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0 
    }
    const gpa = gradesWithScores.length > 0
      ? gradesWithScores.reduce((sum: number, r: any) => sum + (gradeMap[r.grade!] || 0), 0) / gradesWithScores.length
      : 0

    // Calculate attendance rate
    const totalAttendance = student.attendanceRecords.length
    const presentCount = student.attendanceRecords.filter((r: any) => r.status === 'PRESENT').length
    const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0

    // Determine status
    let status: 'excellent' | 'good' | 'average' | 'needs_attention' = 'average'
    if (gpa >= 3.5 && attendanceRate >= 95) status = 'excellent'
    else if (gpa >= 3.0 && attendanceRate >= 85) status = 'good'
    else if (gpa < 2.0 || attendanceRate < 75) status = 'needs_attention'

    return {
      ...student,
      metrics: {
        gpa: Number(gpa.toFixed(2)),
        attendanceRate: Number(attendanceRate.toFixed(1)),
        totalExams: student.examResults.length,
        status
      }
    }
  })

  // Filter by status if provided
  const filteredStudents = statusFilter
    ? studentsWithMetrics.filter(s => s.metrics.status === statusFilter)
    : studentsWithMetrics

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Excellent</Badge>
      case 'good':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Good</Badge>
      case 'average':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Average</Badge>
      case 'needs_attention':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Needs Attention</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate summary stats
  const totalStudents = filteredStudents.length
  const excellentCount = filteredStudents.filter(s => s.metrics.status === 'excellent').length
  const needsAttentionCount = filteredStudents.filter(s => s.metrics.status === 'needs_attention').length
  const avgGPA = filteredStudents.length > 0
    ? filteredStudents.reduce((sum, s) => sum + s.metrics.gpa, 0) / filteredStudents.length
    : 0
  const avgAttendance = filteredStudents.length > 0
    ? filteredStudents.reduce((sum, s) => sum + s.metrics.attendanceRate, 0) / filteredStudents.length
    : 0

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Performance</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and analyze student academic performance
          </p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {excellentCount} excellent performers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 4.0 scale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{needsAttentionCount}</div>
            <p className="text-xs text-muted-foreground">
              Students requiring support
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search by name, email, or student number..."
                  defaultValue={searchQuery}
                  className="pl-10"
                />
              </div>
            </div>
            <Select name="class" defaultValue={classFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-classes">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} (Grade {cls.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="status" defaultValue={statusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="needs_attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full sm:w-auto">Apply</Button>
          </form>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Overview</CardTitle>
          <CardDescription>
            Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-center">GPA</TableHead>
                  <TableHead className="text-center">Attendance</TableHead>
                  <TableHead className="text-center">Exams</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </TableCell>
                      <TableCell>
                        {student.class ? (
                          <div>
                            <div className="font-medium">{student.class.name}</div>
                            <div className="text-sm text-muted-foreground">Grade {student.class.grade}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No class</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold">{student.metrics.gpa.toFixed(2)}</span>
                          {student.metrics.gpa >= 3.5 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : student.metrics.gpa < 2.5 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Minus className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={
                          student.metrics.attendanceRate >= 90 ? "text-green-600 font-medium" :
                          student.metrics.attendanceRate < 75 ? "text-red-600 font-medium" :
                          "text-yellow-600 font-medium"
                        }>
                          {student.metrics.attendanceRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{student.metrics.totalExams}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(student.metrics.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/students/${student.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
