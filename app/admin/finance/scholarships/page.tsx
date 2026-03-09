"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency, CurrencySettings, DEFAULT_CURRENCY } from '@/lib/currency'
import { 
  Award,
  Search,
  Download,
  Plus,
  Edit,
  RefreshCw,
  DollarSign,
  Users,
  Calendar,
  X,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  GraduationCap,
  FileText
} from 'lucide-react'

interface Scholarship {
  id: string
  name: string
  description: string | null
  type: string
  amount: number
  criteria: string | null
  maxRecipients: number | null
  currentRecipients: number
  academicYear: number
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  applicationDeadline: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    applications: number
  }
}

interface ScholarshipApplication {
  id: string
  scholarshipId: string
  studentId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  applicationDate: string
  reviewedDate: string | null
  notes: string | null
  student: {
    name: string
    email: string
    studentNumber: string
    class?: {
      name: string
      grade: number
    }
  }
  scholarship: {
    name: string
    amount: number
  }
}

interface ScholarshipFormData {
  name: string
  description: string
  type: string
  amount: string
  criteria: string
  maxRecipients: string
  academicYear: string
  applicationDeadline: string
}

const SCHOLARSHIP_TYPES = [
  'MERIT_BASED',
  'NEED_BASED',
  'SPORTS',
  'ACADEMIC_EXCELLENCE',
  'COMMUNITY_SERVICE',
  'SPECIAL_TALENT',
  'MINORITY',
  'OTHER'
] as const

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [applications, setApplications] = useState<ScholarshipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'scholarships' | 'applications'>('scholarships')
  const [showForm, setShowForm] = useState(false)
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY)
  const [formData, setFormData] = useState<ScholarshipFormData>({
    name: '',
    description: '',
    type: '',
    amount: '',
    criteria: '',
    maxRecipients: '',
    academicYear: new Date().getFullYear().toString(),
    applicationDeadline: ''
  })
  const { toast } = useToast()

  // Fetch currency settings
  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch('/api/admin/settings/currency')
        const result = await response.json()
        if (result.success && result.data) {
          setCurrencySettings(result.data)
        }
      } catch (error) {
        console.error('Error fetching currency settings:', error)
      }
    }
    fetchCurrency()
  }, [])

  const fetchScholarships = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/scholarships')
      const result = await response.json()
      
      if (result.success) {
        setScholarships(result.data || [])
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load scholarships",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error)
      toast({
        title: "Error",
        description: "Failed to load scholarships",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchApplications = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scholarship-applications')
      const result = await response.json()
      
      if (result.success) {
        setApplications(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    }
  }, [])

  useEffect(() => {
    fetchScholarships()
    fetchApplications()
  }, [fetchScholarships, fetchApplications])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.type || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const endpoint = editingScholarship 
        ? `/api/admin/scholarships/${editingScholarship.id}`
        : '/api/admin/scholarships'
      
      const method = editingScholarship ? 'PATCH' : 'POST'
      
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        academicYear: parseInt(formData.academicYear),
        maxRecipients: formData.maxRecipients ? parseInt(formData.maxRecipients) : null,
        applicationDeadline: formData.applicationDeadline || null
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: editingScholarship 
            ? "Scholarship updated successfully" 
            : "Scholarship created successfully"
        })
        
        setShowForm(false)
        setEditingScholarship(null)
        setFormData({
          name: '',
          description: '',
          type: '',
          amount: '',
          criteria: '',
          maxRecipients: '',
          academicYear: new Date().getFullYear().toString(),
          applicationDeadline: ''
        })
        fetchScholarships()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save scholarship",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving scholarship:', error)
      toast({
        title: "Error",
        description: "Failed to save scholarship",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (scholarship: Scholarship) => {
    setEditingScholarship(scholarship)
    setFormData({
      name: scholarship.name,
      description: scholarship.description || '',
      type: scholarship.type,
      amount: scholarship.amount.toString(),
      criteria: scholarship.criteria || '',
      maxRecipients: scholarship.maxRecipients?.toString() || '',
      academicYear: scholarship.academicYear.toString(),
      applicationDeadline: scholarship.applicationDeadline?.split('T')[0] || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scholarship? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/scholarships/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Scholarship deleted successfully"
        })
        fetchScholarships()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete scholarship",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting scholarship:', error)
      toast({
        title: "Error",
        description: "Failed to delete scholarship",
        variant: "destructive"
      })
    }
  }

  const handleApplicationReview = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/scholarship-applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Application ${status.toLowerCase()} successfully`
        })
        fetchApplications()
        fetchScholarships()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update application",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive"
      })
    }
  }

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scholarship.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || scholarship.type === typeFilter
    const matchesStatus = !statusFilter || scholarship.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.scholarship.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalScholarships: scholarships.length,
    activeScholarships: scholarships.filter(s => s.status === 'ACTIVE').length,
    totalAmount: scholarships.reduce((sum, s) => sum + s.amount * (s.currentRecipients || 0), 0),
    pendingApplications: applications.filter(a => a.status === 'PENDING').length
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Scholarship Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage scholarships and review applications
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => {
            fetchScholarships()
            fetchApplications()
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {activeTab === 'scholarships' && (
            <Button size="sm" onClick={() => {
              setEditingScholarship(null)
              setFormData({
                name: '',
                description: '',
                type: '',
                amount: '',
                criteria: '',
                maxRecipients: '',
                academicYear: new Date().getFullYear().toString(),
                applicationDeadline: ''
              })
              setShowForm(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Scholarship
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Scholarships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScholarships}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Scholarships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeScholarships}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Disbursed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAmount, currencySettings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('scholarships')}
          className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'scholarships'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Scholarships
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-2 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'applications'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          Applications
          {stats.pendingApplications > 0 && (
            <Badge className="ml-2" variant="destructive">
              {stats.pendingApplications}
            </Badge>
          )}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && activeTab === 'scholarships' && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingScholarship ? 'Edit Scholarship' : 'Add New Scholarship'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingScholarship(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Scholarship Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Merit Scholarship 2024"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    required
                  >
                    <option value="">Select type</option>
                    {SCHOLARSHIP_TYPES.map(type => (
                      <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxRecipients">Max Recipients</Label>
                  <Input
                    id="maxRecipients"
                    type="number"
                    value={formData.maxRecipients}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxRecipients: e.target.value }))}
                    placeholder="Unlimited if empty"
                  />
                </div>

                <div>
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Input
                    id="academicYear"
                    type="number"
                    value={formData.academicYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the scholarship..."
                    rows={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="criteria">Eligibility Criteria</Label>
                  <Textarea
                    id="criteria"
                    value={formData.criteria}
                    onChange={(e) => setFormData(prev => ({ ...prev, criteria: e.target.value }))}
                    placeholder="List the eligibility requirements..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingScholarship(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Scholarship'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={activeTab === 'scholarships' ? "Search scholarships..." : "Search applications..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'scholarships' && (
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                >
                  <option value="">All Types</option>
                  {SCHOLARSHIP_TYPES.map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="">All Status</option>
                {activeTab === 'scholarships' ? (
                  <>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="CLOSED">CLOSED</option>
                  </>
                ) : (
                  <>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'scholarships' ? (
        <Card>
          <CardHeader>
            <CardTitle>Scholarships ({filteredScholarships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500">Loading scholarships...</p>
              </div>
            ) : filteredScholarships.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No scholarships found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredScholarships.map(scholarship => (
                  <motion.div
                    key={scholarship.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {scholarship.name}
                        </span>
                        <Badge variant={scholarship.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {scholarship.status}
                        </Badge>
                        <Badge variant="outline">{scholarship.type.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(scholarship.amount, currencySettings)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {scholarship.currentRecipients} / {scholarship.maxRecipients || '∞'} recipients
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          AY {scholarship.academicYear}
                        </div>
                        {scholarship.applicationDeadline && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Deadline: {new Date(scholarship.applicationDeadline).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(scholarship)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(scholarship.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-500">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No applications found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map(application => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>{application.student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {application.student.name}
                          </span>
                          <Badge variant={
                            application.status === 'APPROVED' ? 'default' :
                            application.status === 'REJECTED' ? 'destructive' : 'secondary'
                          }>
                            {application.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span>{application.scholarship.name}</span>
                          <span>{formatCurrency(application.scholarship.amount, currencySettings)}</span>
                          {application.student.class && (
                            <span>{application.student.class.name} - Grade {application.student.class.grade}</span>
                          )}
                          <span>Applied: {new Date(application.applicationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    {application.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleApplicationReview(application.id, 'APPROVED')}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleApplicationReview(application.id, 'REJECTED')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
