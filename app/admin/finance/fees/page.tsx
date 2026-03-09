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
import { formatCurrency, CurrencySettings, DEFAULT_CURRENCY } from '@/lib/currency'
import { 
  CreditCard,
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
  BookOpen,
  GraduationCap
} from 'lucide-react'

interface Fee {
  id: string
  title: string
  description: string | null
  type: string
  amount: number
  dueDate: string
  academicYear: number
  semester: string | null
  grade: number | null
  classId: string | null
  isRecurring: boolean
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  class?: {
    name: string
    grade: number
    section: string
  }
  _count?: {
    payments: number
  }
}

interface FeeFormData {
  title: string
  description: string
  type: string
  amount: string
  dueDate: string
  academicYear: string
  semester: string
  grade: string
  classId: string
  isRecurring: boolean
}

interface Class {
  id: string
  name: string
  grade: number
  section: string
}

const FEE_TYPES = [
  'TUITION',
  'ADMISSION',
  'EXAM',
  'LIBRARY',
  'TRANSPORT',
  'SPORTS',
  'LAB',
  'HOSTEL',
  'OTHER'
] as const

const SEMESTERS = ['SPRING', 'FALL', 'SUMMER'] as const

export default function FeeManagementPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFee, setEditingFee] = useState<Fee | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY)
  const [formData, setFormData] = useState<FeeFormData>({
    title: '',
    description: '',
    type: '',
    amount: '',
    dueDate: '',
    academicYear: new Date().getFullYear().toString(),
    semester: '',
    grade: '',
    classId: '',
    isRecurring: false
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

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/fees')
      const result = await response.json()
      
      if (result.success) {
        setFees(result.data || [])
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load fees",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching fees:', error)
      toast({
        title: "Error",
        description: "Failed to load fees",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/classes')
      const result = await response.json()
      
      if (result.success) {
        setClasses(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }, [])

  useEffect(() => {
    fetchFees()
    fetchClasses()
  }, [fetchFees, fetchClasses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.type || !formData.amount || !formData.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const endpoint = editingFee 
        ? `/api/admin/fees/${editingFee.id}`
        : '/api/admin/fees'
      
      const method = editingFee ? 'PATCH' : 'POST'
      
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        academicYear: parseInt(formData.academicYear),
        grade: formData.grade ? parseInt(formData.grade) : null,
        classId: formData.classId || null,
        semester: formData.semester || null
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
          description: editingFee 
            ? "Fee updated successfully" 
            : "Fee created successfully"
        })
        
        setShowForm(false)
        setEditingFee(null)
        setFormData({
          title: '',
          description: '',
          type: '',
          amount: '',
          dueDate: '',
          academicYear: new Date().getFullYear().toString(),
          semester: '',
          grade: '',
          classId: '',
          isRecurring: false
        })
        fetchFees()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save fee",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving fee:', error)
      toast({
        title: "Error",
        description: "Failed to save fee",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee)
    setFormData({
      title: fee.title,
      description: fee.description || '',
      type: fee.type,
      amount: fee.amount.toString(),
      dueDate: fee.dueDate.split('T')[0],
      academicYear: fee.academicYear.toString(),
      semester: fee.semester || '',
      grade: fee.grade?.toString() || '',
      classId: fee.classId || '',
      isRecurring: fee.isRecurring
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/fees/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Fee deleted successfully"
        })
        fetchFees()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete fee",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting fee:', error)
      toast({
        title: "Error",
        description: "Failed to delete fee",
        variant: "destructive"
      })
    }
  }

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || fee.type === typeFilter
    const matchesGrade = !gradeFilter || fee.grade?.toString() === gradeFilter
    
    return matchesSearch && matchesType && matchesGrade
  })

  const stats = {
    totalFees: fees.length,
    activeFees: fees.filter(f => f.status === 'ACTIVE').length,
    totalAmount: fees.reduce((sum, f) => sum + f.amount, 0),
    recurringFees: fees.filter(f => f.isRecurring).length
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Fee Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage school fees and payment structures
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchFees}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => {
            setEditingFee(null)
            setFormData({
              title: '',
              description: '',
              type: '',
              amount: '',
              dueDate: '',
              academicYear: new Date().getFullYear().toString(),
              semester: '',
              grade: '',
              classId: '',
              isRecurring: false
            })
            setShowForm(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Fee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeFees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Amount
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
              Recurring Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recurringFees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingFee ? 'Edit Fee' : 'Add New Fee'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingFee(null)
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
                  <Label htmlFor="title">Fee Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Tuition Fee - Grade 10"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Fee Type *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    required
                  >
                    <option value="">Select type</option>
                    {FEE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
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
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
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
                  <Label htmlFor="semester">Semester</Label>
                  <select
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">All Semesters</option>
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    type="number"
                    value={formData.grade}
                    onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <Label htmlFor="classId">Specific Class</Label>
                  <select
                    id="classId"
                    value={formData.classId}
                    onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                  >
                    <option value="">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - Grade {cls.grade} {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about this fee..."
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium">Recurring Fee (applies every semester/year)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingFee(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Fee'}
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
                  placeholder="Search fees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="">All Types</option>
                {FEE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="">All Grades</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fees List */}
      <Card>
        <CardHeader>
          <CardTitle>Fees ({filteredFees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading fees...</p>
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No fees found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFees.map(fee => (
                <motion.div
                  key={fee.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-slate-900 dark:text-white">
                        {fee.title}
                      </span>
                      <Badge variant={fee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {fee.status}
                      </Badge>
                      <Badge variant="outline">{fee.type}</Badge>
                      {fee.isRecurring && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          Recurring
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(fee.amount, currencySettings)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
                      {fee.grade && (
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          Grade {fee.grade}
                        </div>
                      )}
                      {fee.class && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {fee.class.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(fee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(fee.id)}
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
    </div>
  )
}
