"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  DollarSign,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  CreditCard,
  FileText,
  Calculator,
  Banknote
} from 'lucide-react'

interface PayrollRecord {
  id: string
  payPeriod: string
  payYear: number
  payMonth: number
  baseSalary: number
  allowances: number
  overtime: number
  bonus: number
  taxDeducted: number
  insurance: number
  providentFund: number
  otherDeductions: number
  grossSalary: number
  totalDeductions: number
  netSalary: number
  paymentDate?: string
  paymentMethod?: string
  status: 'PENDING' | 'PROCESSED' | 'PAID' | 'CANCELLED'
  workingDays: number
  actualDays: number
  notes?: string
}

interface PayrollSummary {
  currentMonthSalary: number
  ytdGross: number
  ytdDeductions: number
  ytdNet: number
  avgMonthlySalary: number
  totalTaxDeducted: number
}

interface SchoolSettings {
  currencyPosition: string
  currencySymbol: string
}

export default function TeacherPayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null)
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)
  const [view, setView] = useState<'list' | 'detail'>('list')
  const { toast } = useToast()

  const fetchSchoolSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/school/settings')
      const result = await response.json()
      
      if (result.success) {
        setSchoolSettings(result.data)
      }
    } catch (error) {
      console.error('Error fetching school settings:', error)
    }
  }, [])

  const fetchPayrollData = useCallback(async () => {
    try {
      const [recordsResponse, summaryResponse] = await Promise.all([
        fetch('/api/teacher/payroll/records'),
        fetch('/api/teacher/payroll/summary')
      ])
      
      const recordsResult = await recordsResponse.json()
      const summaryResult = await summaryResponse.json()
      
      if (recordsResult.success) {
        setPayrollRecords(recordsResult.data || [])
      }
      
      if (summaryResult.success) {
        setPayrollSummary(summaryResult.data)
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error)
      toast.error("Failed to load payroll data", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSchoolSettings()
    fetchPayrollData()
  }, [fetchSchoolSettings, fetchPayrollData])

  const formatCurrency = useCallback((amount: number | string | null | undefined) => {
    // Convert to number and handle edge cases
    const numAmount = typeof amount === 'number' ? amount : 
                     typeof amount === 'string' ? parseFloat(amount) : 0
    
    // Handle NaN or invalid numbers
    const validAmount = isNaN(numAmount) ? 0 : numAmount

    if (!schoolSettings) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(validAmount)
    }

    const formatted = validAmount.toFixed(2)
    return schoolSettings.currencyPosition === 'before' 
      ? `${schoolSettings.currencySymbol}${formatted}`
      : `${formatted}${schoolSettings.currencySymbol}`
  }, [schoolSettings])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSED': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadPayslip = async (recordId: string) => {
    const toastId = toast.loading("Generating PDF payslip...")
    
    try {
      const response = await fetch(`/api/teacher/payroll/payslip/${recordId}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payslip-${recordId}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.dismiss(toastId)
        toast.success("PDF payslip downloaded successfully")
      } else {
        throw new Error('Failed to download payslip')
      }
    } catch {
      toast.dismiss(toastId)
      toast.error("Failed to download payslip", {
        description: "Please try again later"
      })
    }
  }

  const viewDetails = (record: PayrollRecord) => {
    setSelectedRecord(record)
    setView('detail')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Payroll & Salary
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            View your salary details and download payslips
          </p>
        </div>
        <div className="flex gap-2 md:gap-3">
          <Button variant="outline" onClick={() => setView('list')} size="sm" className="md:h-10">
            <FileText className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">All Records</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {payrollSummary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Current Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                {formatCurrency(payrollSummary.currentMonthSalary)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                YTD Gross
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {formatCurrency(payrollSummary.ytdGross)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                YTD Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                {formatCurrency(payrollSummary.ytdDeductions)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                YTD Net
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                {formatCurrency(payrollSummary.ytdNet)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Avg Monthly
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {formatCurrency(payrollSummary.avgMonthlySalary)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Tax
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                {formatCurrency(payrollSummary.totalTaxDeducted)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'detail')}>
        <TabsList>
          <TabsTrigger value="list">Payroll Records</TabsTrigger>
          {selectedRecord && (
            <TabsTrigger value="detail">Payment Details</TabsTrigger>
          )}
        </TabsList>

        {/* Payroll Records List */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-500">Loading payroll records...</p>
                </div>
              ) : payrollRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payroll records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payrollRecords.map(record => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                              {record.payPeriod}
                            </h3>
                            <Badge className={getStatusColor(record.status)} variant="outline">
                              {record.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <span className="text-slate-500 text-xs sm:text-sm">Gross Salary</span>
                              <div className="font-semibold text-sm sm:text-base">{formatCurrency(record.grossSalary)}</div>
                            </div>
                            <div>
                              <span className="text-slate-500 text-xs sm:text-sm">Deductions</span>
                              <div className="font-semibold text-red-600 text-sm sm:text-base">{formatCurrency(record.totalDeductions)}</div>
                            </div>
                            <div>
                              <span className="text-slate-500 text-xs sm:text-sm">Net Salary</span>
                              <div className="font-semibold text-green-600 text-sm sm:text-base">{formatCurrency(record.netSalary)}</div>
                            </div>
                            <div>
                              <span className="text-slate-500 text-xs sm:text-sm">Payment Date</span>
                              <div className="font-semibold text-sm sm:text-base">
                                {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : 'Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <Button variant="outline" size="sm" onClick={() => viewDetails(record)} className="flex-1 sm:flex-none">
                            <Eye className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">View</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => downloadPayslip(record.id)} className="flex-1 sm:flex-none">
                            <Download className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">Download</span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {record.actualDays}/{record.workingDays} working days
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          {record.paymentMethod || 'Bank Transfer'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Detail View */}
        <TabsContent value="detail" className="space-y-6">
          {selectedRecord && (
            <Card>
              <CardHeader>
                <CardTitle>Salary Breakdown - {selectedRecord.payPeriod}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Earnings */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                    Earnings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm sm:text-base">
                      <span>Base Salary</span>
                      <span className="font-semibold">{formatCurrency(selectedRecord.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm sm:text-base">
                      <span>Allowances</span>
                      <span className="font-semibold">{formatCurrency(selectedRecord.allowances)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm sm:text-base">
                      <span>Overtime</span>
                      <span className="font-semibold">{formatCurrency(selectedRecord.overtime)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm sm:text-base">
                      <span>Bonus</span>
                      <span className="font-semibold">{formatCurrency(selectedRecord.bonus)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between p-3 sm:p-4 bg-green-100 dark:bg-green-800/30 rounded-lg mt-3 sm:mt-4 font-bold text-base sm:text-lg">
                    <span>Gross Salary</span>
                    <span>{formatCurrency(selectedRecord.grossSalary)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                    <Calculator className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-600" />
                    Deductions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm sm:text-base">
                      <span>Tax Deducted</span>
                      <span className="font-semibold">{formatCurrency(selectedRecord.taxDeducted)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm sm:text-base">
                      <span>Insurance</span>
                      <span className="font-semibold">{formatCurrency(selectedRecord.insurance)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm sm:text-base">
                      <span>Provident Fund</span>
                      <span className="font-semibold">{formatCurrency(selectedRecord.providentFund)}</span>
                    </div>
                    <div className="flex justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm sm:text-base">
                      <span>Other Deductions</span>
                      <span className="font-semibold">{formatCurrency(selectedRecord.otherDeductions)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between p-3 sm:p-4 bg-red-100 dark:bg-red-800/30 rounded-lg mt-3 sm:mt-4 font-bold text-base sm:text-lg">
                    <span>Total Deductions</span>
                    <span>{formatCurrency(selectedRecord.totalDeductions)}</span>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="border-t pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-xl">
                    <div className="flex items-center">
                      <Banknote className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-blue-600" />
                      <span className="text-lg sm:text-xl font-bold">Net Salary</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedRecord.netSalary)}
                    </span>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold">{selectedRecord.actualDays}</div>
                    <div className="text-xs sm:text-sm text-slate-500">Days Worked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold">{selectedRecord.workingDays}</div>
                    <div className="text-xs sm:text-sm text-slate-500">Working Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold">
                      {((selectedRecord.actualDays / selectedRecord.workingDays) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500">Attendance</div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-slate-600 dark:text-slate-400">{selectedRecord.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
