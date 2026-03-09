"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, type CurrencySettings, DEFAULT_CURRENCY } from '@/lib/currency'
import { 
  DollarSign, Search, Plus, Eye, Download, RefreshCw, 
  Users, TrendingUp, Calendar, CheckCircle, Clock,
  CreditCard, Calculator, MoreHorizontal, AlertCircle} from 'lucide-react'

interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  position: string
  department: string
  baseSalary: number
  allowances: number
  deductions: number
  overtime: number
  netSalary: number
  payPeriod: string
  payDate: string
  status: 'pending' | 'processed' | 'paid' | 'cancelled'
  bankAccount: string
  taxDeducted: number
}

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showPayrollForm, setShowPayrollForm] = useState(false)
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY)
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

  const fetchPayrollRecords = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/teachers/payroll')
      const result = await response.json()
      
      if (result.success) {
        setPayrollRecords(result.data || [])
      } else {
        toast.error("Failed to load payroll records")
      }
    } catch {
      toast.error("Failed to load payroll records")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchPayrollRecords()
  }, [fetchPayrollRecords])

  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesMonth = monthFilter === 'all' || record.payPeriod.includes(monthFilter)
    return matchesSearch && matchesStatus && matchesMonth
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'processed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'processed': return <CreditCard className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleViewDetails = (record: PayrollRecord) => {
    setSelectedRecord(record)
    setShowDetails(true)
  }

  const handleStatusUpdate = async (recordId: string, newStatus: string) => {
    const toastId = toast.loading("Updating payroll status...")

    try {
      const response = await fetch('/api/admin/teachers/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'updateStatus', 
          recordId, 
          status: newStatus 
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Status updated!")
        fetchPayrollRecords()
      } else {
        throw new Error(result.error || 'Failed to update status')
      }
    } catch {
      toast.dismiss(toastId)
      toast.error("Update failed")
    }
  }

  const handleProcessPayroll = async (recordId: string) => {
    if (!confirm('Are you sure you want to process this payroll?')) return

    await handleStatusUpdate(recordId, 'processed')
  }

  const stats = {
    totalEmployees: payrollRecords.length,
    totalPayroll: payrollRecords.reduce((sum, record) => sum + record.netSalary, 0),
    averageSalary: payrollRecords.reduce((sum, record) => sum + record.netSalary, 0) / payrollRecords.length || 0,
    pendingPayments: payrollRecords.filter(record => record.status === 'pending').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Payroll Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage employee salaries and payroll processing
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast.success("Export started")}>
            <Download className="h-4 w-4 mr-2" />
            Export Payroll
          </Button>
          <Button onClick={() => setShowPayrollForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <Users className="h-3 w-3 mr-1" />
              Active staff
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalPayroll, currencySettings)}
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <DollarSign className="h-3 w-3 mr-1" />
              This month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.averageSalary, currencySettings)}
            </div>
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Per employee
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
              Awaiting processing
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
                placeholder="Search employees..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value="January 2024">January 2024</SelectItem>
                <SelectItem value="February 2024">February 2024</SelectItem>
                <SelectItem value="March 2024">March 2024</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchPayrollRecords}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Records */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records ({filteredRecords.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading payroll records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payroll records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map(record => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {record.employeeName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {record.position} • {record.department} • {record.employeeId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {formatCurrency(record.netSalary, currencySettings)}
                        </div>
                        <div className="text-xs text-slate-500">{record.payPeriod}</div>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1">{record.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{formatCurrency(record.baseSalary, currencySettings)}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Base Salary</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{formatCurrency(record.allowances, currencySettings)}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Allowances</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{formatCurrency(record.overtime, currencySettings)}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Overtime</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-lg font-bold text-red-600">{formatCurrency(record.deductions, currencySettings)}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Deductions</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Bank: {record.bankAccount} • Tax: {formatCurrency(record.taxDeducted, currencySettings)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {record.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleProcessPayroll(record.id)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Process
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payroll Details Modal */}
      {showDetails && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payroll Details - {selectedRecord.employeeName}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Employee Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {selectedRecord.employeeName}</div>
                        <div><strong>ID:</strong> {selectedRecord.employeeId}</div>
                        <div><strong>Position:</strong> {selectedRecord.position}</div>
                        <div><strong>Department:</strong> {selectedRecord.department}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Payment Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Pay Period:</strong> {selectedRecord.payPeriod}</div>
                        <div><strong>Pay Date:</strong> {new Date(selectedRecord.payDate).toLocaleDateString()}</div>
                        <div><strong>Bank Account:</strong> {selectedRecord.bankAccount}</div>
                        <div><strong>Status:</strong> 
                          <Badge className={`ml-2 ${getStatusColor(selectedRecord.status)}`}>
                            {selectedRecord.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="breakdown" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Salary Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <span>Base Salary</span>
                        <span className="font-bold text-blue-600">{formatCurrency(selectedRecord.baseSalary, currencySettings)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span>Allowances</span>
                        <span className="font-bold text-green-600">+{formatCurrency(selectedRecord.allowances, currencySettings)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                        <span>Overtime</span>
                        <span className="font-bold text-orange-600">+{formatCurrency(selectedRecord.overtime, currencySettings)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                        <span>Deductions (Tax, Insurance, etc.)</span>
                        <span className="font-bold text-red-600">-{formatCurrency(selectedRecord.deductions, currencySettings)}</span>
                      </div>
                      <hr />
                      <div className="flex justify-between items-center p-3 bg-slate-100 rounded font-bold text-lg">
                        <span>Net Salary</span>
                        <span className="text-primary">{formatCurrency(selectedRecord.netSalary, currencySettings)}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Payment History</h4>
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Payment history feature coming soon</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Process Payroll Modal */}
      {showPayrollForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Process Monthly Payroll</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPayrollForm(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Calculator className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Bulk Payroll Processing</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Process payroll for all employees for the current month
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                      <div className="font-semibold">Total Employees</div>
                      <div className="text-2xl font-bold text-primary">{stats.totalEmployees}</div>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded">
                      <div className="font-semibold">Total Amount</div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPayroll, currencySettings)}</div>
                    </div>
                  </div>
                  <Button className="w-full" size="lg">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Process All Payroll
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
