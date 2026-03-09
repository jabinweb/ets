"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { fadeInUp } from '@/lib/motion'
import { 
  Database, 
  Download,
  Upload,
  CheckCircle,
  Clock,
  HardDrive,
  AlertCircle,
  RotateCcw
} from 'lucide-react'

export default function BackupPage() {
  const backups = [
    {
      id: 1,
      name: "Full System Backup",
      type: "Automatic",
      size: "2.4 GB",
      date: "2024-11-04 02:00 AM",
      status: "completed"
    },
    {
      id: 2,
      name: "Daily Backup",
      type: "Automatic",
      size: "1.8 GB",
      date: "2024-11-03 02:00 AM",
      status: "completed"
    },
    {
      id: 3,
      name: "Pre-Update Backup",
      type: "Manual",
      size: "2.1 GB",
      date: "2024-11-02 10:30 AM",
      status: "completed"
    },
    {
      id: 4,
      name: "Weekly Backup",
      type: "Automatic",
      size: "2.0 GB",
      date: "2024-10-28 02:00 AM",
      status: "completed"
    }
  ]

  const stats = [
    { label: "Total Backups", value: "12", icon: Database },
    { label: "Storage Used", value: "24.5 GB", icon: HardDrive },
    { label: "Last Backup", value: "2 hours ago", icon: Clock },
    { label: "Success Rate", value: "100%", icon: CheckCircle }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Backup & Restore
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage system backups and data recovery
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Restore
            </Button>
            <Button>
              <Database className="h-4 w-4 mr-2" />
              Create Backup
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
        {stats.map((stat, index) => (
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
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Backup Configuration */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card>
          <CardHeader>
            <CardTitle>Backup Configuration</CardTitle>
            <CardDescription>Configure automatic backup settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Backup Frequency</label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Backup Time</label>
                <Select defaultValue="02:00">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00:00">12:00 AM</SelectItem>
                    <SelectItem value="02:00">02:00 AM</SelectItem>
                    <SelectItem value="04:00">04:00 AM</SelectItem>
                    <SelectItem value="06:00">06:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Retention Period</label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Storage Capacity</label>
                <span className="text-sm text-slate-600 dark:text-slate-400">24.5 GB / 100 GB</span>
              </div>
              <Progress value={24.5} className="h-2" />
            </div>

            <Button>Save Configuration</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Backup History */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card>
          <CardHeader>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>Recent backup records and restore points</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backup Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">
                      {backup.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {backup.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {backup.size}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {backup.date}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Important Notice */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Important Backup Information
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Automatic backups are scheduled daily at 2:00 AM</li>
                  <li>• Backups are stored securely and encrypted</li>
                  <li>• Older backups are automatically deleted after 30 days</li>
                  <li>• Always test your backups periodically to ensure data integrity</li>
                  <li>• Contact support for off-site backup solutions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
