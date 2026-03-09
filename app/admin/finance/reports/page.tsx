"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { formatCurrency, CurrencySettings, DEFAULT_CURRENCY } from '@/lib/currency'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import { 
  TrendingUp, Download, Users, CreditCard, BarChart3, PieChartIcon,
  RefreshCw, AlertCircle, CheckCircle, Clock, } from 'lucide-react'

interface FinanceData {
  revenue: Array<{
    month: string
    tuition: number
    fees: number
    other: number
    total: number
  }>
  expenses: Array<{
    category: string
    amount: number
    percentage: number
    color: string
  }>
  paymentStatus: Array<{
    status: string
    count: number
    amount: number
    color: string
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
  feeTypes: Array<{
    type: string
    collected: number
    pending: number
    total: number
  }>
  classWiseRevenue: Array<{
    class: string
    revenue: number
    students: number
    avgPerStudent: number
  }>
}

export default function FinanceReportsPage() {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('year')
  const [selectedYear, setSelectedYear] = useState('2024')
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

  const fetchFinanceData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/finance/reports?period=${selectedPeriod}&year=${selectedYear}`)
      const result = await response.json()
      
      if (result.success) {
        setFinanceData(result.data)
      } else {
        toast.error("Failed to load finance reports")
      }
    } catch (error) {
      console.error("Error fetching finance data:", error)
      toast.error("Failed to load reports")
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod, selectedYear, toast])

  useEffect(() => {
    fetchFinanceData()
  }, [fetchFinanceData])

  const data = financeData

  // Calculate key metrics
  const totalRevenue = useMemo(() => 
    data?.revenue.reduce((sum, item) => sum + item.total, 0) || 0, [data?.revenue]
  )

  const totalExpenses = useMemo(() => 
    data?.expenses.reduce((sum, item) => sum + item.amount, 0) || 0, [data?.expenses]
  )

  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0'

  const chartConfig = {
    tuition: { label: "Tuition", color: "hsl(var(--chart-1))" },
    fees: { label: "Fees", color: "hsl(var(--chart-2))" },
    other: { label: "Other", color: "hsl(var(--chart-3))" },
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
    expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
    profit: { label: "Profit", color: "hsl(var(--chart-3))" },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500">Loading finance reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Finance Reports
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Comprehensive financial analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchFinanceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue, currencySettings)}
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses, currencySettings)}
            </div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(netProfit, currencySettings)}
            </div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18.7% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {profitMargin}%
            </div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Implementation */}
      {data && (
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.revenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="tuition" stackId="a" fill="var(--color-tuition)" />
                        <Bar dataKey="fees" stackId="a" fill="var(--color-fees)" />
                        <Bar dataKey="other" stackId="a" fill="var(--color-other)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Fee Collection Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.feeTypes.map((fee, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{fee.type}</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {formatCurrency(fee.collected, currencySettings)} / {formatCurrency(fee.total, currencySettings)}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(fee.collected / fee.total) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{Math.round((fee.collected / fee.total) * 100)}% collected</span>
                          <span>{formatCurrency(fee.pending, currencySettings)} pending</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Breakdown Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Expense Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.expenses}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name} ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {data.expenses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Expense Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.expenses.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: expense.color }}
                          />
                          <div>
                            <div className="font-medium">{expense.category}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {expense.percentage}% of total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(expense.amount, currencySettings)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue vs Expenses vs Profit Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="var(--color-revenue)" 
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="var(--color-expenses)" 
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="var(--color-profit)" 
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.paymentStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="amount"
                        >
                          {data.paymentStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.paymentStatus.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {payment.status === 'Paid' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {payment.status === 'Pending' && <Clock className="h-5 w-5 text-yellow-600" />}
                          {payment.status === 'Overdue' && <AlertCircle className="h-5 w-5 text-red-600" />}
                          {payment.status === 'Partial' && <Clock className="h-5 w-5 text-blue-600" />}
                          <div>
                            <div className="font-medium">{payment.status}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {payment.count} payments
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(payment.amount, currencySettings)}</div>
                          <Badge 
                            variant="outline"
                            className="text-xs"
                            style={{ color: payment.color, borderColor: payment.color }}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Class-wise Revenue Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.classWiseRevenue} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="class" type="category" width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.classWiseRevenue.slice(0, 3).map((classData, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{classData.class}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Total Revenue</span>
                        <span className="font-bold">{formatCurrency(classData.revenue, currencySettings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Students</span>
                        <span className="font-bold">{classData.students}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Avg per Student</span>
                        <span className="font-bold">{formatCurrency(classData.avgPerStudent, currencySettings)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
                         