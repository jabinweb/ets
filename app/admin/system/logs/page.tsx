"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fadeInUp } from '@/lib/motion'
import { 
  FileText, 
  Search,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface Log {
  id: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  timestamp: string
  source: string
  user: string
}

interface LogStats {
  total: number
  error: number
  warning: number
  info: number
  success: number
}

export default function SystemLogsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams()
        if (filterLevel !== 'all') params.append('level', filterLevel)
        if (searchQuery) params.append('search', searchQuery)
        params.append('limit', '100')

        const response = await fetch(`/api/admin/system/logs?${params}`)
        const data = await response.json()
        
        if (data.logs && data.stats) {
          setLogs(data.logs)
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch logs:', error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    fetchLogs()
  }, [filterLevel, searchQuery])

  const handleRefresh = async () => {
    setRefreshing(true)
    const params = new URLSearchParams()
    if (filterLevel !== 'all') params.append('level', filterLevel)
    if (searchQuery) params.append('search', searchQuery)
    params.append('limit', '100')

    try {
      const response = await fetch(`/api/admin/system/logs?${params}`)
      const data = await response.json()
      
      if (data.logs && data.stats) {
        setLogs(data.logs)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterLevel !== 'all') params.append('level', filterLevel)
    if (searchQuery) params.append('search', searchQuery)
    params.append('limit', '100')

    fetch(`/api/admin/system/logs?${params}`)
      .then(res => res.json())
      .then(data => {
        if (data.logs && data.stats) {
          setLogs(data.logs)
          setStats(data.stats)
        }
      })
      .catch(error => console.error('Failed to fetch logs:', error))
      .finally(() => setLoading(false))
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const statsData = [
    { label: "Total Logs", value: stats?.total.toString() || "0", icon: FileText, color: "text-blue-600" },
    { label: "Errors", value: stats?.error.toString() || "0", icon: XCircle, color: "text-red-600" },
    { label: "Warnings", value: stats?.warning.toString() || "0", icon: AlertTriangle, color: "text-orange-600" },
    { label: "Info", value: (stats ? stats.info + stats.success : 0).toString(), icon: Info, color: "text-green-600" }
  ]

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    )
  }

  const getLevelBadge = (level: string) => {
    const config = {
      error: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: XCircle },
      warning: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400", icon: AlertTriangle },
      info: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Info },
      success: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle }
    }
    const { color, icon: Icon } = config[level as keyof typeof config]
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {level}
      </Badge>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              System Logs
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Monitor system activity and troubleshoot issues
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={fadeInUp} 
        initial="initial" 
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Logs Table */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Real-time system activity and error tracking</CardDescription>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="error">Errors Only</SelectItem>
                    <SelectItem value="warning">Warnings</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent" className="w-full">
              <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
                <TabsTrigger value="warnings">Warnings</TabsTrigger>
                <TabsTrigger value="all">All Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="recent" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {getLevelBadge(log.level)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {log.message}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {log.source}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {log.user}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="errors" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.filter(log => log.level === 'error').map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {getLevelBadge(log.level)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {log.message}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {log.source}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {log.user}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="warnings" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.filter(log => log.level === 'warning').map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {getLevelBadge(log.level)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {log.message}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {log.source}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {log.user}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="all" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {getLevelBadge(log.level)}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {log.message}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {log.source}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {log.user}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Important Notice */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-blue-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  About System Logs
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Logs are retained for 90 days by default</li>
                  <li>• Critical errors trigger automatic email notifications</li>
                  <li>• Use filters and search to quickly find specific events</li>
                  <li>• Export logs for detailed analysis or compliance purposes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
