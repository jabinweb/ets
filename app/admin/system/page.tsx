"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { 
  Users, 
  Shield, 
  Database, 
  FileText, 
  Download,
  Upload,
  Activity,
  Server,
  HardDrive,
  Cpu,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface SystemStats {
  cpu: { usage: number; cores: number }
  memory: { used: number; total: number; unit: string }
  storage: { used: number; total: number; unit: string }
  uptime: { days: number; hours: number }
  status: string
}

interface SystemOverview {
  counts: {
    users: number
    classes: number
    subjects: number
    students: number
    teachers: number
    attendanceRecords: number
    exams: number
    fees: number
    announcements: number
    applications: number
    expenses: number
  }
  activity: {
    newUsersThisWeek: number
    newApplicationsThisWeek: number
    activeSessions: number
  }
  modules: Array<{
    id: string
    title: string
    description: string
    count: number
    icon: string
  }>
}

export default function SystemManagementPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, overviewRes] = await Promise.all([
          fetch('/api/admin/system/stats'),
          fetch('/api/admin/system/overview')
        ])
        
        const statsData = await statsRes.json()
        const overviewData = await overviewRes.json()
        
        setStats(statsData)
        setOverview(overviewData)
      } catch (error) {
        console.error('Failed to fetch system data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    )
  }

  const systemModules = overview?.modules.map(module => ({
    title: module.title,
    description: module.description,
    icon: module.icon === 'users' ? Users : 
          module.icon === 'shield' ? Shield :
          module.icon === 'database' ? Database :
          module.icon === 'fileText' ? FileText : Download,
    href: `/admin/system/${module.id}`,
    stats: { 
      total: `${module.count} ${module.id === 'permissions' ? 'roles' : module.id === 'data' ? 'types' : 'total'}`, 
      active: module.id === 'users' ? `${overview.activity.activeSessions} active` :
              module.id === 'permissions' ? `${overview.counts.users} users` :
              module.id === 'logs' ? '0 errors' :
              module.id === 'backup' ? 'Configure' : 'Available'
    },
    color: module.icon === 'users' ? 'blue' :
           module.icon === 'shield' ? 'purple' :
           module.icon === 'database' ? 'green' :
           module.icon === 'fileText' ? 'orange' : 'cyan'
  })) || []

  const systemStats = [
    { label: "CPU Usage", value: `${stats?.cpu.usage || 0}%`, icon: Cpu, color: "text-blue-600" },
    { label: "Memory", value: `${stats?.memory.used || 0} ${stats?.memory.unit || 'GB'} / ${stats?.memory.total || 0} ${stats?.memory.unit || 'GB'}`, icon: HardDrive, color: "text-green-600" },
    { label: "Storage", value: `${stats?.storage.used || 0} ${stats?.storage.unit || 'GB'} / ${stats?.storage.total || 0} ${stats?.storage.unit || 'GB'}`, icon: Server, color: "text-orange-600" },
    { label: "Uptime", value: `${stats?.uptime.days || 0} days`, icon: Activity, color: "text-purple-600" }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              System Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage users, permissions, backups, and system configurations
            </p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Activity className="h-3 w-3 mr-1" />
            System Healthy
          </Badge>
        </div>
      </motion.div>

      {/* System Stats */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {systemStats.map((stat, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card>
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
          </motion.div>
        ))}
      </motion.div>

      {/* System Modules */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {systemModules.map((module, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-${module.color}-100 dark:bg-${module.color}-900/20`}>
                    <module.icon className={`h-6 w-6 text-${module.color}-600`} />
                  </div>
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{module.stats.total}</span>
                    <span className="text-slate-900 dark:text-white font-medium">{module.stats.active}</span>
                  </div>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={module.href} className="flex items-center justify-center">
                      Manage
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common system management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="flex flex-col h-auto py-4">
                <Database className="h-6 w-6 mb-2" />
                <span className="text-sm">Create Backup</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4">
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-sm">Import Data</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4">
                <Download className="h-6 w-6 mb-2" />
                <span className="text-sm">Export Data</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-auto py-4">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">View Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
