"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  ArrowLeft,
  Save,
  User,
  Users,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

type FormData = {
  // Student Information
  studentFirstName: string
  studentLastName: string
  studentDateOfBirth: string
  studentGender: string
  studentGrade: string
  
  // Parent/Guardian Information
  parentFirstName: string
  parentLastName: string
  parentEmail: string
  parentPhone: string
  parentAddress: string
  parentOccupation: string
  
  // Previous School Information
  previousSchool: string
  previousGrade: string
  reasonForTransfer: string
  
  // Additional Information
  medicalConditions: string
  extracurriculars: string
  specialNeeds: string
}

export default function NewAdmissionApplicationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    studentFirstName: '',
    studentLastName: '',
    studentDateOfBirth: '',
    studentGender: '',
    studentGrade: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentAddress: '',
    parentOccupation: '',
    previousSchool: '',
    previousGrade: '',
    reasonForTransfer: '',
    medicalConditions: '',
    extracurriculars: '',
    specialNeeds: ''
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const requiredFields = [
      'studentFirstName',
      'studentLastName', 
      'studentDateOfBirth',
      'studentGender',
      'studentGrade',
      'parentFirstName',
      'parentLastName',
      'parentEmail',
      'parentPhone',
      'parentAddress'
    ]

    for (const field of requiredFields) {
      if (!formData[field as keyof FormData]) {
        toast.error("Missing required fields", {
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        })
        return false
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.parentEmail)) {
      toast.error("Invalid email format", {
        description: "Please enter a valid email address"
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    const toastId = toast.loading("Creating application...")

    try {
      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create application')
      }

      toast.dismiss(toastId)
      toast.success("Application created successfully!", {
        description: `Application ID: ${result.applicationId}`,
        action: {
          label: "View Application",
          onClick: () => router.push(`/admin/admissions/${result.applicationId}`)
        }
      })

      // Redirect to applications list after a short delay
      setTimeout(() => {
        router.push('/admin/admissions')
      }, 2000)

    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create application'
      toast.error("Creation failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/admissions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              New Admission Application
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create a new admission application for a prospective student
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Creating...' : 'Create Application'}
        </Button>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Student Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentFirstName">First Name *</Label>
                <Input
                  id="studentFirstName"
                  value={formData.studentFirstName}
                  onChange={(e) => handleInputChange('studentFirstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="studentLastName">Last Name *</Label>
                <Input
                  id="studentLastName"
                  value={formData.studentLastName}
                  onChange={(e) => handleInputChange('studentLastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentDateOfBirth">Date of Birth *</Label>
                <Input
                  id="studentDateOfBirth"
                  type="date"
                  value={formData.studentDateOfBirth}
                  onChange={(e) => handleInputChange('studentDateOfBirth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="studentGender">Gender *</Label>
                <select 
                  id="studentGender"
                  className="w-full p-2 border rounded-md"
                  value={formData.studentGender}
                  onChange={(e) => handleInputChange('studentGender', e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="studentGrade">Applying for Grade *</Label>
              <select 
                id="studentGrade"
                className="w-full p-2 border rounded-md"
                value={formData.studentGrade}
                onChange={(e) => handleInputChange('studentGrade', e.target.value)}
              >
                <option value="">Select grade</option>
                <option value="pre-k">Pre-K</option>
                <option value="kindergarten">Kindergarten</option>
                {Array.from({length: 12}, (_, i) => (
                  <option key={i + 1} value={`grade-${i + 1}`}>
                    Grade {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Parent/Guardian Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentFirstName">First Name *</Label>
                <Input
                  id="parentFirstName"
                  value={formData.parentFirstName}
                  onChange={(e) => handleInputChange('parentFirstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="parentLastName">Last Name *</Label>
                <Input
                  id="parentLastName"
                  value={formData.parentLastName}
                  onChange={(e) => handleInputChange('parentLastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="parentEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="parentPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="parentAddress" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Home Address *
                </Label>
                <Textarea
                  id="parentAddress"
                  value={formData.parentAddress}
                  onChange={(e) => handleInputChange('parentAddress', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="parentOccupation" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Occupation
                </Label>
                <Input
                  id="parentOccupation"
                  value={formData.parentOccupation}
                  onChange={(e) => handleInputChange('parentOccupation', e.target.value)}
                  placeholder="Enter occupation"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Academic History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="previousSchool">Previous School</Label>
              <Input
                id="previousSchool"
                value={formData.previousSchool}
                onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                placeholder="Enter previous school name"
              />
            </div>

            <div>
              <Label htmlFor="previousGrade">Last Grade Completed</Label>
              <Input
                id="previousGrade"
                value={formData.previousGrade}
                onChange={(e) => handleInputChange('previousGrade', e.target.value)}
                placeholder="Enter last completed grade"
              />
            </div>

            <div>
              <Label htmlFor="reasonForTransfer">Reason for Transfer</Label>
              <Textarea
                id="reasonForTransfer"
                value={formData.reasonForTransfer}
                onChange={(e) => handleInputChange('reasonForTransfer', e.target.value)}
                placeholder="Please explain the reason for transferring schools"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="extracurriculars">Extracurricular Activities</Label>
              <Textarea
                id="extracurriculars"
                value={formData.extracurriculars}
                onChange={(e) => handleInputChange('extracurriculars', e.target.value)}
                placeholder="List any sports, clubs, or activities"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Textarea
                id="medicalConditions"
                value={formData.medicalConditions}
                onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                placeholder="Please describe any medical conditions or allergies"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="specialNeeds">Special Needs</Label>
              <Textarea
                id="specialNeeds"
                value={formData.specialNeeds}
                onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                placeholder="Please describe any special learning needs"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/admin/admissions">Cancel</Link>
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Creating Application...' : 'Create Application'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
