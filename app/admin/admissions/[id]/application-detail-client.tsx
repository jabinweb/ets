"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  User,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Download,
  Edit,
  AlertCircle,
  School,
  Heart,
  RefreshCw,
  Briefcase,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import { ApplicationStatus, DocumentStatus } from '@prisma/client'
import { format } from 'date-fns'

interface ApplicationData {
  id: string
  applicationId: string
  selectedProgram: string | null
  studentFirstName: string
  studentMiddleName: string | null
  studentLastName: string
  studentDateOfBirth: Date
  studentGender: string
  studentGrade: string
  maritalStatus: string | null
  nationality: string | null
  email: string | null
  alternateEmail: string | null
  phone: string | null
  whatsappNumber: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null

  // Educational Background
  education: any

  // Parent/Guardian (Legacy/Additional)
  parentFirstName: string | null
  parentLastName: string | null
  parentEmail: string | null
  parentPhone: string | null
  parentAddress: string | null
  parentOccupation: string | null

  // Spiritual Background
  testimony: string | null
  baptismDate: Date | null
  baptismChurch: string | null
  statementOfFaith: string | null

  // Church/Ministry
  currentChurch: string | null
  churchAddress: string | null
  churchDenomination: string | null
  membershipDate: Date | null
  pastorName: string | null
  pastorEmail: string | null
  pastorPhone: string | null
  ministryPositions: any

  // Calling/Goals
  reasonForSeminary: string | null
  futureMinistryGoals: string | null

  // References
  references: any

  // Emergency/Health
  emergencyContactName: string | null
  emergencyContactRelationship: string | null
  emergencyContactPhone: string | null
  healthConditions: string | null
  howDidYouHear: string | null

  // Payment
  paymentMade: boolean
  paymentScreenshotUrl: string | null

  // Documents (URLs)
  transcriptUrl: string | null
  passportPhotoUrl: string | null
  recommendationLetter1Url: string | null
  recommendationLetter2Url: string | null

  status: ApplicationStatus
  submittedAt: Date
  documents: Array<{
    id: string
    applicationId: string
    documentType: string
    fileName: string
    fileUrl: string
    status: DocumentStatus
    uploadedAt: Date
    reviewedAt: Date | null
  }>
  timeline: Array<{
    id: string
    applicationId: string
    status: string
    description: string
    completed: boolean
    createdAt: Date
  }>
}

interface Props {
  application: ApplicationData
}

function getStatusColor(status: ApplicationStatus) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    case 'ACCEPTED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'WAITLISTED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getDocumentStatusColor(status: DocumentStatus) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WAITLISTED', label: 'Waitlisted' }
]

