import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardRecentActivities } from "@/components/dashboard/dashboard-recent-activities"
import { DashboardUpcomingEvents } from "@/components/dashboard/dashboard-upcoming-events"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  MessageSquare, 
  Bell, 
  Plus,
  Users, 
  BookOpen, 
  Calendar, 
  UserCheck,
  CreditCard,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { PaymentStatus, ExamType } from '@prisma/client'

type RecentActivity = {
  id: string | number
  message: string
  time: string
  status: string
}

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const userRole = session.user?.role || "STUDENT"
  const userId = session.user?.id

  type StatsData = Record<string, string | number>
  // Dynamic stats for each role
  let stats: StatsData = {}

  let recentActivities: RecentActivity[] = []
  let upcomingEvents: { title: string; date: string; time: string }[] = []

  if (userRole === "TEACHER") {
    // Classes taught by this teacher
    const classes = await prisma.class.findMany({
      where: { teacherId: userId },
      include: { students: true }
    })
    const classIds = classes.map(c => c.id)
    const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0)
    // Today's attendance rate
    const today = new Date().toISOString().split("T")[0]
    const todayAttendanceSessions = await prisma.attendance.findMany({
      where: { classId: { in: classIds }, date: new Date(today) },
      include: { records: true }
    })
    let present = 0, total = 0
    todayAttendanceSessions.forEach(session => {
      present += session.records.filter(r => r.status === "PRESENT").length
      total += session.records.length
    })
    const todayAttendance = total > 0 ? Math.round((present / total) * 1000) / 10 : 0
    // Pending grades (assignments/exams not graded)
    const pendingGrades = await prisma.examResult.count({
      where: {
        exam: { classId: { in: classIds } },
        grade: null
      }
    })
    // Upcoming lessons (timetable entries in future)
    const upcomingLessons = await prisma.timetableEntry.count({
      where: {
        classId: { in: classIds },
        day: { in: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] }
      }
    })
    // Assignments due (exams of type ASSIGNMENT in future)
    const assignmentsDue = await prisma.exam.count({
      where: {
        classId: { in: classIds },
        type: ExamType.ASSIGNMENT,
        date: { gte: new Date() }
      }
    })
    stats = {
      myClasses: classes.length,
      totalStudents,
      todayAttendance,
      pendingGrades,
      upcomingLessons,
      assignmentsDue
    }
    // Recent activities for teacher
    recentActivities = [
      ...(
        await prisma.examResult.findMany({
          where: { exam: { classId: { in: classIds } } },
          orderBy: { createdAt: "desc" },
          take: 2,
          include: { exam: true, student: true }
        })
      ).map(r => ({
        id: r.id,
        message: `Assignment graded for ${r.student.name}`,
        time: r.createdAt.toLocaleDateString(),
        status: r.grade ? "completed" : "pending"
      })),
      ...(
        await prisma.announcement.findMany({
          where: { classId: { in: classIds } },
          orderBy: { createdAt: "desc" },
          take: 2
        })
      ).map(a => ({
        id: a.id,
        message: `New announcement posted: ${a.title}`,
        time: a.createdAt.toLocaleDateString(),
        status: a.isActive ? "active" : "completed"
      }))
    ].slice(0, 4)
    // Upcoming events (announcements of type EVENT)
    const teacherEvents = await prisma.announcement.findMany({
      where: {
        classId: { in: classIds },
        type: "EVENT",
        isActive: true,
        publishDate: { gte: new Date() }
      },
      orderBy: { publishDate: "asc" },
      take: 3,
      select: { title: true, publishDate: true }
    })
    upcomingEvents = teacherEvents.map(e => ({
      title: e.title,
      date: e.publishDate.toISOString().split("T")[0],
      time: e.publishDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    }))
  } else if (userRole === "STUDENT") {
    // Student stats
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: { class: true }
    })
    // GPA (average grade from exam results)
    const grades = await prisma.examResult.findMany({
      where: { studentId: userId, grade: { not: null } },
      select: { grade: true }
    })
    // Simple GPA mapping (A=4, B=3, C=2, D=1, F=0)
    const gradeMap: Record<string, number> = { "A": 4, "A-": 3.7, "B+": 3.3, "B": 3, "B-": 2.7, "C+": 2.3, "C": 2, "C-": 1.7, "D": 1, "F": 0 }
    const gpa = grades.length > 0 ? (grades.reduce((sum, g) => sum + (gradeMap[g.grade!] || 0), 0) / grades.length).toFixed(2) : "N/A"
    // Attendance rate
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId: userId }
    })
    const attendanceRate = attendanceRecords.length > 0
      ? Math.round((attendanceRecords.filter(r => r.status === "PRESENT").length / attendanceRecords.length) * 1000) / 10
      : 0
    // Assignments due (future exams of type ASSIGNMENT)
    const assignmentsDue = await prisma.exam.count({
      where: {
        classId: student?.classId || "",
        type: ExamType.ASSIGNMENT,
        date: { gte: new Date() }
      }
    })
    // Upcoming exams
    const upcomingExams = await prisma.exam.count({
      where: {
        classId: student?.classId || "",
        date: { gte: new Date() }
      }
    })
    // Extracurriculars (dummy: 0)
    // Credits completed (dummy: 0)
    stats = {
      myGrades: gpa,
      attendanceRate,
      assignmentsDue,
      upcomingExams,
      extracurriculars: 0,
      creditsCompleted: 0
    }
    // Recent activities for student
    recentActivities = [
      ...(
        await prisma.exam.findMany({
          where: { classId: student?.classId || "" },
          orderBy: { date: "asc" },
          take: 2
        })
      ).map(e => ({
        id: e.id,
        message: `${e.title} due on ${e.date.toLocaleDateString()}`,
        time: e.date.toLocaleDateString(),
        status: "pending"
      })),
      ...(
        await prisma.announcement.findMany({
          where: { classId: student?.classId || "" },
          orderBy: { createdAt: "desc" },
          take: 2
        })
      ).map(a => ({
        id: a.id,
        message: `Announcement: ${a.title}`,
        time: a.createdAt.toLocaleDateString(),
        status: a.isActive ? "active" : "completed"
      }))
    ].slice(0, 4)
    // Upcoming events (announcements of type EVENT)
    const studentEvents = await prisma.announcement.findMany({
      where: {
        classId: student?.classId || "",
        type: "EVENT",
        isActive: true,
        publishDate: { gte: new Date() }
      },
      orderBy: { publishDate: "asc" },
      take: 3,
      select: { title: true, publishDate: true }
    })
    upcomingEvents = studentEvents.map(e => ({
      title: e.title,
      date: e.publishDate.toISOString().split("T")[0],
      time: e.publishDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    }))
  } 

  const getRoleBasedGreeting = (role: string) => {
    switch (role) {
      case "TEACHER": return "Ready to equip the next generation of ministry leaders?"
      case "STUDENT": return "Continue your journey in theological education!"
      default: return "Welcome to North India Baptist Seminary!"
    }
  }

  function renderRoleBasedQuickActions(userRole: string) {
    switch (userRole) {
      case "TEACHER":
        return (
          <>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/classes">
                <BookOpen className="h-4 w-4 mr-2" />
                My Classes
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/exams">
                <FileText className="h-4 w-4 mr-2" />
                Manage Exams
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/attendance">
                <UserCheck className="h-4 w-4 mr-2" />
                Take Attendance
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/announcements">
                <Bell className="h-4 w-4 mr-2" />
                Post Announcement
              </Link>
            </Button>
          </>
        )
      case "STUDENT":
        return (
          <>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/assignments">
                <FileText className="h-4 w-4 mr-2" />
                View Assignments
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/exams">
                <FileText className="h-4 w-4 mr-2" />
                My Exams
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/timetable">
                <Calendar className="h-4 w-4 mr-2" />
                Class Schedule
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/materials">
                <BookOpen className="h-4 w-4 mr-2" />
                Course Materials
              </Link>
            </Button>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              {getRoleBasedGreeting(userRole)}
            </p>
            <Badge variant="outline" className="mt-2">
              {userRole}
            </Badge>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-initial" asChild>
              <Link href="/dashboard/announcements">
                <Bell className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Announcements</span>
              </Link>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-initial" asChild>
              <Link href="/dashboard/profile">
                <MessageSquare className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">My Profile</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* @ts-expect-error - stats type is dynamic based on role */}
          <DashboardStats userRole={userRole} stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Activities */}
          <DashboardRecentActivities recentActivities={recentActivities} />

          {/* Quick Actions & Events */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {renderRoleBasedQuickActions(userRole)}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <DashboardUpcomingEvents upcomingEvents={upcomingEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}
