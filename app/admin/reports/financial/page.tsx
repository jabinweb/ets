"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  DollarSign,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  PieChart
} from 'lucide-react'

interface FinancialStats {
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  outstandingFees: number
  collectionRate: number
}

interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  collections: number
  outstanding: number
}

interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

export default function FinancialReportsPage() {
  const [period, setPeriod] = useState('current-month')
  const [reportType, setReportType] = useState('summary')
  const [loading, setLoading] = useState(false)

  const stats: FinancialStats = {
    totalRevenue: 2458000,
    totalExpenses: 1892000,
    netIncome: 566000,
    outstandingFees: 385000,
    collectionRate: 86.4
  }

  const monthlyData: MonthlyData[] = [
    { month: 'January', revenue: 410000, expenses: 315000, collections: 395000, outstanding: 45000 },
    { month: 'February', revenue: 405000, expenses: 298000, collections: 388000, outstanding: 52000 },
    { month: 'March', revenue: 425000, expenses: 325000, collections: 410000, outstanding: 48000 },
    { month: 'April', revenue: 418000, expenses: 312000, collections: 402000, outstanding: 51000 },
    { month: 'May', revenue: 420000, expenses: 320000, collections: 405000, outstanding: 49000 },
    { month: 'June', revenue: 380000, expenses: 322000, collections: 365000, outstanding: 67000 }
  ]

  const revenueBreakdown: CategoryBreakdown[] = [
    { category: 'Tuition Fees', amount: 1850000, percentage: 75.2, trend: 'up' },
    { category: 'Admission Fees', amount: 285000, percentage: 11.6, trend: 'stable' },
    { category: 'Exam Fees', amount: 165000, percentage: 6.7, trend: 'up' },
    { category: 'Transport Fees', amount: 95000, percentage: 3.9, trend: 'down' },
    { category: 'Other Fees', amount: 63000, percentage: 2.6, trend: 'stable' }
  ]

  const expenseBreakdown: CategoryBreakdown[] = [
    { category: 'Salaries & Benefits', amount: 1245000, percentage: 65.8, trend: 'up' },
    { category: 'Infrastructure', amount: 285000, percentage: 15.1, trend: 'down' },
    { category: 'Utilities', amount: 155000, percentage: 8.2, trend: 'stable' },
    { category: 'Supplies', amount: 125000, percentage: 6.6, trend: 'up' },
    { category: 'Other Expenses', amount: 82000, percentage: 4.3, trend: 'stable' }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleExportReport = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Financial report exported successfully!')
    }, 1500)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Financial Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Revenue, expenses, and financial analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button onClick={handleExportReport} disabled={loading} className="gap-2">
            <Download className="h-4 w-4" />
            {loading ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Time Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="forecast">Forecast</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Currency</Label>
              <Select defaultValue="INR">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.2% vs last period
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(stats.totalExpenses)}
                </p>
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +3.5% vs last period
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Net Income
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(stats.netIncome)}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15.8% vs last period
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Outstanding Fees
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(stats.outstandingFees)}
                </p>
                <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pending collection
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Collection Rate
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {stats.collectionRate}%
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Above target
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Financial Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Expenses
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Collections
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Outstanding
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((data, index) => (
                  <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {data.month}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      {formatCurrency(data.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      {formatCurrency(data.expenses)}
                    </td>
                    <td className="py-3 px-4 text-right text-blue-600 font-medium">
                      {formatCurrency(data.collections)}
                    </td>
                    <td className="py-3 px-4 text-right text-yellow-600 font-medium">
                      {formatCurrency(data.outstanding)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(data.revenue - data.expenses)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.category}
                      </span>
                      <span className="text-sm text-slate-500">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                    {getTrendIcon(item.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.category}
                      </span>
                      <span className="text-sm text-slate-500">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                    {getTrendIcon(item.trend)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
