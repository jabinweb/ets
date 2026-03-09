"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Calendar, GraduationCap, FileText } from 'lucide-react'
import Link from 'next/link'

interface ExamFormData {
  title: string
  description: string
  type: string
  classId: string
  subjectId: string
  date: string
  startTime: string
  endTime: string
  duration: string
  totalMarks: string
  passMarks: string
}

interface Class {
  id: string
  name: string
  grade: number
  section: string
}

interface Subject {
  id: string
  name: string
  code: string
}

export default function NewExamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [formData, setFormData] = useState<ExamFormData>({
    title: '',
    description: '',
    type: '',
    classId: '',
    subjectId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: '',
    totalMarks: '',
    passMarks: ''
  })

  const examTypes = [
    { value: 'QUIZ', label: 'Quiz' },
    { value: 'MIDTERM', label: 'Midterm Exam' },
    { value: 'FINAL', label: 'Final Exam' },
    { value: 'ASSIGNMENT', label: 'Assignment' },
    { value: 'PROJECT', label: 'Project' }
  ]

  useEffect(() => {
    fetchClasses()
    fetchSubjects()
  }, [])

  useEffect(() => {
    // Calculate duration when start and end times change
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(`2000-01-01T${formData.endTime}`)
      const diffMs = end.getTime() - start.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      
      if (diffMinutes > 0) {
        setFormData(prev => ({ ...prev, duration: diffMinutes.toString() }))
      }
    }
  }, [formData.startTime, formData.endTime])

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/admin/classes')
      const result = await response.json()
      if (result.success) {
        setClasses(result.data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/admin/subjects')
      const result = await response.json()
      if (result.success) {
        setSubjects(result.data)
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const handleInputChange = (field: keyof ExamFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    const requiredFields = ['title', 'type', 'classId', 'subjectId', 'date', 'startTime', 'totalMarks', 'passMarks']
    
    for (const field of requiredFields) {
      if (!formData[field as keyof ExamFormData]) {
        toast.error("Missing required fields", {
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        })
        return false
      }
    }

    const totalMarks = parseInt(formData.totalMarks)
    const passMarks = parseInt(formData.passMarks)

    if (totalMarks <= 0) {
      toast.error("Invalid total marks", {
        description: "Total marks must be greater than 0"
      })
      return false
    }

    if (passMarks < 0 || passMarks > totalMarks) {
      toast.error("Invalid pass marks", {
        description: "Pass marks must be between 0 and total marks"
      })
      return false
    }

    const examDate = new Date(formData.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (examDate < today) {
      toast.error("Invalid exam date", {
        description: "Exam date cannot be in the past"
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    const toastId = toast.loading("Creating exam...")

    try {
      const examData = {
        ...formData,
        duration: parseInt(formData.duration) || 60,
        totalMarks: parseInt(formData.totalMarks),
        passMarks: parseInt(formData.passMarks),
        date: new Date(`${formData.date}T${formData.startTime}`).toISOString()
      }

      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Exam created successfully!", {
          description: `${formData.title} has been scheduled`
        })
        router.push('/admin/academics/exams')
      } else {
        throw new Error(result.error || 'Failed to create exam')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create exam'
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
            <Link href="/admin/academics/exams">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Create New Exam
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Schedule a new exam for students
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exam Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter exam title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Exam Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="class">Class *</Label>
                  <Select value={formData.classId} onValueChange={(value) => handleInputChange('classId', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - Grade {cls.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subjectId} onValueChange={(value) => handleInputChange('subjectId', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter exam description (optional)"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Schedule Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="date">Exam Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="60"
                      min="1"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Grading Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Grading
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalMarks">Total Marks *</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                      placeholder="100"
                      min="1"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passMarks">Pass Marks *</Label>
                    <Input
                      id="passMarks"
                      type="number"
                      value={formData.passMarks}
                      onChange={(e) => handleInputChange('passMarks', e.target.value)}
                      placeholder="40"
                      min="0"
                      max={formData.totalMarks || undefined}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Creating...' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
