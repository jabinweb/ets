"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { FileText, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Subject {
  id: string
  name: string
  code: string
}

interface Class {
  id: string
  name: string
  section: string
  grade: number
}

interface CreateExamDialogProps {
  onExamCreated?: () => void
}

export function CreateExamDialog({ onExamCreated }: CreateExamDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classes, setClasses] = useState<Class[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'QUIZ',
    classId: '',
    subjectId: '',
    date: '',
    time: '',
    duration: 60,
    totalMarks: 100,
    passMarks: 40
  })

  useEffect(() => {
    const fetchTeacherData = async () => {
      setIsFetching(true)
      try {
        const [subjectsRes, classesRes] = await Promise.all([
          fetch('/api/teacher/subjects'),
          fetch('/api/teacher/classes')
        ])

        const [subjectsResult, classesResult] = await Promise.all([
          subjectsRes.json(),
          classesRes.json()
        ])

        if (subjectsResult.success && Array.isArray(subjectsResult.data)) {
          setSubjects(subjectsResult.data)
        } else {
          setSubjects([])
        }
        
        if (classesResult.success) {
          // Handle both formats: array or object with classes property
          const classesData = Array.isArray(classesResult.data) 
            ? classesResult.data 
            : classesResult.data?.classes || []
          
          if (Array.isArray(classesData)) {
            setClasses(classesData)
          } else {
            setClasses([])
          }
        } else {
          setClasses([])
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error)
        setSubjects([])
        setClasses([])
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load classes and subjects'
        })
      } finally {
        setIsFetching(false)
      }
    }

    if (open) {
      fetchTeacherData()
    }
  }, [open, toast])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'QUIZ',
      classId: '',
      subjectId: '',
      date: '',
      time: '',
      duration: 60,
      totalMarks: 100,
      passMarks: 40
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.classId || !formData.subjectId || !formData.date || !formData.time) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields'
      })
      return
    }

    setIsLoading(true)

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`)

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        classId: formData.classId,
        subjectId: formData.subjectId,
        date: dateTime.toISOString(),
        duration: parseInt(formData.duration.toString()),
        totalMarks: parseInt(formData.totalMarks.toString()),
        passMarks: parseInt(formData.passMarks.toString())
      }

      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Exam created successfully'
        })
        resetForm()
        setOpen(false)
        if (onExamCreated) {
          onExamCreated()
        }
      } else {
        throw new Error(result.error || 'Failed to create exam')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create exam'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Exam</DialogTitle>
          <DialogDescription>
            Schedule a new exam or assignment for your class
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Midterm Exam - Algebra"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the exam content..."
                  rows={2}
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUIZ">Quiz</SelectItem>
                      <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                      <SelectItem value="MIDTERM">Midterm</SelectItem>
                      <SelectItem value="FINAL">Final Exam</SelectItem>
                      <SelectItem value="PROJECT">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('duration', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Class and Subject */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select 
                  value={formData.classId} 
                  onValueChange={(value) => handleInputChange('classId', value)}
                  disabled={isFetching || classes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isFetching ? "Loading..." : classes.length === 0 ? "No classes available" : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select 
                  value={formData.subjectId} 
                  onValueChange={(value) => handleInputChange('subjectId', value)}
                  disabled={isFetching || subjects.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isFetching ? "Loading..." : subjects.length === 0 ? "No subjects available" : "Select subject"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Marking */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalMarks">Total Marks *</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min="1"
                  value={formData.totalMarks}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('totalMarks', parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passMarks">Pass Marks *</Label>
                <Input
                  id="passMarks"
                  type="number"
                  min="1"
                  max={formData.totalMarks}
                  value={formData.passMarks}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('passMarks', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Passing percentage: {formData.totalMarks > 0 ? Math.round((formData.passMarks / formData.totalMarks) * 100) : 0}%
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Exam
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
