"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  Filter,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  Save,
  X,
  AlertCircle,
} from 'lucide-react'

interface Subject {
  id: string
  name: string
  code: string
  description: string
  credits: number
  createdAt: string
  updatedAt: string
  _count?: {
    classes: number
    teachers: number
  }
}

interface SubjectFormData {
  name: string
  code: string
  description: string
  credits: number
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    description: '',
    credits: 1
  })
  const { toast } = useToast()

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/subjects')
      const result = await response.json()
      
      if (result.success) {
        setSubjects(result.data)
      } else {
        toast.error("Failed to load subjects", {
          description: result.error || "Something went wrong"
        })
      }
    } catch {
      toast.error("Failed to load subjects", {
        description: "Please check your connection and try again"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle form input changes
  const handleInputChange = (field: keyof SubjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      credits: 1
    })
    setEditingSubject(null)
    setShowForm(false)
  }

  // Handle create/edit
  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Missing required fields", {
        description: "Please fill in subject name and code"
      })
      return
    }

    if (formData.credits < 1 || formData.credits > 10) {
      toast.error("Invalid credits", {
        description: "Credits must be between 1 and 10"
      })
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading(editingSubject ? "Updating subject..." : "Creating subject...")

    try {
      const method = editingSubject ? 'PUT' : 'POST'
      const url = editingSubject ? `/api/admin/subjects/${editingSubject.id}` : '/api/admin/subjects'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success(editingSubject ? "Subject updated!" : "Subject created!", {
          description: `${formData.name} has been ${editingSubject ? 'updated' : 'added'} successfully`
        })
        
        resetForm()
        fetchSubjects()
      } else {
        throw new Error(result.error || 'Operation failed')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Operation failed'
      toast.error(editingSubject ? "Update failed" : "Creation failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit
  const handleEdit = (subject: Subject) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      credits: subject.credits
    })
    setEditingSubject(subject)
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      return
    }

    const toastId = toast.loading("Deleting subject...")

    try {
      const response = await fetch(`/api/admin/subjects/${subject.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Subject deleted!", {
          description: `${subject.name} has been removed from the system`
        })
        fetchSubjects()
      } else {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Delete failed'
      toast.error("Delete failed", {
        description: errorMessage
      })
    }
  }

  const stats = {
    total: subjects.length,
    highCredit: subjects.filter(s => s.credits >= 4).length,
    lowCredit: subjects.filter(s => s.credits <= 2).length,
    averageCredits: subjects.length > 0 ? Math.round((subjects.reduce((sum, s) => sum + s.credits, 0) / subjects.length) * 10) / 10 : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Subject Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage academic subjects and their configurations
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              High Credit (4+)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.highCredit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Low Credit (1-2)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.lowCredit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.averageCredits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Mathematics"
                />
              </div>
              
              <div>
                <Label htmlFor="code">Subject Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  placeholder="e.g., MATH"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              
              <div>
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the subject"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search subjects by name, code, or description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Credits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      <Card>
        <CardHeader>
          <CardTitle>All Subjects ({filteredSubjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-500">Loading subjects...</p>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{searchTerm ? 'No subjects found matching your search' : 'No subjects found'}</p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Subject
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {subject.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {subject.code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {subject.credits} Credit{subject.credits !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(subject)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(subject)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {subject.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {subject.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {subject._count?.classes || 0} Classes
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">
                          {subject._count?.teachers || 0} Teachers
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      Created {new Date(subject.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Deleting a subject will remove it from all associated classes and teacher assignments. 
          Make sure to reassign classes and teachers before deletion to avoid disruptions.
        </AlertDescription>
      </Alert>
    </div>
  )
}
