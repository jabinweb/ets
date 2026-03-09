"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BookOpen,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  BarChart3,
  GraduationCap
} from 'lucide-react'

interface AcademicStats {
  averageScore: number
  topPerformers: number
  needsImprovement: number
  passRate: number
}

interface SubjectPerformance {
  subject: string
  averageScore: number
  totalStudents: number
  passRate: number
  highestScore: number
  lowestScore: number
  trend: 'up' | 'down' | 'stable'
}

interface ClassPerformance {
  className: string
  grade: string
  totalStudents: number
  averageScore: number
  attendanceRate: number
  passRate: number
}

export default function AcademicReportsPage() {
  const [academicYear, setAcademicYear] = useState('2024-2025')
  const [semester, setSemester] = useState('FIRST')
  const [gradeLevel, setGradeLevel] = useState('all')
  const [reportType, setReportType] = useState('overview')
  const [loading, setLoading] = useState(false)

  const stats: AcademicStats = {
    averageScore: 78.5,
    topPerformers: 145,
    needsImprovement: 32,
    passRate: 89.2
  }

  const subjectPerformance: SubjectPerformance[] = [
    {
      subject: 'Mathematics',
      averageScore: 82.3,
      totalStudents: 450,
      passRate: 87.5,
      highestScore: 98,
      lowestScore: 45,
      trend: 'up'
    },
    {
      subject: 'Science',
      averageScore: 79.8,
      totalStudents: 450,
      passRate: 85.2,
      highestScore: 96,
      lowestScore: 42,
      trend: 'up'
    },
    {
      subject: 'English',
      averageScore: 76.5,
      totalStudents: 450,
      passRate: 82.1,
      highestScore: 95,
      lowestScore: 38,
      trend: 'down'
    },
    {
      subject: 'Social Studies',
      averageScore: 81.2,
      totalStudents: 450,
      passRate: 88.9,
      highestScore: 97,
      lowestScore: 48,
      trend: 'stable'
    },
    {
      subject: 'Computer Science',
      averageScore: 84.6,
      totalStudents: 380,
      passRate: 91.2,
      highestScore: 99,
      lowestScore: 52,
      trend: 'up'
    }
  ]

  const classPerformance: ClassPerformance[] = [
    {
      className: 'Class 10-A',
      grade: '10',
      totalStudents: 42,
      averageScore: 84.2,
      attendanceRate: 94.5,
      passRate: 92.8
    },
    {
      className: 'Class 10-B',
      grade: '10',
      totalStudents: 40,
      averageScore: 79.8,
      attendanceRate: 91.2,
      passRate: 87.5
    },
    {
      className: 'Class 9-A',
      grade: '9',
      totalStudents: 45,
      averageScore: 82.5,
      attendanceRate: 93.8,
      passRate: 90.2
    },
    {
      className: 'Class 9-B',
      grade: '9',
      totalStudents: 43,
      averageScore: 77.3,
      attendanceRate: 89.5,
      passRate: 84.6
    },
    {
      className: 'Class 8-A',
      grade: '8',
      totalStudents: 48,
      averageScore: 75.6,
      attendanceRate: 92.1,
      passRate: 81.2
    }
  ]

  const handleExportReport = () => {
    setLoading(true)
    // Simulate export
    setTimeout(() => {
      setLoading(false)
      alert('Report exported successfully!')
    }, 1500)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Academic Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive academic performance and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button onClick={handleExportReport} disabled={loading} className="gap-2">
            <Download className="h-4 w-4" />
            {loading ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Semester</Label>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIRST">First Semester</SelectItem>
                  <SelectItem value="SECOND">Second Semester</SelectItem>
                  <SelectItem value="ANNUAL">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grade Level</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="trends">Trends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.averageScore}%
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.5% from last semester
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Top Performers
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.topPerformers}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Score above 85%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Needs Improvement
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.needsImprovement}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Score below 60%
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pass Rate
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.passRate}%
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +1.8% from last semester
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Students
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Average Score
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Pass Rate
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Highest
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Lowest
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjectPerformance.map((subject, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {subject.subject}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {subject.totalStudents}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${getScoreColor(subject.averageScore)}`}>
                        {subject.averageScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={subject.passRate >= 85 ? 'default' : 'secondary'}>
                        {subject.passRate}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-green-600 font-medium">
                      {subject.highestScore}
                    </td>
                    <td className="py-3 px-4 text-red-600 font-medium">
                      {subject.lowestScore}
                    </td>
                    <td className="py-3 px-4">
                      {getTrendIcon(subject.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Class Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Class-wise Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Class
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Grade
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Students
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Avg Score
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Attendance
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Pass Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {classPerformance.map((classData, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {classData.className}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {classData.grade}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {classData.totalStudents}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${getScoreColor(classData.averageScore)}`}>
                        {classData.averageScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={classData.attendanceRate >= 90 ? 'default' : 'secondary'}>
                        {classData.attendanceRate}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${getScoreColor(classData.passRate)}`}>
                        {classData.passRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
