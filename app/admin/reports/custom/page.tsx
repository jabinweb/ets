"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FileText,
  Download,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Trash2,
  Edit
} from 'lucide-react'

interface SavedReport {
  id: string
  name: string
  description: string
  type: string
  category: string
  lastGenerated: string
  frequency: string
  format: string
}

export default function CustomReportsPage() {
  const [reportName, setReportName] = useState('')
  const [reportType, setReportType] = useState('')
  const [reportCategory, setReportCategory] = useState('')
  const [dateRange, setDateRange] = useState('this-month')
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const savedReports: SavedReport[] = [
    {
      id: '1',
      name: 'Monthly Academic Performance',
      description: 'Comprehensive report of student performance across all subjects',
      type: 'Academic',
      category: 'Performance',
      lastGenerated: '2 hours ago',
      frequency: 'Monthly',
      format: 'PDF'
    },
    {
      id: '2',
      name: 'Fee Collection Summary',
      description: 'Summary of fee collections and outstanding payments',
      type: 'Financial',
      category: 'Revenue',
      lastGenerated: '1 day ago',
      frequency: 'Weekly',
      format: 'Excel'
    },
    {
      id: '3',
      name: 'Staff Attendance Analysis',
      description: 'Department-wise staff attendance and leave analysis',
      type: 'HR',
      category: 'Attendance',
      lastGenerated: '3 days ago',
      frequency: 'Monthly',
      format: 'PDF'
    },
    {
      id: '4',
      name: 'Student Enrollment Trends',
      description: 'Enrollment trends by grade and academic year',
      type: 'Admissions',
      category: 'Statistics',
      lastGenerated: '1 week ago',
      frequency: 'Quarterly',
      format: 'Excel'
    },
    {
      id: '5',
      name: 'Infrastructure Expenses',
      description: 'Detailed breakdown of infrastructure and maintenance costs',
      type: 'Financial',
      category: 'Expenses',
      lastGenerated: '2 weeks ago',
      frequency: 'Monthly',
      format: 'PDF'
    }
  ]

  const reportFields = [
    { id: 'student-info', label: 'Student Information', category: 'Academic' },
    { id: 'grades', label: 'Grades & Results', category: 'Academic' },
    { id: 'attendance', label: 'Attendance Records', category: 'Academic' },
    { id: 'fee-payments', label: 'Fee Payments', category: 'Financial' },
    { id: 'outstanding', label: 'Outstanding Balances', category: 'Financial' },
    { id: 'staff-info', label: 'Staff Information', category: 'HR' },
    { id: 'payroll', label: 'Payroll Data', category: 'HR' },
    { id: 'leave-records', label: 'Leave Records', category: 'HR' }
  ]

  const handleGenerateReport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Custom report generated successfully!')
    }, 2000)
  }

  const handleCreateReport = () => {
    if (!reportName || !reportType || !reportCategory) {
      alert('Please fill in all required fields')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowCreateForm(false)
      alert('Custom report template created successfully!')
      setReportName('')
      setReportType('')
      setReportCategory('')
    }, 1500)
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'academic':
      case 'performance':
      case 'statistics':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
      case 'financial':
      case 'revenue':
      case 'expenses':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
      case 'hr':
      case 'attendance':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
      case 'admissions':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Custom Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Create and manage custom reports with specific data fields
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Report
        </Button>
      </div>

      {/* Create Report Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Create Custom Report Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-name">Report Name *</Label>
                <Input
                  id="report-name"
                  placeholder="e.g., Monthly Performance Summary"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="report-type">Report Type *</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="admissions">Admissions</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-category">Category *</Label>
                <Select value={reportCategory} onValueChange={setReportCategory}>
                  <SelectTrigger id="report-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expenses">Expenses</SelectItem>
                    <SelectItem value="statistics">Statistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Generation Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this report will contain..."
                rows={3}
              />
            </div>

            <div>
              <Label>Select Data Fields</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {reportFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={field.id}
                      className="rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={field.id}
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={loading}>
                {loading ? 'Creating...' : 'Create Report Template'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Report Category</Label>
              <Select defaultValue="academic">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Output Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerateReport} disabled={loading} className="w-full gap-2">
                <Download className="h-4 w-4" />
                {loading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Saved Custom Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {report.name}
                    </h3>
                    <Badge className={getCategoryColor(report.category)}>
                      {report.category}
                    </Badge>
                    <Badge variant="outline">{report.type}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last generated: {report.lastGenerated}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Frequency: {report.frequency}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Format: {report.format}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="h-3 w-3" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pre-built Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Student Progress
                  </h3>
                  <p className="text-xs text-slate-500">Academic performance</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Comprehensive student performance analysis with grades, attendance, and trends
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Use Template
              </Button>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Financial Overview
                  </h3>
                  <p className="text-xs text-slate-500">Revenue & expenses</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Complete financial summary including collections, expenses, and balance sheets
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Use Template
              </Button>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Staff Analytics
                  </h3>
                  <p className="text-xs text-slate-500">HR & payroll</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Staff attendance, performance, payroll, and leave management overview
              </p>
              <Button size="sm" variant="outline" className="w-full">
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
