import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  CreditCard,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { PaymentStatus, FeeType } from '@prisma/client'
import { formatCurrency, CurrencySettings, DEFAULT_CURRENCY } from '@/lib/currency'

async function getCurrencySettings(): Promise<CurrencySettings> {
  try {
    const settings = await prisma.schoolSettings.findFirst({
      select: {
        currency: true,
        currencySymbol: true,
        currencyPosition: true,
      }
    })
    
    if (!settings) {
      return DEFAULT_CURRENCY
    }
    
    return {
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      currencyPosition: settings.currencyPosition as 'before' | 'after'
    }
  } catch (error) {
    console.error('Error fetching currency settings:', error)
    return DEFAULT_CURRENCY
  }
}

async function getFinanceData() {
  try {
    const [fees, payments, totalRevenue, pendingAmount] = await Promise.all([
      prisma.fee.findMany({
        include: {
          payments: {
            include: {
              student: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { dueDate: 'desc' }
      }),
      
      prisma.feePayment.findMany({
        where: {
          status: PaymentStatus.PAID,
          paymentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        include: {
          fee: {
            select: {
              title: true,
              type: true
            }
          },
          student: {
            select: {
              name: true
            }
          }
        },
        orderBy: { paymentDate: 'desc' },
        take: 10
      }),
      
      prisma.feePayment.aggregate({
        where: {
          status: PaymentStatus.PAID
        },
        _sum: {
          amountPaid: true
        }
      }),
      
      prisma.feePayment.aggregate({
        where: {
          status: PaymentStatus.PENDING
        },
        _count: {
          id: true
        }
      })
    ])

    return { fees, payments, totalRevenue, pendingAmount }
  } catch (error) {
    console.error('Error fetching finance data:', error)
    return { fees: [], payments: [], totalRevenue: { _sum: { amountPaid: 0 } }, pendingAmount: { _count: { id: 0 } } }
  }
}

function getFeeTypeColor(type: FeeType) {
  switch (type) {
    case 'TUITION': return 'bg-blue-100 text-blue-800'
    case 'LIBRARY': return 'bg-green-100 text-green-800'
    case 'SPORTS': return 'bg-purple-100 text-purple-800'
    case 'TRANSPORT': return 'bg-orange-100 text-orange-800'
    case 'EXAMINATION': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default async function AdminFinancePage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const [{ fees, payments, totalRevenue, pendingAmount }, currencySettings] = await Promise.all([
    getFinanceData(),
    getCurrencySettings()
  ])

  const stats = {
    totalRevenue: Number(totalRevenue._sum.amountPaid || 0),
    totalFees: fees.length,
    pendingPayments: pendingAmount._count.id,
    thisMonthPayments: payments.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Finance Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Track fees, payments, and financial reports
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/finance/reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/finance/fees/new">
              <DollarSign className="h-4 w-4 mr-2" />
              Create Fee
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(stats.totalRevenue, currencySettings)}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              All time collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFees}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.pendingPayments}
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonthPayments}</div>
            <p className="text-xs text-slate-500">
              Successful payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/finance/fees" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="h-5 w-5 mr-2 text-primary" />
                Manage Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Create and manage fee structures
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/finance/payments" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Payment Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                View payment history and status
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/finance/reports" className="block">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Financial Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Generate detailed financial reports
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Active Fees</CardTitle>
          </CardHeader>
          <CardContent>
            {fees.length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No fees created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fees.slice(0, 5).map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {fee.title}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Due: {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(fee.amount.toString(), currencySettings)}
                      </div>
                      <Badge className={getFeeTypeColor(fee.type)}>
                        {fee.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No payments this month</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {payment.student.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {payment.fee.title}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(payment.amountPaid.toString(), currencySettings)}
                      </div>
                      <div className="text-sm text-slate-500">
                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
