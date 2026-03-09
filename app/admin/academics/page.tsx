import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  Award,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminAcademicsPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const academicModules = [
    {
      title: "Curriculum Management",
      description: "Design and manage academic curriculum across all grades",
      icon: BookOpen,
      href: "/admin/academics/curriculum",
      color: "blue",
      features: ["Course Planning", "Subject Mapping", "Learning Objectives"]
    },
    {
      title: "Examination System",
      description: "Create, schedule, and manage examinations and assessments",
      icon: FileText,
      href: "/admin/academics/exams",
      color: "green",
      features: ["Exam Scheduling", "Question Banks", "Result Processing"]
    },
    {
      title: "Academic Results",
      description: "Track student performance and generate academic reports",
      icon: BarChart3,
      href: "/admin/academics/results",
      color: "purple",
      features: ["Grade Reports", "Performance Analytics", "Progress Tracking"]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Academic Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage curriculum, examinations, and academic performance
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/academics/curriculum">
            <Plus className="h-4 w-4 mr-2" />
            Quick Actions
          </Link>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-slate-500">Across all grades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Upcoming Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-xs text-slate-500">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">B+</div>
            <p className="text-xs text-slate-500">School average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">96%</div>
            <p className="text-xs text-slate-500">Last semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Academic Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {academicModules.map((module, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <Link href={module.href}>
              <CardHeader>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${module.color}-100 text-${module.color}-600 mb-4`}>
                  <module.icon className="h-6 w-6" />
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {module.title}
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {module.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {module.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1 h-1 bg-slate-400 rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium">Explore Module</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Academic Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">Midterm Examinations</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">March 15-22, 2024</div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Upcoming</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">Curriculum Review</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">March 30, 2024</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/calendar">View Academic Calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-medium text-green-800 dark:text-green-200">
                  Mathematics Olympiad Winners
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  5 students qualified for state level
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-medium text-blue-800 dark:text-blue-200">
                  Science Fair Excellence
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  Top 3 projects selected for district
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/admin/achievements">View All Achievements</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
