"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, type CurrencySettings, DEFAULT_CURRENCY } from '@/lib/currency'
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Receipt,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react'
import { format } from 'date-fns'

interface FeePayment {
  id: string
  feeId: string
  feeTitle: string
  feeType: string
  totalAmount: number
  amountPaid: number
  originalAmount?: number | null
  discountApplied: boolean
  discountAmount: number
  lateFeeApplied: boolean
  lateFeeAmount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate: string
  paymentDate?: string
  paymentMethod?: string
  transactionId?: string
  description?: string
  generatedFor?: string | null
  academicYear?: string | null
  isRecurring: boolean
  createdAt: string
}

interface MonthWiseData {
  month: string
  monthName: string
  academicYear: string | null
  totalAmount: number
  amountPaid: number
  amountDue: number
  fees: FeePayment[]
  summary: {
    totalFees: number
    paidFees: number
    pendingFees: number
    overdueFees: number
  }
}

interface FeeSummary {
  totalAmount: number
  totalPaid: number
  totalDue: number
  totalDiscount?: number
  totalLateFees?: number
  totalFees: number
  paidFees: number
  pendingFees: number
  overdueFees: number
}

interface StudentInfo {
  id: string
  name: string
  email: string
  admissionNumber?: string | null
  classId?: string | null
  className?: string | null
  grade?: string | null
}

interface FeesResponse {
  success: boolean
  view: 'all' | 'month-wise'
  data: {
    payments?: FeePayment[]
    months?: MonthWiseData[]
    summary: FeeSummary
    studentInfo: StudentInfo
  }
}

