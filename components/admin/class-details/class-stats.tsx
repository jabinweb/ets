"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ClassStatsProps {
  stats: {
    totalStudents: number
    averageAttendance: number
    totalSubjects: number
    scheduleHours: number
  }
  capacity: number
}

export function ClassStats({ stats, capacity }: ClassStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            of {capacity} capacity
          </p>
          <Progress value={(stats.totalStudents / capacity) * 100} className="mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Average Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.averageAttendance}%</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Last 30 days
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Subjects Assigned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.totalSubjects}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Active curriculum
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Weekly Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.scheduleHours}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Scheduled classes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
