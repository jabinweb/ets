"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Save,
  User,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import Link from 'next/link'

interface TeacherFormData {
  name: string
  email: string
  phone: string
  address: string
  qualification: string
  experience: string
  specialization: string
  dateOfJoining: string
  salary: string
  emergencyContact: string
  subjectIds: string[]
  bio: string
}

interface Subject {
  id: string
  name: string
  code: string
}

export default function AddTeacherPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    experience: '',
    specialization: '',
    dateOfJoining: '',
    salary: '',
    emergencyContact: '',
    subjectIds: [],
    bio: ''
  })

    const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/subjects')
      const result = await response.json()
      
      if (result.success) {
        setSubjects(result.data || [])
      } else {
        toast.error("Failed to load subjects", {
          description: result.error || "Could not fetch subjects"
        })
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error("Failed to load subjects", {
        description: "Please try again later"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])



  const handleInputChange = (field: keyof TeacherFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId]
    }))
  }

  const validateForm = (): boolean => {
    const requiredFields = ['name', 'email', 'phone', 'qualification', 'dateOfJoining']
    
    for (const field of requiredFields) {
      if (!formData[field as keyof TeacherFormData]) {
        toast.error("Missing required fields", {
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        })
        return false
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email format", {
        description: "Please enter a valid email address"
      })
      return false
    }

    // Experience validation (should be a number)
    if (formData.experience && isNaN(Number(formData.experience))) {
      toast.error("Invalid experience", {
        description: "Experience should be a number (years)"
      })
      return false
    }

    // Salary validation (should be a number)
    if (formData.salary && isNaN(Number(formData.salary))) {
      toast.error("Invalid salary", {
        description: "Salary should be a valid number"
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    const toastId = toast.loading("Creating teacher profile...")

    try {
      const response = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          experience: formData.experience ? Number(formData.experience) : 0,
          salary: formData.salary ? Number(formData.salary) : null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Teacher created successfully!", {
          description: `${formData.name} has been added to the system`
        })
        
        router.push('/admin/teachers')
      } else {
        throw new Error(result.error || 'Failed to create teacher')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create teacher'
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
            <Link href="/admin/teachers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teachers
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Add New Teacher
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create a new teacher profile with personal and professional details
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter teacher's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      placeholder="Emergency contact number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualification">Qualification *</Label>
                    <Input
                      id="qualification"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      placeholder="e.g., M.Ed, B.Sc, Ph.D"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="e.g., Mathematics, Science"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience (Years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="Years of teaching experience"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfJoining">Date of Joining *</Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => handleInputChange('dateOfJoining', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary (Optional)</Label>
                    <Input
                      id="salary"
                      type="number"
                      min="0"
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      placeholder="Monthly salary amount"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio / Description</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Brief description about the teacher"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject Assignment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Subject Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading subjects...</p>
                  </div>
                ) : subjects.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No subjects available. Please create subjects first before assigning them to teachers.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Select the subjects this teacher will be responsible for:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {subjects.map((subject) => (
                        <div
                          key={subject.id}
                          onClick={() => handleSubjectToggle(subject.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            formData.subjectIds.includes(subject.id)
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{subject.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                Code: {subject.code}
                              </div>
                            </div>
                            {formData.subjectIds.includes(subject.id) && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Subjects Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.subjectIds.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No subjects selected
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.subjectIds.map((subjectId) => {
                      const subject = subjects.find(s => s.id === subjectId)
                      return subject ? (
                        <div key={subjectId} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                          <span className="text-sm font-medium">{subject.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSubjectToggle(subjectId)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{formData.name || 'Name not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{formData.email || 'Email not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  <span>{formData.qualification || 'Qualification not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>
                    {formData.dateOfJoining 
                      ? new Date(formData.dateOfJoining).toLocaleDateString()
                      : 'Joining date not set'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span>{formData.subjectIds.length} subjects assigned</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent className="p-6">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Creating Teacher...' : 'Create Teacher Profile'}
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  * Required fields must be filled
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
