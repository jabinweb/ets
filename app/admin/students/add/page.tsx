"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { useCSVUpload } from "@/hooks/use-csv-upload"
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  Save,
  Upload,
  Download,
  User,
  Users,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'

interface StudentFormData {
  name: string
  email: string
  studentNumber: string
  dateOfBirth: string
  gender: string
  phone: string
  address: string
  parentName: string
  parentEmail: string
  parentPhone: string
  emergencyContact: string
  medicalInfo: string
  previousSchool: string
  grade: string
  classId: string
}

interface CSVStudentData {
  name: string
  email: string
  studentNumber: string
  dateOfBirth: string
  gender: string
  phone: string
  address: string
  parentName: string
  parentEmail: string
  parentPhone: string
  grade: string
  [key: string]: string
}

export default function AddStudentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("single")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  // Single student form data
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    studentNumber: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    address: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    emergencyContact: '',
    medicalInfo: '',
    previousSchool: '',
    grade: '',
    classId: ''
  })

  // CSV upload configuration
  const csvOptions = {
    requiredColumns: ['name', 'email', 'studentNumber', 'grade'],
    skipEmptyRows: true,
    validate: (row: Record<string, string>): string | null => {
      if (!row.name?.trim()) return 'Name is required'
      if (!row.email?.trim()) return 'Email is required'
      if (!row.studentNumber?.trim()) return 'Student number is required'
      if (!row.grade?.trim()) return 'Grade is required'
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(row.email)) return 'Invalid email format'
      
      return null
    },
    transform: (row: Record<string, string>): CSVStudentData => ({
      name: row.name?.trim() || '',
      email: row.email?.trim().toLowerCase() || '',
      studentNumber: row.studentNumber?.trim() || '',
      dateOfBirth: row.dateOfBirth?.trim() || '',
      gender: row.gender?.trim() || '',
      phone: row.phone?.trim() || '',
      address: row.address?.trim() || '',
      parentName: row.parentName?.trim() || '',
      parentEmail: row.parentEmail?.trim().toLowerCase() || '',
      parentPhone: row.parentPhone?.trim() || '',
      grade: row.grade?.trim() || ''
    })
  }

  const { isUploading, parsedData, uploadCSV, reset, downloadTemplate } = useCSVUpload<CSVStudentData>(csvOptions)

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await uploadCSV(file)
    }
  }

  const validateSingleForm = (): boolean => {
    const requiredFields = ['name', 'email', 'studentNumber', 'grade']
    
    for (const field of requiredFields) {
      if (!formData[field as keyof StudentFormData]) {
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

    return true
  }

  const handleSingleSubmit = async () => {
    if (!validateSingleForm()) return

    setIsSubmitting(true)
    const toastId = toast.loading("Creating student...")

    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student')
      }

      toast.dismiss(toastId)
      toast.success("Student created successfully!", {
        description: `${formData.name} has been added to the system`
      })

      // Reset form
      setFormData({
        name: '', email: '', studentNumber: '', dateOfBirth: '', gender: '',
        phone: '', address: '', parentName: '', parentEmail: '', parentPhone: '',
        emergencyContact: '', medicalInfo: '', previousSchool: '', grade: '', classId: ''
      })

    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create student'
      toast.error("Creation failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkSubmit = async () => {
    if (!parsedData || parsedData.data.length === 0) {
      toast.error("No data to submit", {
        description: "Please upload and parse a CSV file first"
      })
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading(`Creating ${parsedData.data.length} students...`)

    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedData.data })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create students')
      }

      toast.dismiss(toastId)
      toast.success("Bulk import completed!", {
        description: `${result.data.summary.created} students created successfully`
      })

      // Show detailed results
      if (result.data.summary.errors > 0 || result.data.summary.skipped > 0) {
        toast.warning("Some issues encountered", {
          description: `${result.data.summary.errors} errors, ${result.data.summary.skipped} skipped`
        })
      }

      reset()
      router.push('/admin/students')

    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create students'
      toast.error("Bulk creation failed", {
        description: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const templateColumns = [
      'name', 'email', 'studentNumber', 'dateOfBirth', 'gender',
      'phone', 'address', 'parentName', 'parentEmail', 'parentPhone', 'grade'
    ]
    downloadTemplate(templateColumns, 'students-template.csv')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/students">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Add Students
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Add students individually or in bulk via CSV import
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Single Student
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bulk Import (CSV)
              </TabsTrigger>
            </TabsList>

            {/* Single Student Form */}
            <TabsContent value="single" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter student's full name"
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
                        <Label htmlFor="studentNumber">Student Number *</Label>
                        <Input
                          id="studentNumber"
                          value={formData.studentNumber}
                          onChange={(e) => handleInputChange('studentNumber', e.target.value)}
                          placeholder="Enter student number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select 
                          id="gender"
                          className="w-full p-2 border rounded-md"
                          value={formData.gender}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="grade">Grade *</Label>
                        <select 
                          id="grade"
                          className="w-full p-2 border rounded-md"
                          value={formData.grade}
                          onChange={(e) => handleInputChange('grade', e.target.value)}
                        >
                          <option value="">Select grade</option>
                          {Array.from({length: 12}, (_, i) => (
                            <option key={i + 1} value={`grade-${i + 1}`}>
                              Grade {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter student's address"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Parent Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Parent/Guardian Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="parentName">Parent/Guardian Name</Label>
                        <Input
                          id="parentName"
                          value={formData.parentName}
                          onChange={(e) => handleInputChange('parentName', e.target.value)}
                          placeholder="Enter parent's name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentEmail">Parent Email</Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          value={formData.parentEmail}
                          onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                          placeholder="Enter parent's email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="parentPhone">Parent Phone</Label>
                        <Input
                          id="parentPhone"
                          value={formData.parentPhone}
                          onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                          placeholder="Enter parent's phone"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          placeholder="Enter emergency contact"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
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
                      <Label htmlFor="medicalInfo">Medical Information</Label>
                      <Textarea
                        id="medicalInfo"
                        value={formData.medicalInfo}
                        onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                        placeholder="Enter any medical conditions or allergies"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSingleSubmit} 
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Creating Student...' : 'Create Student'}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* Bulk Import Tab */}
            <TabsContent value="bulk" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      CSV File Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Upload a CSV file with student information. Required columns: name, email, studentNumber, grade.
                        <Button 
                          variant="link" 
                          className="p-0 h-auto ml-2"
                          onClick={handleDownloadTemplate}
                        >
                          Download template
                        </Button>
                      </AlertDescription>
                    </Alert>

                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-slate-400" />
                        <div>
                          <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Choose a CSV file or drag and drop it here
                          </p>
                          <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="csv-upload"
                          />
                          <Button 
                            asChild 
                            variant="outline"
                            disabled={isUploading}
                          >
                            <label htmlFor="csv-upload" className="cursor-pointer">
                              {isUploading ? 'Processing...' : 'Choose File'}
                            </label>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Template
                      </Button>
                      {parsedData && (
                        <Button
                          variant="outline"
                          onClick={() => setShowPreview(!showPreview)}
                          className="flex items-center gap-2"
                        >
                          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Section */}
                {parsedData && showPreview && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Data Preview</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="default">
                            {parsedData.data.length} valid rows
                          </Badge>
                          {parsedData.errors.length > 0 && (
                            <Badge variant="destructive">
                              {parsedData.errors.length} errors
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {parsedData.errors.length > 0 && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="font-medium mb-2">Errors found in CSV:</div>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {parsedData.errors.slice(0, 5).map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                              {parsedData.errors.length > 5 && (
                                <li>... and {parsedData.errors.length - 5} more errors</li>
                              )}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 dark:border-slate-600">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800">
                              {parsedData.headers.map((header) => (
                                <th key={header} className="border border-slate-300 dark:border-slate-600 p-2 text-left text-sm font-medium">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.data.slice(0, 10).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                {parsedData.headers.map((header) => (
                                  <td key={header} className="border border-slate-300 dark:border-slate-600 p-2 text-sm">
                                    {(row as CSVStudentData)[header as keyof CSVStudentData] || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {parsedData.data.length > 10 && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                            Showing first 10 rows of {parsedData.data.length} total rows
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Section */}
                {parsedData && parsedData.data.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">Ready to Import</h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            {parsedData.data.length} students will be created
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            onClick={reset}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleBulkSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {isSubmitting ? `Creating ${parsedData.data.length} Students...` : `Import ${parsedData.data.length} Students`}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
