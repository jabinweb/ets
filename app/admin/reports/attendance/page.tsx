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
  UserCheck,
  Download,
  Filter,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface AttendanceStats {
  overallRate: number
  studentRate: number
  staffRate: number
  presentToday: number
  absentToday: number
  lateToday: number
}

interface ClassAttendance {
  className: string
  grade: string
  totalStudents: number
  present: number
  absent: number
  late: number
  attendanceRate: number
}

interface DailyAttendance {
  date: string
  present: number
  absent: number
  late: number
  rate: number
}

interface StaffAttendance {
  department: string
  totalStaff: number
  present: number
  absent: number
  onLeave: number
  attendanceRate: number
}

export default function AttendanceReportsPage() {
  const [period, setPeriod] = useState('this-month')
  const [category, setCategory] = useState('all')
  const [gradeLevel, setGradeLevel] = useState('all')
  const [loading, setLoading] = useState(false)

  const stats: AttendanceStats = {
    overallRate: 92.5,
    studentRate: 91.8,
    staffRate: 96.2,
    presentToday: 1245,
    absentToday: 98,
    lateToday: 42
  }

  const classAttendance: ClassAttendance[] = [
    { className: 'Class 10-A', grade: '10', totalStudents: 42, present: 40, absent: 1, late: 1, attendanceRate: 95.2 },
    { className: 'Class 10-B', grade: '10', totalStudents: 40, present: 37, absent: 2, late: 1, attendanceRate: 92.5 },
    { className: 'Class 9-A', grade: '9', totalStudents: 45, present: 43, absent: 1, late: 1, attendanceRate: 95.6 },
    { className: 'Class 9-B', grade: '9', totalStudents: 43, present: 39, absent: 3, late: 1, attendanceRate: 90.7 },
    { className: 'Class 8-A', grade: '8', totalStudents: 48, present: 44, absent: 2, late: 2, attendanceRate: 91.7 },
    { className: 'Class 8-B', grade: '8', totalStudents: 46, present: 42, absent: 3, late: 1, attendanceRate: 91.3 }
  ]

  const dailyAttendance: DailyAttendance[] = [
    { date: 'Mon, Jan 15', present: 1258, absent: 95, late: 32, rate: 92.8 },
    { date: 'Tue, Jan 16', present: 1265, absent: 88, late: 38, rate: 93.2 },
    { date: 'Wed, Jan 17', present: 1242, absent: 102, late: 45, rate: 91.5 },
    { date: 'Thu, Jan 18', present: 1271, absent: 85, late: 35, rate: 93.8 },
    { date: 'Fri, Jan 19', present: 1238, absent: 108, late: 48, rate: 91.2 },
    { date: 'Sat, Jan 20', present: 1245, absent: 98, late: 42, rate: 92.5 }
  ]

  const staffAttendance: StaffAttendance[] = [
    { department: 'Academic Staff', totalStaff: 85, present: 82, absent: 1, onLeave: 2, attendanceRate: 96.5 },
    { department: 'Administrative', totalStaff: 32, present: 31, absent: 1, onLeave: 0, attendanceRate: 96.9 },
    { department: 'Support Staff', totalStaff: 45, present: 43, absent: 2, onLeave: 0, attendanceRate: 95.6 },
    { department: 'IT Department', totalStaff: 12, present: 12, absent: 0, onLeave: 0, attendanceRate: 100.0 },
    { department: 'Maintenance', totalStaff: 18, present: 17, absent: 1, onLeave: 0, attendanceRate: 94.4 }
  ]

  const handleExportReport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Attendance report exported successfully!')
    }, 1500)
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 85) return 'text-blue-600'
    if (rate >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAttendanceBadge = (rate: number) => {
    if (rate >= 95) return 'default'
    if (rate >= 85) return 'secondary'
    return 'destructive'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Attendance Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Student and staff attendance tracking and analytics
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
              <Label>Time Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="staff">Staff Only</SelectItem>
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
              <Label>Report Format</Label>
              <Select defaultValue="summary">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Overall Rate
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.overallRate}%
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +1.2% vs last month
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Student Rate
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.studentRate}%
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.8% improvement
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Staff Rate
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.staffRate}%
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Excellent
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Present Today
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.presentToday}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Students & Staff
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Absent Today
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.absentToday}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Requires follow-up
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Late Today
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.lateToday}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Punctuality tracking
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Class-wise Attendance
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
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Total
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Present
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Absent
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Late
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {classAttendance.map((data, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {data.className}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {data.grade}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                      {data.totalStudents}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="default">{data.present}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="destructive">{data.absent}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">{data.late}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${getAttendanceColor(data.attendanceRate)}`}>
                        {data.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Daily Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Attendance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Date
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Present
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Absent
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Late
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyAttendance.map((data, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {data.date}
                    </td>
                    <td className="py-3 px-4 text-center text-green-600 font-medium">
                      {data.present}
                    </td>
                    <td className="py-3 px-4 text-center text-red-600 font-medium">
                      {data.absent}
                    </td>
                    <td className="py-3 px-4 text-center text-yellow-600 font-medium">
                      {data.late}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={getAttendanceBadge(data.rate)}>
                        {data.rate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Staff Attendance by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Department
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Total Staff
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Present
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Absent
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    On Leave
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffAttendance.map((data, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {data.department}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                      {data.totalStaff}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="default">{data.present}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="destructive">{data.absent}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary">{data.onLeave}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${getAttendanceColor(data.attendanceRate)}`}>
                        {data.attendanceRate}%
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
