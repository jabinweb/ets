"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Download,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  PieChart,
  Activity
} from 'lucide-react'

interface AdmissionStats {
  total: number
  pending: number
  underReview: number
  accepted: number
  rejected: number
  waitlisted: number
  thisMonth: number
  lastMonth: number
  growthRate: number
}

interface GradeDistribution {
  grade: string
  applications: number
  accepted: number
  acceptanceRate: number
}

interface MonthlyData {
  month: string
  applications: number
  accepted: number
  rejected: number
}

interface RecentActivity {
  id: string
  type: 'application' | 'review' | 'decision'
  message: string
  time: string
  status: 'info' | 'success' | 'warning' | 'error'
}

export default function AdmissionsReportsPage() {
  const [stats, setStats] = useState<AdmissionStats>({
    total: 0,
    pending: 0,
    underReview: 0,
    accepted: 0,
    rejected: 0,
    waitlisted: 0,
    thisMonth: 0,
    lastMonth: 0,
    growthRate: 0
  })
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('thisYear')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const { toast } = useToast()

  const fetchReportsData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/admissions/reports?period=${selectedPeriod}&grade=${selectedGrade}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setStats(result.data.stats)
        setGradeDistribution(result.data.gradeDistribution)
        setMonthlyData(result.data.monthlyData)
        setRecentActivity(result.data.recentActivity)
      } else {
        throw new Error(result.error || 'Failed to load reports data')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error("Failed to load reports data", {
        description: "Please try again later"
      })
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, selectedGrade, toast])

  useEffect(() => {
    fetchReportsData()
  }, [fetchReportsData])

  const handleExportReport = (type: string) => {
    toast.success("Report exported!", {
      description: `${type} report has been downloaded successfully`
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admissions Reports
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Analytics and insights for admission applications
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => fetchReportsData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={() => handleExportReport('Summary')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
                <option value="lastYear">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Grade Level</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="all">All Grades</option>
                <option value="pre-k">Pre-K</option>
                <option value="kindergarten">Kindergarten</option>
                {Array.from({length: 12}, (_, i) => (
                  <option key={i + 1} value={`grade-${i + 1}`}>
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {loading ? '...' : stats.total.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                +{stats.growthRate}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {loading ? '...' : stats.accepted}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">
              {loading ? '...' : ((stats.accepted / stats.total) * 100).toFixed(1)}% acceptance rate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {loading ? '...' : stats.pending + stats.underReview}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {stats.pending} pending, {stats.underReview} in review
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {loading ? '...' : stats.thisMonth}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              vs {stats.lastMonth} last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Application Trend
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('Monthly Trend')}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-64 flex items-end justify-between gap-2">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col gap-1 items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t-xl"
                        style={{ height: `${(data.accepted / 60) * 100}%`, minHeight: '4px' }}
                        title={`Accepted: ${data.accepted}`}
                      />
                      <div 
                        className="w-full bg-blue-500"
                        style={{ height: `${((data.applications - data.accepted - data.rejected) / 60) * 100}%`, minHeight: data.applications - data.accepted - data.rejected > 0 ? '4px' : '0px' }}
                        title={`Pending: ${data.applications - data.accepted - data.rejected}`}
                      />
                      <div 
                        className="w-full bg-red-500 rounded-b-xl"
                        style={{ height: `${(data.rejected / 60) * 100}%`, minHeight: data.rejected > 0 ? '4px' : '0px' }}
                        title={`Rejected: ${data.rejected}`}
                      />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm">Accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm">Rejected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Grade-wise Distribution
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('Grade Distribution')}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {gradeDistribution.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {grade.grade}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {grade.applications} applications
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-green-600">
                        {grade.acceptanceRate.toFixed(1)}%
                      </div>
                      <Badge variant="outline">
                        {grade.accepted}/{grade.applications}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { status: 'Pending', count: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-100' },
                { status: 'Under Review', count: stats.underReview, color: 'text-blue-600', bg: 'bg-blue-100' },
                { status: 'Accepted', count: stats.accepted, color: 'text-green-600', bg: 'bg-green-100' },
                { status: 'Rejected', count: stats.rejected, color: 'text-red-600', bg: 'bg-red-100' },
                { status: 'Waitlisted', count: stats.waitlisted, color: 'text-orange-600', bg: 'bg-orange-100' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.bg}`}></div>
                    <span className="font-medium">{item.status}</span>
                  </div>
                  <div className={`font-bold ${item.color}`}>
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.time}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => handleExportReport('Detailed')}>
              <Download className="h-4 w-4 mr-2" />
              Detailed Report (PDF)
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('Summary')}>
              <Download className="h-4 w-4 mr-2" />
              Summary Report (Excel)
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('Analytics')}>
              <Download className="h-4 w-4 mr-2" />
              Analytics Data (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
