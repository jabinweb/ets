import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  BookOpen,
  UserCheck,
  Award,
  Calendar,
  CreditCard
} from 'lucide-react'

type StatsTeacher = {
  myClasses: number
  totalStudents: number
  todayAttendance: number
  pendingGrades: number
  upcomingLessons: number
  assignmentsDue: number
}

type StatsStudent = {
  myGrades: string
  attendanceRate: number
  assignmentsDue: number
  upcomingExams: number
  extracurriculars: number
  creditsCompleted: number
}

type StatsParent = {
  children: number
  attendanceRate: number
  averageGrade: string
  upcomingEvents: number
  pendingPayments: number
  teacherMeetings: number
}

type Props = {
  userRole: string
  stats: StatsTeacher | StatsStudent | StatsParent
}

export function DashboardStats({ userRole, stats }: Props) {
  switch (userRole) {
    case "TEACHER":
      return (
        <>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                My Classes
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {(stats as StatsTeacher).myClasses}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Active this semester
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {(stats as StatsTeacher).totalStudents}
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Across all classes
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Today&apos;s Attendance
              </CardTitle>
              <UserCheck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {(stats as StatsTeacher).todayAttendance}%
              </div>
              <Progress value={(stats as StatsTeacher).todayAttendance} className="mt-2" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Pending Grades
              </CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {(stats as StatsTeacher).pendingGrades}
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Assignments to grade
              </p>
            </CardContent>
          </Card>
        </>
      )
    case "STUDENT":
      return (
        <>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Current GPA
              </CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {(stats as StatsStudent).myGrades}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This semester
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                Attendance Rate
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {(stats as StatsStudent).attendanceRate}%
              </div>
              <Progress value={(stats as StatsStudent).attendanceRate} className="mt-2" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                Assignments Due
              </CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {(stats as StatsStudent).assignmentsDue}
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                This week
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Upcoming Exams
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {(stats as StatsStudent).upcomingExams}
              </div>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Next 2 weeks
              </p>
            </CardContent>
          </Card>
        </>
      )
    default:
      return null
  }
}

