import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { ApplicationStatus } from '@prisma/client'

async function getAdmissionApplications() {
  try {
    return await prisma.admissionApplication.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        documents: true,
        timeline: true
      }
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return []
  }
}

function getStatusColor(status: ApplicationStatus) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800'
    case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800'
    case 'ACCEPTED': return 'bg-green-100 text-green-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    case 'WAITLISTED': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusIcon(status: ApplicationStatus) {
  switch (status) {
    case 'PENDING': return <Clock className="h-4 w-4" />
    case 'UNDER_REVIEW': return <FileText className="h-4 w-4" />
    case 'INTERVIEW_SCHEDULED': return <Calendar className="h-4 w-4" />
    case 'ACCEPTED': return <CheckCircle className="h-4 w-4" />
    case 'REJECTED': return <XCircle className="h-4 w-4" />
    case 'WAITLISTED': return <Clock className="h-4 w-4" />
    default: return <FileText className="h-4 w-4" />
  }
}

export default async function AdminAdmissionsPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const applications = await getAdmissionApplications()

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'PENDING').length,
    underReview: applications.filter(app => app.status === 'UNDER_REVIEW').length,
    accepted: applications.filter(app => app.status === 'ACCEPTED').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admission Applications
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and review student applications
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/admissions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Under Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
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
                placeholder="Search by name, email, or application ID..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {application.studentFirstName} {application.studentLastName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {application.applicationId}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(application.status)}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{application.status.replace('_', ' ')}</span>
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/admissions/${application.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Grade:</span>
                      <span className="ml-2 font-medium">{application.studentGrade}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Parent:</span>
                      <span className="ml-2 font-medium">{application.parentFirstName} {application.parentLastName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Submitted:</span>
                      <span className="ml-2 font-medium">
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-slate-600 dark:text-slate-400">
                        Documents: {application.documents.length} uploaded
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        Timeline: {application.timeline.length} events
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
