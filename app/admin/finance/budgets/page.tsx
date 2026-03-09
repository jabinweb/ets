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
import { Progress } from "@/components/ui/progress"
import { formatCurrency, CurrencySettings, DEFAULT_CURRENCY } from '@/lib/currency'
import { 
  Wallet,
  Search,
  Download,
  Plus,
  Edit,
  RefreshCw,
  DollarSign,
  Calendar,
  X,
  Save,
  Trash2,
  AlertTriangle
} from 'lucide-react'

interface Budget {
  id: string
  department: string
  category: string
  fiscalYear: number
  allocatedAmount: number
  spentAmount: number
  remainingAmount: number
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'EXCEEDED'
  description: string | null
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

interface BudgetFormData {
  department: string
  category: string
  fiscalYear: string
  allocatedAmount: string
  description: string
  startDate: string
  endDate: string
}

const DEPARTMENTS = [
  'ACADEMIC',
  'ADMINISTRATION',
  'INFRASTRUCTURE',
  'SPORTS',
  'LIBRARY',
  'TECHNOLOGY',
  'MAINTENANCE',
  'TRANSPORT',
  'EVENTS',
  'OTHER'
] as const

const CATEGORIES = [
  'SALARIES',
  'INFRASTRUCTURE',
  'UTILITIES',
  'SUPPLIES',
  'MARKETING',
  'MAINTENANCE',
  'TRANSPORT',
  'INSURANCE',
  'TECHNOLOGY',
  'EVENTS',
  'OTHER'
] as const

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY)
  const [formData, setFormData] = useState<BudgetFormData>({
    department: '',
    category: '',
    fiscalYear: new Date().getFullYear().toString(),
    allocatedAmount: '',
    description: '',
    startDate: '',
    endDate: ''
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

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/budgets')
      const result = await response.json()
      
      if (result.success) {
        setBudgets(result.data || [])
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load budgets",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.department || !formData.category || !formData.allocatedAmount || !formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const endpoint = editingBudget 
        ? `/api/admin/budgets/${editingBudget.id}`
        : '/api/admin/budgets'
      
      const method = editingBudget ? 'PATCH' : 'POST'
      
      const payload = {
        ...formData,
        allocatedAmount: parseFloat(formData.allocatedAmount),
        fiscalYear: parseInt(formData.fiscalYear)
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
          description: editingBudget 
            ? "Budget updated successfully" 
            : "Budget created successfully"
        })
        
        setShowForm(false)
        setEditingBudget(null)
        setFormData({
          department: '',
          category: '',
          fiscalYear: new Date().getFullYear().toString(),
          allocatedAmount: '',
          description: '',
          startDate: '',
          endDate: ''
        })
        fetchBudgets()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save budget",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      toast({
        title: "Error",
        description: "Failed to save budget",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      department: budget.department,
      category: budget.category,
      fiscalYear: budget.fiscalYear.toString(),
      allocatedAmount: budget.allocatedAmount.toString(),
      description: budget.description || '',
      startDate: budget.startDate.split('T')[0],
      endDate: budget.endDate.split('T')[0]
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/budgets/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Budget deleted successfully"
        })
        fetchBudgets()
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete budget",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive"
      })
    }
  }

  const getUtilizationPercentage = (budget: Budget) => {
    if (budget.allocatedAmount === 0) return 0
    return (budget.spentAmount / budget.allocatedAmount) * 100
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || budget.department === departmentFilter
    const matchesStatus = !statusFilter || budget.status === statusFilter
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const stats = {
    totalAllocated: budgets.reduce((sum, b) => sum + b.allocatedAmount, 0),
    totalSpent: budgets.reduce((sum, b) => sum + b.spentAmount, 0),
    totalRemaining: budgets.reduce((sum, b) => sum + b.remainingAmount, 0),
    exceededBudgets: budgets.filter(b => b.status === 'EXCEEDED').length
  }

  const overallUtilization = stats.totalAllocated > 0 
    ? (stats.totalSpent / stats.totalAllocated) * 100 
    : 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Budget Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track and manage departmental budgets and expenses
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchBudgets}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => {
            setEditingBudget(null)
            setFormData({
              department: '',
              category: '',
              fiscalYear: new Date().getFullYear().toString(),
              allocatedAmount: '',
              description: '',
              startDate: '',
              endDate: ''
            })
            setShowForm(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAllocated, currencySettings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalSpent, currencySettings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRemaining, currencySettings)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Over Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.exceededBudgets}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Utilized: {overallUtilization.toFixed(1)}%</span>
              <span className={getUtilizationColor(overallUtilization)}>
                {formatCurrency(stats.totalSpent, currencySettings)} / {formatCurrency(stats.totalAllocated, currencySettings)}
              </span>
            </div>
            <Progress value={overallUtilization} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingBudget(null)
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
                  <Label htmlFor="department">Department *</Label>
                  <select
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    required
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="fiscalYear">Fiscal Year *</Label>
                  <Input
                    id="fiscalYear"
                    type="number"
                    value={formData.fiscalYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, fiscalYear: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="allocatedAmount">Allocated Amount *</Label>
                  <Input
                    id="allocatedAmount"
                    type="number"
                    step="0.01"
                    value={formData.allocatedAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, allocatedAmount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details about this budget..."
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
                    setEditingBudget(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Budget'}
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
                  placeholder="Search budgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="">All Status</option>
                <option value="DRAFT">DRAFT</option>
                <option value="APPROVED">APPROVED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="EXCEEDED">EXCEEDED</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      <Card>
        <CardHeader>
          <CardTitle>Budgets ({filteredBudgets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading budgets...</p>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No budgets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBudgets.map(budget => {
                const utilization = getUtilizationPercentage(budget)
                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Wallet className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {budget.department} - {budget.category}
                          </span>
                          <Badge variant={
                            budget.status === 'EXCEEDED' ? 'destructive' :
                            budget.status === 'ACTIVE' ? 'default' : 'secondary'
                          }>
                            {budget.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            FY {budget.fiscalYear}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            Allocated: {formatCurrency(budget.allocatedAmount, currencySettings)}
                          </div>
                          {budget.status === 'EXCEEDED' && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              Over Budget
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Utilized: {utilization.toFixed(1)}%</span>
                            <span className={getUtilizationColor(utilization)}>
                              {formatCurrency(budget.spentAmount, currencySettings)} / {formatCurrency(budget.allocatedAmount, currencySettings)}
                            </span>
                          </div>
                          <Progress value={Math.min(utilization, 100)} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600">
                              Remaining: {formatCurrency(budget.remainingAmount, currencySettings)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