export default function FeesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(DEFAULT_CURRENCY)
  const [view, setView] = useState<'all' | 'month-wise'>('month-wise')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')
  const [payments, setPayments] = useState<FeePayment[]>([])
  const [monthsData, setMonthsData] = useState<MonthWiseData[]>([])
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [summary, setSummary] = useState<FeeSummary>({
    totalAmount: 0,
    totalPaid: 0,
    totalDue: 0,
    totalDiscount: 0,
    totalLateFees: 0,
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
    overdueFees: 0
  })
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {

        // Fetch currency settings
        const currencyRes = await fetch('/api/admin/settings/currency')
        if (currencyRes.ok) {
          const currencyData = await currencyRes.json()
          if (currencyData.success) {
            setCurrencySettings(currencyData.data)
          }
        }

        // Fetch fees data
        const feesRes = await fetch(`/api/student/fees?view=${view}`)
        if (!feesRes.ok) {
          const errorData = await feesRes.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch fees')
        }

        const feesData: FeesResponse = await feesRes.json()
        
        if (feesData.success) {
          setSummary(feesData.data.summary)
          setStudentInfo(feesData.data.studentInfo)

          if (view === 'month-wise' && feesData.data.months) {
            setMonthsData(feesData.data.months)
          } else if (view === 'all' && feesData.data.payments) {
            setPayments(feesData.data.payments)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load fee payments'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [view, toast])

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(month)) {
        newSet.delete(month)
      } else {
        newSet.add(month)
      }
      return newSet
    })
  }

  const getFilteredPayments = () => {
    if (filterStatus === 'all') return payments
    return payments.filter(p => p.status.toLowerCase() === filterStatus)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'OVERDUE':
        return <Badge className="bg-red-500 hover:bg-red-600"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading fees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fee Payments</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your fee payments
        </p>
      </div>

      {/* Student Info */}
      {studentInfo && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Student Name</p>
                <p className="text-lg font-semibold">{studentInfo.name}</p>
              </div>
              {studentInfo.admissionNumber && (
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Admission Number</p>
                  <p className="text-lg font-semibold">{studentInfo.admissionNumber}</p>
                </div>
              )}
              {studentInfo.className && (
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Class</p>
                  <p className="text-lg font-semibold">{studentInfo.className} {studentInfo.grade && `- ${studentInfo.grade}`}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount, currencySettings)}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.totalFees} total fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid, currencySettings)}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.paidFees} paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Due</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalDue, currencySettings)}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.pendingFees} pending, {summary.overdueFees} overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency((summary.totalDiscount || 0) - (summary.totalLateFees || 0), currencySettings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.totalDiscount ? `${formatCurrency(summary.totalDiscount, currencySettings)} discount` : 'No discount'} 
              {summary.totalLateFees ? `, ${formatCurrency(summary.totalLateFees, currencySettings)} late fees` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <Tabs value={view} onValueChange={(v) => setView(v as 'all' | 'month-wise')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="month-wise">Month-wise View</TabsTrigger>
            <TabsTrigger value="all">All Fees</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Month-wise View */}
      {view === 'month-wise' && (
        <div className="space-y-4">
          {monthsData.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No fees found</p>
              </CardContent>
            </Card>
          ) : (
            monthsData.map((month) => (
              <Card key={month.month} className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleMonth(month.month)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {month.monthName}
                        {month.academicYear && <span className="text-sm text-muted-foreground">({month.academicYear})</span>}
                      </CardTitle>
                      <CardDescription className="mt-2 flex flex-wrap gap-4 text-sm">
                        <span>Total: {formatCurrency(month.totalAmount, currencySettings)}</span>
                        <span className="text-green-600">Paid: {formatCurrency(month.amountPaid, currencySettings)}</span>
                        <span className="text-red-600">Due: {formatCurrency(month.amountDue, currencySettings)}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2 flex-wrap">
                        {month.summary.paidFees > 0 && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {month.summary.paidFees} Paid
                          </Badge>
                        )}
                        {month.summary.pendingFees > 0 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            {month.summary.pendingFees} Pending
                          </Badge>
                        )}
                        {month.summary.overdueFees > 0 && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            {month.summary.overdueFees} Overdue
                          </Badge>
                        )}
                      </div>
                      {expandedMonths.has(month.month) ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedMonths.has(month.month) && (
                  <CardContent className="pt-0 space-y-3">
                    {month.fees.map((payment) => (
                      <Card key={payment.id} className="border-l-4" style={{
                        borderLeftColor: payment.status === 'PAID' ? 'rgb(34 197 94)' : 
                                       payment.status === 'OVERDUE' ? 'rgb(239 68 68)' : 
                                       'rgb(234 179 8)'
                      }}>
                        <CardContent className="pt-4">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-base">{payment.feeTitle}</h3>
                                  <p className="text-sm text-muted-foreground">{payment.feeType}</p>
                                </div>
                                {getStatusBadge(payment.status)}
                              </div>

                              {payment.description && (
                                <p className="text-sm text-muted-foreground">{payment.description}</p>
                              )}

                              <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Due:</span>
                                  <span className="font-medium">{format(new Date(payment.dueDate), 'MMM dd, yyyy')}</span>
                                </div>
                                
                                {payment.paymentDate && (
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-muted-foreground">Paid:</span>
                                    <span className="font-medium">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</span>
                                  </div>
                                )}
                              </div>

                              {(payment.discountApplied || payment.lateFeeApplied) && (
                                <div className="flex flex-wrap gap-3 text-xs">
                                  {payment.originalAmount && payment.discountApplied && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <span>Original: {formatCurrency(payment.originalAmount, currencySettings)}</span>
                                      <span>•</span>
                                      <span>Discount: {formatCurrency(payment.discountAmount, currencySettings)}</span>
                                    </div>
                                  )}
                                  {payment.lateFeeApplied && (
                                    <div className="flex items-center gap-1 text-red-600">
                                      <span>Late Fee: {formatCurrency(payment.lateFeeAmount, currencySettings)}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {payment.transactionId && (
                                <div className="text-xs text-muted-foreground">
                                  Transaction ID: {payment.transactionId}
                                  {payment.paymentMethod && ` • ${payment.paymentMethod}`}
                                </div>
                              )}
                            </div>

                            <div className="flex lg:flex-col items-end gap-2 lg:text-right">
                              <div>
                                <p className="text-xs text-muted-foreground">Total Amount</p>
                                <p className="text-lg font-bold">{formatCurrency(payment.totalAmount, currencySettings)}</p>
                              </div>
                              {payment.status !== 'PAID' && payment.amountPaid > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Paid</p>
                                  <p className="text-sm font-semibold text-green-600">{formatCurrency(payment.amountPaid, currencySettings)}</p>
                                </div>
                              )}
                              {payment.status !== 'PAID' && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Due</p>
                                  <p className="text-sm font-semibold text-red-600">{formatCurrency(payment.totalAmount - payment.amountPaid, currencySettings)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* All Fees View */}
      {view === 'all' && (
        <div className="space-y-4">
          {/* Filter Tabs */}
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as 'all' | 'pending' | 'paid' | 'overdue')}>
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="all">
                All ({summary.totalFees})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({summary.pendingFees})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Paid ({summary.paidFees})
              </TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({summary.overdueFees})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Payments List */}
          {getFilteredPayments().length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No {filterStatus === 'all' ? '' : filterStatus} fees found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {getFilteredPayments().map((payment) => (
                <Card key={payment.id} className="border-l-4" style={{
                  borderLeftColor: payment.status === 'PAID' ? 'rgb(34 197 94)' : 
                                 payment.status === 'OVERDUE' ? 'rgb(239 68 68)' : 
                                 'rgb(234 179 8)'
                }}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{payment.feeTitle}</h3>
                            <p className="text-sm text-muted-foreground">{payment.feeType}</p>
                            {payment.generatedFor && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Generated for: {payment.generatedFor}
                                {payment.academicYear && ` (${payment.academicYear})`}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>

                        {payment.description && (
                          <p className="text-sm text-muted-foreground">{payment.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Due:</span>
                            <span className="font-medium">{format(new Date(payment.dueDate), 'MMM dd, yyyy')}</span>
                          </div>
                          
                          {payment.paymentDate && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-muted-foreground">Paid:</span>
                              <span className="font-medium">{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                        </div>

                        {(payment.discountApplied || payment.lateFeeApplied) && (
                          <div className="flex flex-wrap gap-3 text-xs">
                            {payment.originalAmount && payment.discountApplied && (
                              <div className="flex items-center gap-1 text-green-600">
                                <span>Original: {formatCurrency(payment.originalAmount, currencySettings)}</span>
                                <span>•</span>
                                <span>Discount: {formatCurrency(payment.discountAmount, currencySettings)}</span>
                              </div>
                            )}
                            {payment.lateFeeApplied && (
                              <div className="flex items-center gap-1 text-red-600">
                                <span>Late Fee: {formatCurrency(payment.lateFeeAmount, currencySettings)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {payment.transactionId && (
                          <div className="text-xs text-muted-foreground">
                            Transaction ID: {payment.transactionId}
                            {payment.paymentMethod && ` • ${payment.paymentMethod}`}
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col items-end gap-2 lg:text-right">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Amount</p>
                          <p className="text-lg font-bold">{formatCurrency(payment.totalAmount, currencySettings)}</p>
                        </div>
                        {payment.status !== 'PAID' && payment.amountPaid > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground">Paid</p>
                            <p className="text-sm font-semibold text-green-600">{formatCurrency(payment.amountPaid, currencySettings)}</p>
                          </div>
                        )}
                        {payment.status !== 'PAID' && (
                          <div>
                            <p className="text-xs text-muted-foreground">Due</p>
                            <p className="text-sm font-semibold text-red-600">{formatCurrency(payment.totalAmount - payment.amountPaid, currencySettings)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
