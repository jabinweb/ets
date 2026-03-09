"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  User,
  CalendarDays
} from 'lucide-react'

interface LeaveRequest {
  id: string
  leaveType: 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'EMERGENCY' | 'UNPAID'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  approvedBy?: string
  approvedAt?: string
  rejectedAt?: string
  comments?: string
  createdAt: string
}

interface LeaveBalance {
  leaveType: string
  totalAllowed: number
  used: number
  remaining: number
}

export default function TeacherLeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'create'>('list')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    leaveType: 'ANNUAL' as const,
    startDate: '',
    endDate: '',
    reason: ''
  })
  const { toast } = useToast()

  const fetchLeaveData = useCallback(async () => {
    try {
      const [requestsResponse, balanceResponse] = await Promise.all([
        fetch('/api/teacher/leave/requests'),
        fetch('/api/teacher/leave/balance')
      ])
      
      const requestsResult = await requestsResponse.json()
      const balanceResult = await balanceResponse.json()
      
      if (requestsResult.success) {
        setLeaveRequests(requestsResult.data || [])
      }
      
      if (balanceResult.success) {
        setLeaveBalance(balanceResult.data || [])
      }
    } catch (error) {
      console.error('Error fetching leave data:', error)
      toast.error("Failed to load leave data", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchLeaveData()
  }, [fetchLeaveData])

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all required fields")
      return
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Submitting leave request...")

    try {
      const response = await fetch('/api/teacher/leave/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalDays: calculateDays()
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Leave request submitted!", {
          description: "Your request has been sent for approval"
        })
        
        setFormData({
          leaveType: 'ANNUAL',
          startDate: '',
          endDate: '',
          reason: ''
        })
        setView('list')
        fetchLeaveData()
      } else {
        throw new Error(result.error || 'Failed to submit request')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request'
      toast.error("Submission failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const leaveTypeOptions = [
    { value: 'ANNUAL', label: 'Annual Leave' },
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'EMERGENCY', label: 'Emergency Leave' },
    { value: 'UNPAID', label: 'Unpaid Leave' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Leave Management
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Request and track your leave applications
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button variant="outline" onClick={() => setView('list')} size="sm" className="md:h-10">
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">View Requests</span>
            <span className="sm:hidden">View</span>
          </Button>
          <Button onClick={() => setView('create')} size="sm" className="md:h-10">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {leaveBalance.map((balance, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                {balance.leaveType} Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{balance.remaining}</div>
              <p className="text-xs text-muted-foreground">
                {balance.used} used of {balance.totalAllowed} days
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${balance.totalAllowed > 0 ? Math.min((balance.used / balance.totalAllowed) * 100, 100) : 0}%` 
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'create')}>
        <TabsList>
          <TabsTrigger value="list">Leave Requests</TabsTrigger>
          <TabsTrigger value="create">New Request</TabsTrigger>
        </TabsList>

        {/* Leave Requests List */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading leave requests...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leave requests found</p>
                  <Button onClick={() => setView('create')} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaveRequests.map(request => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-6"
                    >
                      <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                              {request.leaveType.replace('_', ' ')} Leave
                            </h3>
                            <Badge className={getStatusColor(request.status)} variant="outline">
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-3">
                            {request.reason}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500">
                            <div className="flex items-center gap-1 shrink-0">
                              <CalendarDays className="h-4 w-4 shrink-0" />
                              <span className="truncate">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Clock className="h-4 w-4 shrink-0" />
                              <span className="whitespace-nowrap">{request.totalDays} days</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <User className="h-4 w-4 shrink-0" />
                              <span className="whitespace-nowrap">Applied on {new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {request.comments && (
                        <div className="mt-3 sm:mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <div className="font-medium text-blue-900 dark:text-blue-200 text-sm sm:text-base">Comments</div>
                              <div className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">{request.comments}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Request Form */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>New Leave Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type *</Label>
                  <select
                    id="leaveType"
                    className="w-full p-2 border rounded-md"
                    value={formData.leaveType}
                    onChange={(e) => handleInputChange('leaveType', e.target.value)}
                  >
                    {leaveTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Total Days</Label>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-base sm:text-lg font-semibold">
                    {calculateDays()} days
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide the reason for your leave request"
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t">
                <Button variant="outline" onClick={() => setView('list')} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.startDate || !formData.endDate || !formData.reason}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
