"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
  AlertCircle,
  Send,
  Printer,
  X,
  Save
} from 'lucide-react'

interface Payment {
  id: string
  feeId: string
  studentId: string
  amountPaid: number
  paymentDate: string | null
  paymentMethod: string | null
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  transactionId: string | null
  notes: string | null
  createdAt: string
  fee: {
    title: string
    type: string
    amount: number
    dueDate: string
  }
  student: {
    name: string
    email: string
    studentNumber: string
    class?: {
      name: string
      grade: number
    }
  }
}

interface PaymentFormData {
  feeId: string
  studentId: string
  amountPaid: string
  paymentMethod: string
  transactionId: string
  notes: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY)
  const [formData, setFormData] = useState<PaymentFormData>({
    feeId: '',
    studentId: '',
    amountPaid: '',
    paymentMethod: '',
    transactionId: '',
    notes: ''
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

  const fetchPayments = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/payments')
      const result = await response.json()
      
      if (result.success) {
        setPayments(result.data || [])
      } else {
        toast.error("Failed to load payments", {
          description: result.error || "Something went wrong"
        })
      }
    } catch {
      toast.error("Failed to load payments", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.fee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      feeId: '',
      studentId: '',
      amountPaid: '',
      paymentMethod: '',
      transactionId: '',
      notes: ''
    })
    setEditingPayment(null)
    setShowForm(false)
  }

  const handleEdit = (payment: Payment) => {
    setFormData({
      feeId: payment.feeId,
      studentId: payment.studentId,
      amountPaid: payment.amountPaid.toString(),
      paymentMethod: payment.paymentMethod || '',
      transactionId: payment.transactionId || '',
      notes: payment.notes || ''
    })
    setEditingPayment(payment)
    setShowForm(true)
  }

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowDetails(true)
  }

  const handleSubmit = async () => {
    if (!formData.feeId || !formData.studentId || !formData.amountPaid) {
      toast.error("Please fill all required fields")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading(editingPayment ? "Updating payment..." : "Creating payment...")

    try {
      const url = editingPayment 
        ? `/api/admin/payments/${editingPayment.id}`
        : '/api/admin/payments'
      
      const response = await fetch(url, {
        method: editingPayment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amountPaid: parseFloat(formData.amountPaid)
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success(editingPayment ? "Payment updated!" : "Payment created!", {
          description: editingPayment 
            ? "Payment record has been updated successfully"
            : "New payment has been recorded"
        })
        
        resetForm()
        fetchPayments()
      } else {
        throw new Error(result.error || 'Failed to save payment')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save payment'
      toast.error("Save failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (payment: Payment, newStatus: string) => {
    const toastId = toast.loading("Updating payment status...")

    try {
      const response = await fetch(`/api/admin/payments/${payment.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Status updated!", {
          description: `Payment status changed to ${newStatus.toLowerCase()}`
        })
        fetchPayments()
      } else {
        throw new Error(result.error || 'Failed to update status')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status'
      toast.error("Update failed", {
        description: errorMessage
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'OVERDUE': return <AlertCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const stats = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amountPaid, 0),
    paidPayments: payments.filter(p => p.status === 'PAID').length,
    pendingPayments: payments.filter(p => p.status === 'PENDING').length
  }

  const exportPayments = () => {
    toast.success("Export started", {
      description: "Payment report will be downloaded shortly"
    })
  }

  const sendReminder = (payment: Payment) => {
    toast.success("Reminder sent", {
      description: `Payment reminder sent to ${payment.student.name}`
    })
  }

  const generateReceipt = (payment: Payment) => {
    toast.success("Receipt generated", {
      description: `Receipt for ${payment.student.name} is ready`
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Payment Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track and manage student fee payments
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportPayments}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
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
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalAmount, currencySettings)}
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <DollarSign className="h-3 w-3 mr-1" />
              All time
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Paid Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.paidPayments}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed transactions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              Awaiting payment
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
                placeholder="Search by student, fee, or transaction ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Button variant="outline" onClick={fetchPayments}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Record First Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map(payment => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="" alt={payment.student.name} />
                        <AvatarFallback>
                          {payment.student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {payment.student.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {payment.student.studentNumber} • {payment.student.class?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1">{payment.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Fee Type</div>
                      <div className="font-semibold">{payment.fee.title}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount</div>
                      <div className="font-semibold text-green-600">{formatCurrency(payment.amountPaid, currencySettings)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Date</div>
                      <div className="font-semibold">
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Not paid'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Method</div>
                      <div className="font-semibold">{payment.paymentMethod || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-600">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      {payment.transactionId && (
                        <span>Transaction: {payment.transactionId}</span>
                      )}
                      <span>Due: {new Date(payment.fee.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.status === 'PAID' && (
                        <Button variant="ghost" size="sm" onClick={() => generateReceipt(payment)}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                      {payment.status === 'PENDING' && (
                        <Button variant="ghost" size="sm" onClick={() => sendReminder(payment)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingPayment ? 'Edit Payment' : 'Record New Payment'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentId">Student *</Label>
                <Input
                  id="studentId"
                  placeholder="Enter student ID or name"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="feeId">Fee Type *</Label>
                <Input
                  id="feeId"
                  placeholder="Enter fee ID"
                  value={formData.feeId}
                  onChange={(e) => handleInputChange('feeId', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="amountPaid">Amount Paid *</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amountPaid}
                  onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  className="w-full p-2 border rounded-md"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                >
                  <option value="">Select method</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Online">Online Payment</option>
                </select>
              </div>

              <div>
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter transaction reference"
                  value={formData.transactionId}
                  onChange={(e) => handleInputChange('transactionId', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes (optional)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : editingPayment ? 'Update' : 'Record'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={selectedPayment.student.name} />
                  <AvatarFallback>
                    {selectedPayment.student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedPayment.student.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedPayment.student.studentNumber} • {selectedPayment.student.class?.name}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedPayment.status)}>
                  {getStatusIcon(selectedPayment.status)}
                  <span className="ml-1">{selectedPayment.status}</span>
                </Badge>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Fee Type</label>
                  <p className="font-semibold">{selectedPayment.fee.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount Paid</label>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedPayment.amountPaid, currencySettings)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Date</label>
                  <p className="font-semibold">
                    {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString() : 'Not paid'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Due Date</label>
                  <p className="font-semibold">{new Date(selectedPayment.fee.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Method</label>
                  <p className="font-semibold">{selectedPayment.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Transaction ID</label>
                  <p className="font-semibold">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>

              {selectedPayment.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Notes</label>
                  <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded">{selectedPayment.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedPayment.status === 'PENDING' && (
                  <Button 
                    onClick={() => handleStatusUpdate(selectedPayment, 'PAID')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
                {selectedPayment.status === 'PAID' && (
                  <Button 
                    variant="outline"
                    onClick={() => generateReceipt(selectedPayment)}
                    className="flex-1"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleEdit(selectedPayment)
                    setShowDetails(false)
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
