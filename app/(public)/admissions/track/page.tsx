"use client"

import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHero } from '@/components/ui/page-hero'
import { fadeInUp } from '@/lib/motion'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  User, Search
} from 'lucide-react'

type ApplicationStatus = 'pending' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected' | 'waitlisted'

type ApplicationData = {
  applicationId: string
  studentName: string
  grade: string
  submittedDate: string
  status: ApplicationStatus
  lastUpdate: string
  nextStep: string
  documents: {
    name: string
    status: 'pending' | 'approved' | 'rejected'
  }[]
  timeline: {
    date: string
    status: string
    description: string
    completed: boolean
  }[]
}

export default function TrackApplicationPage() {
  const [applicationId, setApplicationId] = useState('')
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!applicationId.trim()) {
      toast.error("Application ID required", {
        description: "Please enter an application ID to search"
      })
      setError('Please enter an application ID')
      return
    }

    setLoading(true)
    setError('')
    
    const toastId = toast.loading("Searching for your application...")
    
    try {
      const response = await fetch(`/api/admissions?applicationId=${encodeURIComponent(applicationId)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Application not found')
      }

      if (result.success && result.data) {
        setApplicationData(result.data)
        toast.dismiss(toastId)
        toast.success("Application found!", {
          description: "Your application details have been loaded"
        })
      } else {
        throw new Error('Application not found')
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Application not found'
      toast.dismiss(toastId)
      toast.error("Application not found", {
        description: errorMessage
      })
      setError(errorMessage)
      setApplicationData(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'waitlisted': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending': return 'Pending Review'
      case 'under_review': return 'Under Review'
      case 'interview_scheduled': return 'Interview Scheduled'
      case 'accepted': return 'Accepted'
      case 'rejected': return 'Not Accepted'
      case 'waitlisted': return 'Waitlisted'
      default: return status
    }
  }

  return (
    <div className="min-h-screen">
      <PageHero
        title="Track Your Application"
        description="Check the status of your admission application and next steps"
        badge={{
          icon: Search,
          text: "Application Status"
        }}
        gradient="blue"
      />

      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Search Section */}
            <Card className="p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Enter Application ID</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Enter your application ID to track the status of your admission application
                </p>
              </div>
              
              <div className="flex gap-4 max-w-md mx-auto">
                <Input
                  placeholder="e.g., APP-2024-001234"
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Track'}
                </Button>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-center">
                  {error}
                </div>
              )}
            </Card>

            {/* Application Details */}
            {applicationData && (
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {/* Status Overview */}
                <Card className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Application Status</h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Application ID: {applicationData.applicationId}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(applicationData.status)} text-sm px-4 py-2`}>
                      {getStatusText(applicationData.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Student</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {applicationData.studentName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Submitted</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(applicationData.submittedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Last Update</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(applicationData.lastUpdate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {applicationData.nextStep && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-900">Next Step</div>
                          <div className="text-blue-700">{applicationData.nextStep}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Timeline */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-6">Application Timeline</h3>
                  <div className="space-y-4">
                    {applicationData.timeline.map((event, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          event.completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {event.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${event.completed ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                              {event.status}
                            </h4>
                            <span className="text-sm text-slate-500">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className={`text-sm ${event.completed ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400'}`}>
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Documents Status */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-6">Documents Status</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {applicationData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {doc.status === 'approved' ? 'Approved' : doc.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Contact Information */}
                <Card className="p-6 bg-slate-50 dark:bg-slate-800">
                  <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    If you have questions about your application, please contact our admissions office:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>admissions@greenwoodhigh.edu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>(555) 123-4570</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