export function ApplicationDetailClient({ application: initialApplication }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState(initialApplication)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/admissions/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        setApplication({ ...application, status: newStatus as ApplicationStatus })
        toast({
          title: "Success",
          description: "Application status updated successfully"
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/admissions">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
          </Link>
        </div>

        {/* Application Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {application.studentFirstName} {application.studentLastName}
                  </h1>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Application ID: {application.applicationId}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Status Change Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    Change Status:
                  </span>
                  <Select
                    value={application.status}
                    onValueChange={handleStatusChange}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full">
                      {isUpdating && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Grade</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{application.studentGrade}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Submitted</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {format(new Date(application.submittedAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Documents</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {application.documents.length} uploaded
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="student" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 overflow-x-auto gap-1">
            <TabsTrigger value="student">
              <User className="h-4 w-4 mr-2" />
              Student
            </TabsTrigger>
            <TabsTrigger value="parent">
              <User className="h-4 w-4 mr-2" />
              Family
            </TabsTrigger>
            <TabsTrigger value="spiritual">
              <Heart className="h-4 w-4 mr-2" />
              Spiritual
            </TabsTrigger>
            <TabsTrigger value="ministry">
              <Briefcase className="h-4 w-4 mr-2" />
              Ministry
            </TabsTrigger>
            <TabsTrigger value="academic">
              <GraduationCap className="h-4 w-4 mr-2" />
              Academic
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="references">
              <Users className="h-4 w-4 mr-2" />
              References
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Student Information Tab */}
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Comprehensive details of the applicant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-slate-500">Full Name</Label>
                    <p className="font-bold text-lg">{application.studentFirstName} {application.studentMiddleName && `${application.studentMiddleName} `}{application.studentLastName}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Applying for</Label>
                    <p className="font-bold text-primary">{application.selectedProgram}</p>
                  </div>
                  <div>
                    <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                  </div>

                  <div className="pt-4 border-t lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-500">Date of Birth</Label>
                      <p className="font-medium">{format(new Date(application.studentDateOfBirth), 'MMMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Gender</Label>
                      <p className="font-medium">{application.studentGender}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Marital Status</Label>
                      <p className="font-medium">{application.maritalStatus}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Nationality</Label>
                      <p className="font-medium">{application.nationality}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">Intended Grade</Label>
                      <p className="font-medium">{application.studentGrade}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-500"><Mail className="w-3 h-3 inline mr-1" /> Primary Email</Label>
                      <p className="font-medium text-blue-600">{application.email}</p>
                    </div>
                    {application.alternateEmail && (
                      <div>
                        <Label className="text-slate-500">Alternate Email</Label>
                        <p className="font-medium">{application.alternateEmail}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-slate-500"><Phone className="w-3 h-3 inline mr-1" /> Phone</Label>
                      <p className="font-medium text-green-600">{application.phone}</p>
                    </div>
                    <div>
                      <Label className="text-slate-500">WhatsApp</Label>
                      <p className="font-medium">{application.whatsappNumber}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t lg:col-span-3">
                    <Label className="text-slate-500"><MapPin className="w-3 h-3 inline mr-1" /> Residential Address</Label>
                    <p className="font-medium mt-1">{application.address}</p>
                    <p className="text-slate-600 font-medium">{application.city}, {application.state} {application.postalCode}</p>
                    <p className="text-slate-600 font-bold">{application.country}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parent Information Tab */}
          <TabsContent value="parent">
            <Card>
              <CardHeader>
                <CardTitle>Family & Emergency Contact</CardTitle>
                <CardDescription>Emergency contact and family background</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-bold border-b pb-2">Primary Emergency Contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-500">Contact Name</Label>
                        <p className="font-medium">{application.emergencyContactName || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-slate-500">Relationship</Label>
                        <p className="font-medium">{application.emergencyContactRelationship || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm text-slate-500">Phone</Label>
                        <p className="font-medium">{application.emergencyContactPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-bold border-b pb-2">Parent/Guardian Info</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-slate-500">Name</Label>
                        <p className="font-medium">{application.parentFirstName} {application.parentLastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-slate-500">Occupation</Label>
                        <p className="font-medium">{application.parentOccupation || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm text-slate-500">Email/Phone</Label>
                        <p className="font-medium">{application.parentEmail} / {application.parentPhone}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm text-slate-500">Address</Label>
                        <p className="font-medium">{application.parentAddress || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <h4 className="font-bold border-b pb-2">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200">
                        <Label className="text-sm font-bold text-yellow-800">Health Conditions</Label>
                        <p className="mt-1 text-yellow-900">{application.healthConditions || 'None reported'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-slate-500">How they heard about us</Label>
                        <p className="font-medium">{application.howDidYouHear || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spiritual Information Tab */}
          <TabsContent value="spiritual">
            <Card>
              <CardHeader>
                <CardTitle>Spiritual Background & Testimony</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm text-slate-500">Baptism Date</Label>
                    <p className="font-medium">{application.baptismDate ? format(new Date(application.baptismDate), 'MMM dd, yyyy') : 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm text-slate-500">Baptism Church</Label>
                    <p className="font-medium">{application.baptismChurch || 'Not provided'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <Label className="text-sm font-bold block mb-2">Personal Testimony</Label>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {application.testimony}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <Label className="text-sm font-bold block mb-2">Statement of Faith</Label>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {application.statementOfFaith}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ministry Tab */}
          <TabsContent value="ministry">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ministry Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Array.isArray(application.ministryPositions) ? (
                        application.ministryPositions.map((pos: any, idx: number) => (
                          <div key={idx} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h5 className="font-bold text-lg">{pos.position}</h5>
                                <p className="text-primary font-medium">{pos.organization}</p>
                              </div>
                              <Badge variant="outline">{pos.startDate} - {pos.isCurrent ? 'Present' : pos.endDate}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                              Responsibilities:
                            </p>
                            <p className="text-sm mt-1">{pos.responsibilities}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 italic">No ministry positions recorded.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Calling & Future Goals</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-sm font-bold block mb-2">Reason for Seminary</Label>
                      <p className="text-sm p-4 bg-slate-50 rounded border">{application.reasonForSeminary}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-bold block mb-2">Future Ministry Goals</Label>
                      <p className="text-sm p-4 bg-slate-50 rounded border">{application.futureMinistryGoals}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Church Affiliation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm">
                  <div>
                    <Label className="text-slate-500">Current Church</Label>
                    <p className="font-bold text-base">{application.currentChurch}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Denomination</Label>
                    <p className="font-medium">{application.churchDenomination}</p>
                  </div>
                  <div>
                    <Label className="text-slate-500">Church Address</Label>
                    <p className="font-medium italic">{application.churchAddress}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <Label className="text-slate-500">Pastor Details</Label>
                    <p className="font-bold mt-1">{application.pastorName}</p>
                    <p className="text-slate-600">{application.pastorEmail}</p>
                    <p className="text-slate-600">{application.pastorPhone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Academic Information Tab */}
          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Background</CardTitle>
                <CardDescription>Previous education and qualifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Array.isArray(application.education) ? (
                    application.education.map((edu: any, idx: number) => (
                      <div key={idx} className="flex gap-4 p-4 border rounded-lg hover:border-blue-300 transition-all">
                        <div className="h-10 w-10 bg-blue-50 flex items-center justify-center rounded-lg">
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{edu.degree} - {edu.fieldOfStudy}</h4>
                          <p className="font-semibold text-slate-700">{edu.institution}</p>
                          <div className="flex gap-4 mt-1 text-sm text-slate-500">
                            <span>Graduation: {edu.graduationYear}</span>
                            {edu.gpaOrPercentage && <span>Result: {edu.gpaOrPercentage}</span>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-slate-400">Educational details not available.</p>
                  )}

                  {application.transcriptUrl && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-lg flex items-center justify-between border">
                      <div className="flex items-center gap-3">
                        <FileText className="text-slate-400" />
                        <span>Official Transcript Record</span>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.transcriptUrl} target="_blank">View File</a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* References Tab */}
          <TabsContent value="references">
            <Card>
              <CardHeader>
                <CardTitle>Professional & Spiritual References</CardTitle>
                <CardDescription>Endorsements and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.isArray(application.references) ? (
                    application.references.map((ref: any, idx: number) => (
                      <div key={idx} className="p-6 border rounded-xl bg-slate-50 dark:bg-slate-800 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-xl">{ref.name}</h4>
                          <Badge variant="secondary">{ref.relationship}</Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="font-bold text-primary">{ref.title} at {ref.organization}</p>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" /> {ref.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" /> {ref.phone}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="italic text-slate-400 col-span-2">References not available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Application Documents</CardTitle>
                <CardDescription>
                  {application.documents.length} document(s) uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {application.documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {application.documents.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {doc.documentType}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {doc.fileName}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                              Uploaded: {format(new Date(doc.uploadedAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getDocumentStatusColor(doc.status)}>
                            {doc.status}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
                <CardDescription>
                  Track the progress of this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {application.timeline.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No timeline events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {application.timeline.map((event: any, index: number) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${event.completed
                            ? 'bg-green-100 dark:bg-green-900/20'
                            : 'bg-slate-100 dark:bg-slate-800'
                            }`}>
                            {event.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Clock className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          {index < application.timeline.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 min-h-[40px]" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {event.status}
                            </h4>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Label({ className, children, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  )
}
