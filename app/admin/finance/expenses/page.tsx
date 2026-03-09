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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, CurrencySettings, DEFAULT_CURRENCY } from '@/lib/currency'
import { 
  CreditCard,
  Search,
  Download,
  Plus,
  Edit,
  Eye,
  Receipt,
  RefreshCw,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Save,
  X,
  Trash2, Users, Zap, Package, Monitor
} from 'lucide-react'

interface Expense {
  id: string
  title: string
  description: string | null
  category: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'
  paymentDate: string | null
  paymentMethod: string | null
  vendorName: string | null
  vendorContact: string | null
  invoiceNumber: string | null
  receiptUrl: string | null
  fiscalYear: number
  fiscalMonth: number
  createdAt: string
  updatedAt: string
  approvedBy: string | null
  approvedAt: string | null
}

interface ExpenseFormData {
  title: string
  description: string
  category: string
  amount: string
  vendorName: string
  vendorContact: string
  invoiceNumber: string
  fiscalYear: string
  fiscalMonth: string
}

const EXPENSE_CATEGORIES = [
  'SALARIES',
  'INFRASTRUCTURE', 
  'UTILITIES',
  'SUPPLIES',
  'MARKETING',
  'MAINTENANCE',
  'TRANSPORT',
  'INSURANCE',
  'TECHNOLOGY',
  'OTHER'
] as const

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY)
  const [formData, setFormData] = useState<ExpenseFormData>({
    title: '',
    description: '',
    category: '',
    amount: '',
    vendorName: '',
    vendorContact: '',
    invoiceNumber: '',
    fiscalYear: new Date().getFullYear().toString(),
    fiscalMonth: (new Date().getMonth() + 1).toString()
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

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/expenses')
      const result = await response.json()
      
      if (result.success) {
        setExpenses(result.data || [])
      } else {
        toast.error("Failed to load expenses")
      }
    } catch {
      toast.error("Failed to load expenses")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || expense.category === categoryFilter
    const matchesStatus = !statusFilter || expense.status === statusFilter
    const matchesTab = activeTab === 'all' || expense.status.toLowerCase() === activeTab
    return matchesSearch && matchesCategory && matchesStatus && matchesTab
  })

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      amount: '',
      vendorName: '',
      vendorContact: '',
      invoiceNumber: '',
      fiscalYear: new Date().getFullYear().toString(),
      fiscalMonth: (new Date().getMonth() + 1).toString()
    })
    setEditingExpense(null)
    setShowForm(false)
  }

  const handleEdit = (expense: Expense) => {
    setFormData({
      title: expense.title,
      description: expense.description || '',
      category: expense.category,
      amount: expense.amount.toString(),
      vendorName: expense.vendorName || '',
      vendorContact: expense.vendorContact || '',
      invoiceNumber: expense.invoiceNumber || '',
      fiscalYear: expense.fiscalYear.toString(),
      fiscalMonth: expense.fiscalMonth.toString()
    })
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDetails(true)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.amount) {
      toast.error("Please fill all required fields")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading(editingExpense ? "Updating expense..." : "Creating expense...")

    try {
      const url = editingExpense 
        ? `/api/admin/expenses/${editingExpense.id}`
        : '/api/admin/expenses'
      
      const response = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          fiscalYear: parseInt(formData.fiscalYear),
          fiscalMonth: parseInt(formData.fiscalMonth)
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success(editingExpense ? "Expense updated!" : "Expense created!")
        resetForm()
        fetchExpenses()
      } else {
        throw new Error(result.error || 'Failed to save expense')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save expense'
      toast.error("Save failed", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (expense: Expense, newStatus: string) => {
    const toastId = toast.loading("Updating expense status...")

    try {
      const response = await fetch(`/api/admin/expenses/${expense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Status updated!")
        fetchExpenses()
        if (selectedExpense?.id === expense.id) {
          setSelectedExpense({ ...expense, status: newStatus as 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' })
        }
      } else {
        throw new Error(result.error || 'Failed to update status')
      }
    } catch {
      toast.dismiss(toastId)
      toast.error("Update failed")
    }
  }

  const handleDelete = async (expense: Expense) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    const toastId = toast.loading("Deleting expense...")

    try {
      const response = await fetch(`/api/admin/expenses/${expense.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.dismiss(toastId)
        toast.success("Expense deleted!")
        fetchExpenses()
        setShowDetails(false)
      } else {
        throw new Error('Failed to delete expense')
      }
    } catch {
      toast.dismiss(toastId)
      toast.error("Delete failed")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'PAID': return <DollarSign className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SALARIES': return <Users className="h-4 w-4" />
      case 'INFRASTRUCTURE': return <Building className="h-4 w-4" />
      case 'UTILITIES': return <Zap className="h-4 w-4" />
      case 'SUPPLIES': return <Package className="h-4 w-4" />
      case 'TECHNOLOGY': return <Monitor className="h-4 w-4" />
      default: return <Receipt className="h-4 w-4" />
    }
  }

  // Calculate stats
  const stats = {
    total: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    pending: expenses.filter(exp => exp.status === 'PENDING').length,
    approved: expenses.filter(exp => exp.status === 'APPROVED').length,
    paid: expenses.filter(exp => exp.status === 'PAID').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Expense Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track and manage school expenses with approval workflow
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast.success("Export started")}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Receipt className="h-3 w-3 mr-1" />
              All records
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalAmount, currencySettings)}
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <DollarSign className="h-3 w-3 mr-1" />
              This year
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              Awaiting approval
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready for payment
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <DollarSign className="h-3 w-3 mr-1" />
              Completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search expenses..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchExpenses}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({expenses.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({stats.paid})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({expenses.filter(e => e.status === 'REJECTED').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Records ({filteredExpenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading expenses...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No expenses found</p>
                  <Button onClick={() => setShowForm(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Expense
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExpenses.map(expense => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800">
                            {getCategoryIcon(expense.category)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {expense.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {expense.category.charAt(0) + expense.category.slice(1).toLowerCase()}
                              {expense.vendorName && ` • ${expense.vendorName}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                              {formatCurrency(expense.amount, currencySettings)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {MONTHS[expense.fiscalMonth - 1]} {expense.fiscalYear}
                            </div>
                          </div>
                          <Badge className={getStatusColor(expense.status)}>
                            {getStatusIcon(expense.status)}
                            <span className="ml-1">{expense.status}</span>
                          </Badge>
                        </div>
                      </div>
                      
                      {expense.description && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {expense.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-600">
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          {expense.invoiceNumber && (
                            <span>Invoice: {expense.invoiceNumber}</span>
                          )}
                          <span>Created: {new Date(expense.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(expense)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {expense.status === 'PENDING' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleStatusUpdate(expense, 'APPROVED')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleStatusUpdate(expense, 'REJECTED')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {expense.status === 'APPROVED' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleStatusUpdate(expense, 'PAID')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(expense)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {expense.status === 'PENDING' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(expense)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter expense title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0) + category.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="vendorName">Vendor Name</Label>
                  <Input
                    id="vendorName"
                    placeholder="Enter vendor name"
                    value={formData.vendorName}
                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="vendorContact">Vendor Contact</Label>
                  <Input
                    id="vendorContact"
                    placeholder="Enter vendor contact"
                    value={formData.vendorContact}
                    onChange={(e) => handleInputChange('vendorContact', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="Enter invoice number"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="fiscalYear">Fiscal Year</Label>
                  <Select value={formData.fiscalYear} onValueChange={(value) => handleInputChange('fiscalYear', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2023, 2022].map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fiscalMonth">Fiscal Month</Label>
                  <Select value={formData.fiscalMonth} onValueChange={(value) => handleInputChange('fiscalMonth', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter expense description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : editingExpense ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense Details Modal */}
      {showDetails && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expense Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expense Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                  {getCategoryIcon(selectedExpense.category)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedExpense.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedExpense.category.charAt(0) + selectedExpense.category.slice(1).toLowerCase()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatCurrency(selectedExpense.amount, currencySettings)}</div>
                  <Badge className={getStatusColor(selectedExpense.status)}>
                    {getStatusIcon(selectedExpense.status)}
                    <span className="ml-1">{selectedExpense.status}</span>
                  </Badge>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Vendor</label>
                  <p className="font-semibold">{selectedExpense.vendorName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact</label>
                  <p className="font-semibold">{selectedExpense.vendorContact || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Invoice Number</label>
                  <p className="font-semibold">{selectedExpense.invoiceNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Period</label>
                  <p className="font-semibold">
                    {MONTHS[selectedExpense.fiscalMonth - 1]} {selectedExpense.fiscalYear}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</label>
                  <p className="font-semibold">{new Date(selectedExpense.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Date</label>
                  <p className="font-semibold">
                    {selectedExpense.paymentDate 
                      ? new Date(selectedExpense.paymentDate).toLocaleDateString() 
                      : 'Not paid'}
                  </p>
                </div>
              </div>

              {selectedExpense.description && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
                  <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded mt-1">
                    {selectedExpense.description}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedExpense.status === 'PENDING' && (
                  <>
                    <Button 
                      onClick={() => handleStatusUpdate(selectedExpense, 'APPROVED')}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleStatusUpdate(selectedExpense, 'REJECTED')}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedExpense.status === 'APPROVED' && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedExpense, 'PAID')}
                    className="flex-1"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleEdit(selectedExpense)
                    setShowDetails(false)
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
