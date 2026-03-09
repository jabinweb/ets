"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fadeInUp } from '@/lib/motion'
import { 
  Upload, 
  Download,
  FileSpreadsheet,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  Database,
  Book,
  Clipboard,
  DollarSign,
  Megaphone,
  RefreshCw
} from 'lucide-react'

interface ImportOption {
  id: string
  title: string
  description: string
  icon: string
  format: string
  fields: string[]
  sampleUrl: string
}

interface ExportOption {
  id: string
  title: string
  description: string
  icon: string
  records: number
  endpoint: string
}

interface Activity {
  id: string
  type: 'import' | 'export'
  entity: string
  recordCount: number
  status: string
  timestamp: string
  user: string
}

interface Stats {
  totalRecords: number
  lastImport: string | null
  lastExport: string | null
  pendingImports: number
}

export default function DataImportExportPage() {
  const [importOptions, setImportOptions] = useState<ImportOption[]>([])
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([])
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/system/data')
      const data = await response.json()
      
      if (data.importOptions && data.exportOptions) {
        setImportOptions(data.importOptions)
        setExportOptions(data.exportOptions)
        setRecentActivities(data.recentActivities || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{className?: string}>> = {
      'users': Users,
      'graduation-cap': GraduationCap,
      'book-open': BookOpen,
      'book': Book,
      'file-text': FileText,
      'clipboard': Clipboard,
      'calendar': Calendar,
      'dollar-sign': DollarSign,
      'megaphone': Megaphone,
      'database': Database
    }
    return icons[iconName] || FileText
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Data Import & Export
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Import or export data in bulk using CSV or Excel files
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div 
          variants={fadeInUp} 
          initial="initial" 
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Records</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.totalRecords.toLocaleString()}
                  </p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last Import</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                    {stats.lastImport ? formatTimestamp(stats.lastImport) : 'Never'}
                  </p>
                </div>
                <Upload className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last Export</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                    {stats.lastExport ? formatTimestamp(stats.lastExport) : 'Never'}
                  </p>
                </div>
                <Download className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stats.pendingImports}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="import">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
                <CardDescription>
                  Upload CSV or Excel files to import data into the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {importOptions.map((option) => {
                    const Icon = getIcon(option.icon)
                    return (
                      <Card key={option.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{option.title}</CardTitle>
                              <CardDescription className="text-xs">
                                {option.format}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {option.description}
                          </p>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            <strong>Fields:</strong> {option.fields.join(', ')}
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload File
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <a href={option.sampleUrl} download>
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                          <a 
                            href={option.sampleUrl}
                            download
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <FileSpreadsheet className="h-3 w-3" />
                            Download sample template
                          </a>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Import Guidelines */}
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Import Guidelines
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Ensure your file follows the template format exactly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Required fields must not be empty</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Dates should be in YYYY-MM-DD format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Email addresses must be unique and valid</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Maximum file size: 10 MB</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>The system will validate data before import</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>
                  Download data from the system in CSV or Excel format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exportOptions.map((option) => {
                    const Icon = getIcon(option.icon)
                    return (
                      <Card key={option.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                              {option.records.toLocaleString()} records
                            </span>
                          </div>
                          <CardTitle className="text-lg mt-3">{option.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {option.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Button className="w-full" variant="outline" asChild>
                            <a href={option.endpoint + '?format=csv'} download>
                              <Download className="h-4 w-4 mr-2" />
                              Export as CSV
                            </a>
                          </Button>
                          <Button className="w-full" variant="outline" asChild>
                            <a href={option.endpoint + '?format=xlsx'} download>
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              Export as Excel
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Export Guidelines */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Export Information
                    </h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>Exported data includes all visible records based on your permissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>Sensitive data is automatically masked in exports</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>Large exports may take a few minutes to generate</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>Export activity is logged for security purposes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>Downloaded files should be stored securely</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            {recentActivities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Recent import and export operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div 
                        key={activity.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          {activity.type === 'import' ? (
                            <Upload className="h-5 w-5 text-green-600" />
                          ) : (
                            <Download className="h-5 w-5 text-blue-600" />
                          )}
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {activity.type === 'import' ? 'Imported' : 'Exported'} {activity.entity}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {activity.recordCount.toLocaleString()} records • {formatTimestamp(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
