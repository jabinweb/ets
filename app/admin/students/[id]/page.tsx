import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  DollarSign,
  Activity,
  Edit,
  Download,
  User,
  UserCircle,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { Role } from '@prisma/client'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getStudent(id: string) {
  try {
    const student = await prisma.user.findUnique({
      where: {
        id,
        role: Role.STUDENT
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        attendanceRecords: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            attendance: {
              select: {
                date: true,
                class: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        examResults: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            exam: {
              select: {
                title: true,
                totalMarks: true,
                date: true,
                subject: {
                  select: {
                    name: true,
                    code: true
                  }
                }
              }
            }
          }
        },
        feePayments: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            fee: {
              select: {
                title: true,
                amount: true,
                dueDate: true
              }
            }
          }
        },
        performanceReports: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        subjectPerformances: {
          orderBy: { updatedAt: 'desc' },
          include: {
            subject: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      }
    })

    return student
  } catch (error) {
    console.error('Error fetching student:', error)
    return null
  }
}

export default async function StudentDetailPage({ params }: PageProps) {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const resolvedParams = await params
  const student = await getStudent(resolvedParams.id)

  if (!student) {
    notFound()
  }

  // Calculate statistics
  const totalAttendance = student.attendanceRecords.length
  const presentCount = student.attendanceRecords.filter(r => r.status === 'PRESENT').length
  const attendancePercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '0'

  const totalExams = student.examResults.length
  const averageMarks = totalExams > 0 
    ? (student.examResults.reduce((sum, result) => sum + Number(result.marksObtained), 0) / totalExams).toFixed(1)
    : '0'

  const totalFees = student.feePayments.reduce((sum, payment) => sum + Number(payment.fee.amount), 0)
  const paidFees = student.feePayments
    .filter(p => p.status === 'PAID')
    .reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/students">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>

        {/* Student Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                <Avatar className="h-32 w-32 ring-4 ring-slate-100 dark:ring-slate-800">
                  <AvatarImage src={student.image || undefined} alt={student.name || 'Student'} />
                  <AvatarFallback className="text-3xl bg-linear-to-br from-primary to-accent text-white">
                    {student.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Student Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {student.name}
                    </h1>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-sm">
                        {student.studentNumber}
                      </Badge>
                      {student.class && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {student.class.name}
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        Student
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {student.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                        <p className="text-sm text-slate-900 dark:text-white truncate">{student.email}</p>
                      </div>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                        <p className="text-sm text-slate-900 dark:text-white">{student.phone}</p>
                      </div>
                    </div>
                  )}
                  {student.dateOfBirth && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Date of Birth</p>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {format(new Date(student.dateOfBirth), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}
                  {student.gender && (
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Gender</p>
                        <p className="text-sm text-slate-900 dark:text-white">{student.gender}</p>
                      </div>
                    </div>
                  )}
                  {student.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                        <p className="text-sm text-slate-900 dark:text-white">{student.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Attendance</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{attendancePercentage}%</p>
                  <p className="text-xs text-slate-500 mt-1">{presentCount} / {totalAttendance} days</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Average Marks</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{averageMarks}</p>
                  <p className="text-xs text-slate-500 mt-1">{totalExams} exams</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Fees Paid</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{paidFees.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">of ₹{totalFees.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Performance</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {student.subjectPerformances.length}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">subjects tracked</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="personal">
              <UserCircle className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="academic">
              <BookOpen className="h-4 w-4 mr-2" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Activity className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="fees">
              <DollarSign className="h-4 w-4 mr-2" />
              Fees
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Parent/Guardian Info */}
                {(student.parentName || student.parentEmail || student.parentPhone) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                      Parent/Guardian Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {student.parentName && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Parent Name</p>
                          <p className="text-base text-slate-900 dark:text-white">{student.parentName}</p>
                        </div>
                      )}
                      {student.parentEmail && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Parent Email</p>
                          <p className="text-base text-slate-900 dark:text-white">{student.parentEmail}</p>
                        </div>
                      )}
                      {student.parentPhone && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Parent Phone</p>
                          <p className="text-base text-slate-900 dark:text-white">{student.parentPhone}</p>
                        </div>
                      )}
                      {student.emergencyContact && (
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Emergency Contact</p>
                          <p className="text-base text-slate-900 dark:text-white">{student.emergencyContact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical & Other Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.medicalInfo && (
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Medical Information</p>
                        <p className="text-base text-slate-900 dark:text-white">{student.medicalInfo}</p>
                      </div>
                    )}
                    {student.previousSchool && (
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Previous School</p>
                        <p className="text-base text-slate-900 dark:text-white">{student.previousSchool}</p>
                      </div>
                    )}
                    {student.class?.teacher && (
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Class Teacher</p>
                        <p className="text-base text-slate-900 dark:text-white">{student.class.teacher.name}</p>
                        <p className="text-sm text-slate-500">{student.class.teacher.email}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Joined On</p>
                      <p className="text-base text-slate-900 dark:text-white">
                        {format(new Date(student.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Tab */}
          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {student.examResults.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No exam results available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {student.examResults.map((result) => (
                      <div 
                        key={result.id}
                        className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {result.exam.title}
                            </h4>
                            {result.exam.subject && (
                              <Badge variant="outline" className="text-xs">
                                {result.exam.subject.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Date: {format(new Date(result.exam.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {Number(result.marksObtained)} / {Number(result.exam.totalMarks)}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {((Number(result.marksObtained) / Number(result.exam.totalMarks)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
              </CardHeader>
              <CardContent>
                {student.attendanceRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No attendance records available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {student.attendanceRecords.map((record) => (
                      <div 
                        key={record.id}
                        className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            record.status === 'PRESENT' 
                              ? 'bg-green-100 dark:bg-green-900/20' 
                              : record.status === 'ABSENT'
                              ? 'bg-red-100 dark:bg-red-900/20'
                              : 'bg-yellow-100 dark:bg-yellow-900/20'
                          }`}>
                            {record.status === 'PRESENT' ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : record.status === 'ABSENT' ? (
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {format(new Date(record.attendance.date), 'EEEE, MMM dd, yyyy')}
                            </p>
                            {record.notes && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">{record.notes}</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={
                          record.status === 'PRESENT' ? 'default' : 
                          record.status === 'ABSENT' ? 'destructive' : 
                          'secondary'
                        }>
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees Tab */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fee Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {student.feePayments.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No fee payment records available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {student.feePayments.map((payment) => (
                      <div 
                        key={payment.id}
                        className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {payment.fee.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span>Amount: ₹{Number(payment.fee.amount).toLocaleString()}</span>
                            <span>Due: {format(new Date(payment.fee.dueDate), 'MMM dd, yyyy')}</span>
                            {payment.paymentDate && (
                              <span>Paid: {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            payment.status === 'PAID' ? 'default' : 
                            payment.status === 'PENDING' ? 'secondary' : 
                            'destructive'
                          }>
                            {payment.status}
                          </Badge>
                          {payment.amountPaid && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              Paid: ₹{Number(payment.amountPaid).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="space-y-6">
              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {student.subjectPerformances.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No performance data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {student.subjectPerformances.map((performance) => (
                        <div 
                          key={performance.id}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-white">
                                {performance.subject.name}
                              </h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {performance.subject.code}
                              </p>
                            </div>
                            {performance.currentGrade && (
                              <Badge className="text-lg px-4 py-1">{performance.currentGrade}</Badge>
                            )}
                          </div>
                          {performance.teacherComments && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                              {performance.teacherComments}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            {performance.currentPercentage !== null && (
                              <span>Score: {Number(performance.currentPercentage).toFixed(1)}%</span>
                            )}
                            <span>Updated: {format(new Date(performance.updatedAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Reports */}
              {student.performanceReports.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {student.performanceReports.map((report) => (
                        <div 
                          key={report.id}
                          className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                                {report.semester} - {report.academicYear}
                              </h4>
                              {report.overallGPA && (
                                <Badge variant="outline">GPA: {Number(report.overallGPA).toFixed(2)}</Badge>
                              )}
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          {report.teacherComments && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                              {report.teacherComments}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
