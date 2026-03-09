import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3,
  Users,
  DollarSign,
  FileText,
  Download,
  Filter,
  PieChart,
  LineChart
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminReportsPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const reportCategories = [
    {
      title: "Academic Reports",
      description: "Student performance, grades, and academic progress",
      icon: BarChart3,
      color: "blue",
      reports: [
        { name: "Student Performance Report", type: "Academic", lastGenerated: "2 hours ago" },
        { name: "Grade Distribution Analysis", type: "Academic", lastGenerated: "1 day ago" },
        { name: "Subject-wise Performance", type: "Academic", lastGenerated: "3 days ago" }
      ]
    },
    {
      title: "Financial Reports",
      description: "Fee collection, expenses, and financial analysis",
      icon: DollarSign,
      color: "green",
      reports: [
        { name: "Monthly Fee Collection", type: "Financial", lastGenerated: "1 hour ago" },
        { name: "Outstanding Payments", type: "Financial", lastGenerated: "6 hours ago" },
        { name: "Revenue Analysis", type: "Financial", lastGenerated: "2 days ago" }
      ]
    },
    {
      title: "Attendance Reports",
      description: "Student and staff attendance tracking and analysis",
      icon: Users,
      color: "purple",
      reports: [
        { name: "Daily Attendance Summary", type: "Attendance", lastGenerated: "30 min ago" },
        { name: "Monthly Attendance Report", type: "Attendance", lastGenerated: "5 hours ago" },
        { name: "Attendance Trends", type: "Attendance", lastGenerated: "1 day ago" }
      ]
    },
    {
      title: "Admission Reports",
      description: "Application tracking and admission analytics",
      icon: FileText,
      color: "orange",
      reports: [
        { name: "Application Status Report", type: "Admission", lastGenerated: "3 hours ago" },
        { name: "Admission Trends", type: "Admission", lastGenerated: "1 day ago" },
        { name: "Source Analysis", type: "Admission", lastGenerated: "4 days ago" }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Generate and analyze school performance reports
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Reports Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-slate-500">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Most Requested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Academic</div>
            <p className="text-xs text-slate-500">Performance reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">892</div>
            <p className="text-xs text-slate-500">Total downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Scheduled Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">12</div>
            <p className="text-xs text-slate-500">Auto-generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${category.color}-100 text-${category.color}-600`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{category.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.reports.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Last generated: {report.lastGenerated}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {report.type}
                      </Badge>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-3">
                  View All {category.title}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/reports/academic" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Academic Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Comprehensive academic performance analytics
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports/financial" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-green-600" />
                Financial Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Revenue trends and financial insights
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports/custom" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Custom Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Build your own custom reports
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
