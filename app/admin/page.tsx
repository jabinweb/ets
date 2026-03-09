import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Bell,
  UserCheck,
  CreditCard,
  BarChart3,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { Role, ApplicationStatus, PaymentStatus, AttendanceStatus } from '@prisma/client'

async function getAdminStats() {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingAdmissions,
      activeAnnouncements,
      recentAttendance,
      monthlyRevenue,
      upcomingEvents
    ] = await Promise.all([
      // Total students
      prisma.user.count({
        where: { role: Role.STUDENT }
      }),
      
      // Total teachers
      prisma.user.count({
        where: { role: Role.TEACHER }
      }),
      
      // Total classes
      prisma.class.count(),
      
      // Pending admissions
      prisma.admissionApplication.count({
        where: { 
          status: {
            in: [ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.INTERVIEW_SCHEDULED]
          }
        }
      }),
      
      // Active announcements
      prisma.announcement.count({
        where: { 
          isActive: true,
          OR: [
            { expiryDate: null },
            { expiryDate: { gte: new Date() } }
          ]
        }
      }),
      
      // Recent attendance for average calculation
      prisma.attendanceRecord.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        select: {
          status: true
        }
      }),
      
      // Monthly revenue
      prisma.feePayment.aggregate({
        where: {
          status: PaymentStatus.PAID,
          paymentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // This month
          }
        },
        _sum: {
          amountPaid: true
        }
      }),
      
      // Upcoming events (announcements with future dates)
      prisma.announcement.count({
        where: {
          type: 'EVENT',
          isActive: true,
          publishDate: {
            gte: new Date()
          }
        }
      })
    ])

    // Calculate attendance rate
    const totalAttendanceRecords = recentAttendance.length
    const presentRecords = recentAttendance.filter(record => record.status === AttendanceStatus.PRESENT).length
    const avgAttendance = totalAttendanceRecords > 0 ? (presentRecords / totalAttendanceRecords) * 100 : 0

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      avgAttendance: Math.round(avgAttendance * 10) / 10,
      pendingAdmissions,
      upcomingEvents,
      monthlyRevenue: Number(monthlyRevenue._sum.amountPaid || 0),
      activeAnnouncements
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      avgAttendance: 0,
      pendingAdmissions: 0,
      upcomingEvents: 0,
      monthlyRevenue: 0,
      activeAnnouncements: 0
    }
  }
}

async function getRecentActivities() {
  try {
    interface Activity {
      id: string
      type: 'admission' | 'attendance' | 'payment' | 'announcement'
      message: string
      time: string
      status: 'pending' | 'completed' | 'active'
    }

    const activities: Activity[] = []

    // Recent admission applications
    const recentApplications = await prisma.admissionApplication.findMany({
      take: 2,
      orderBy: { submittedAt: 'desc' },
      select: {
        studentFirstName: true,
        studentLastName: true,
        submittedAt: true,
        status: true
      }
    })

    recentApplications.forEach((app, index) => {
      activities.push({
        id: `app-${app.submittedAt.getTime()}-${index}`,
        type: 'admission',
        message: `New admission application from ${app.studentFirstName} ${app.studentLastName}`,
        time: getTimeAgo(app.submittedAt),
        status: app.status === ApplicationStatus.PENDING ? 'pending' : 'completed'
      })
    })

    // Recent attendance records
    const recentAttendance = await prisma.attendance.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      include: {
        class: {
          select: { name: true }
        }
      }
    })

    recentAttendance.forEach((attendance, index) => {
      activities.push({
        id: `att-${attendance.createdAt.getTime()}-${index}`,
        type: 'attendance',
        message: `Attendance marked for ${attendance.class.name}`,
        time: getTimeAgo(attendance.createdAt),
        status: 'completed'
      })
    })

    // Recent payments
    const recentPayments = await prisma.feePayment.findMany({
      take: 2,
      where: { status: PaymentStatus.PAID },
      orderBy: { paymentDate: 'desc' },
      include: {
        student: {
          select: { name: true }
        }
      }
    })

    recentPayments.forEach((payment, index) => {
      activities.push({
        id: `pay-${payment.paymentDate?.getTime()}-${index}`,
        type: 'payment',
        message: `Fee payment received from ${payment.student.name}`,
        time: getTimeAgo(payment.paymentDate || payment.createdAt),
        status: 'completed'
      })
    })

    // Recent announcements
    const recentAnnouncements = await prisma.announcement.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        createdAt: true,
        isActive: true
      }
    })

    recentAnnouncements.forEach((announcement, index) => {
      activities.push({
        id: `ann-${announcement.createdAt.getTime()}-${index}`,
        type: 'announcement',
        message: `New announcement posted: ${announcement.title}`,
        time: getTimeAgo(announcement.createdAt),
        status: announcement.isActive ? 'active' : 'completed'
      })
    })

    // Sort by time and return most recent 4
    return activities
      .sort((a, b) => {
        const timeA = new Date(a.time.includes('ago') ? Date.now() : a.time).getTime();
        const timeB = new Date(b.time.includes('ago') ? Date.now() : b.time).getTime();
        return timeB - timeA; // Sort descending (newest first)
      })
      .slice(0, 4)

  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}

async function getUpcomingEvents() {
  try {
    const events = await prisma.announcement.findMany({
      where: {
        type: 'EVENT',
        isActive: true,
        publishDate: {
          gte: new Date()
        }
      },
      take: 3,
      orderBy: { publishDate: 'asc' },
      select: {
        title: true,
        publishDate: true,
        content: true
      }
    })

    return events.map(event => ({
      title: event.title,
      date: event.publishDate.toISOString().split('T')[0],
      time: event.publishDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }))
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return [
      { title: 'No upcoming events', date: new Date().toISOString().split('T')[0], time: 'TBD' }
    ]
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return `${diffInDays} days ago`
  }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch dynamic data
  const stats = await getAdminStats()
  const recentActivities = await getRecentActivities()
  const upcomingEvents = await getUpcomingEvents()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'active': return <Bell className="h-4 w-4 text-blue-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {session.user?.name}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening at your school today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/admissions/new">
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/announcements">
              <Bell className="h-4 w-4 mr-2" />
              Announcements
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Enrolled this year
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Total Teachers
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.totalTeachers}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              Active faculty members
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Active Classes
            </CardTitle>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalClasses}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Across all grades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Attendance Rate
            </CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.avgAttendance}%
            </div>
            <Progress value={stats.avgAttendance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Activities
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/reports">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {activity.time}
                      </p>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : activity.status === 'pending' ? 'secondary' : 'outline'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activities to display</p>
                <p className="text-sm">Check back later for updates</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Events */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/students/add">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Student
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/teachers/add">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Add New Teacher
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/announcements">
                  <Bell className="h-4 w-4 mr-2" />
                  Create Announcement
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/finance/fees">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Fee Management
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {event.date} • {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/events">
                  View All Events
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pending Admissions
              <Badge variant="secondary">{stats.pendingAdmissions}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/admin/admissions">
                Review Applications
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Monthly Revenue
              <TrendingUp className="h-5 w-5 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              This month&apos;s collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Announcements
              <Badge variant="outline">{stats.activeAnnouncements}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/announcements">
                Manage Announcements
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
