"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from 'framer-motion'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageHero } from '@/components/ui/page-hero'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  User,
  Users,
  Church,
  GraduationCap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Info,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  LogIn,
  Heart,
  PartyPopper
} from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// Zod schema for validation
const applicationSchema = z.object({
  // Program Selection
  selectedProgram: z.string().min(1, "Please select a program"),

  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  middleName: z.string().optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Please select your gender"),
  maritalStatus: z.string().min(1, "Please select your marital status"),
  nationality: z.string().min(2, "Nationality is required"),
  email: z.string().email("Invalid email address"),
  alternateEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  whatsappNumber: z.string().min(10, "WhatsApp number is required"),
  address: z.string().min(5, "Complete address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),

  // Educational Background (Array)
  education: z.array(z.object({
    degree: z.string().min(1, "Please select degree"),
    institution: z.string().min(2, "Institution name is required"),
    graduationYear: z.string().regex(/^\d{4}$/, "Enter a valid year"),
    fieldOfStudy: z.string().min(2, "Field of study is required"),
    gpaOrPercentage: z.string().optional(),
  })).min(1, "At least one educational qualification is required"),

  // Spiritual Background
  testimony: z.string().min(150, "Please provide a detailed testimony (minimum 150 characters)"),
  baptismDate: z.string().optional(),
  baptismChurch: z.string().optional(),
  statementOfFaith: z.string().min(100, "Please describe your understanding of Christian faith (minimum 100 characters)"),

  // Church & Ministry Experience
  currentChurch: z.string().min(2, "Current church name is required"),
  churchAddress: z.string().min(5, "Church address is required"),
  churchDenomination: z.string().min(2, "Denomination is required"),
  membershipDate: z.string().optional(),
  pastorName: z.string().min(2, "Pastor's name is required"),
  pastorEmail: z.string().email("Invalid email address"),
  pastorPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  // Ministry Experience (Array)
  ministryPositions: z.array(z.object({
    organization: z.string().min(2, "Organization/Church name is required"),
    position: z.string().min(2, "Position/role is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    isCurrent: z.boolean().default(false),
    responsibilities: z.string().min(50, "Please describe responsibilities (minimum 50 characters)"),
  })).min(1, "At least one ministry position is required"),

  // Calling & Purpose
  reasonForSeminary: z.string().min(150, "Please explain why you want to attend seminary (minimum 150 characters)"),
  futureMinistryGoals: z.string().min(100, "Please describe your ministry goals (minimum 100 characters)"),

  // References (Array - minimum 2 required)
  references: z.array(z.object({
    name: z.string().min(2, "Reference name is required"),
    title: z.string().min(2, "Title/position is required"),
    organization: z.string().min(2, "Church/organization is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    relationship: z.string().min(2, "Relationship is required"),
  })).min(2, "At least two references are required"),

  // Additional Information
  healthConditions: z.string().optional(),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactRelationship: z.string().min(2, "Relationship is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  howDidYouHear: z.string().optional(),
  additionalComments: z.string().optional(),
  paymentMade: z.boolean().default(false),

  // Document URLs (Mandatory check where applicable)
  transcriptUrl: z.string().min(1, "Please upload your academic transcripts"),
  passportPhotoUrl: z.string().min(1, "Please upload your passport photo"),
  recommendationLetter1Url: z.string().optional().or(z.literal('')),
  recommendationLetter2Url: z.string().optional().or(z.literal('')),
  paymentScreenshotUrl: z.string().optional().or(z.literal('')),
})

type ApplicationFormValues = z.infer<typeof applicationSchema>

function ApplicationFormContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState({
    transcript: '',
    passport: '',
    recommendation1: '',
    recommendation2: '',
    paymentScreenshot: '',
  })
  const [documents, setDocuments] = useState({
    transcript: null as File | null,
    passport: null as File | null,
    recommendation1: null as File | null,
    recommendation2: null as File | null,
    paymentScreenshot: null as File | null,
  })

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [submittedAppId, setSubmittedAppId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      selectedProgram: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      maritalStatus: '',
      nationality: 'Indian',
      email: '',
      alternateEmail: '',
      phone: '',
      whatsappNumber: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      education: [{
        degree: '',
        institution: '',
        graduationYear: '',
        fieldOfStudy: '',
        gpaOrPercentage: '',
      }],
      testimony: '',
      baptismDate: '',
      baptismChurch: '',
      statementOfFaith: '',
      currentChurch: '',
      churchAddress: '',
      churchDenomination: '',
      membershipDate: '',
      pastorName: '',
      pastorEmail: '',
      pastorPhone: '',
      ministryPositions: [{
        organization: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        responsibilities: '',
      }],
      reasonForSeminary: '',
      futureMinistryGoals: '',
      references: [
        {
          name: '',
          title: '',
          organization: '',
          email: '',
          phone: '',
          relationship: '',
        },
        {
          name: '',
          title: '',
          organization: '',
          email: '',
          phone: '',
          relationship: '',
        }
      ],
      healthConditions: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      howDidYouHear: '',
      additionalComments: '',
      paymentMade: false,
      transcriptUrl: '',
      passportPhotoUrl: '',
      recommendationLetter1Url: '',
      recommendationLetter2Url: '',
      paymentScreenshotUrl: '',
    },
  })

  // Field arrays for repeatable sections
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education',
  })

  const { fields: ministryFields, append: appendMinistry, remove: removeMinistry } = useFieldArray({
    control: form.control,
    name: 'ministryPositions',
  })

  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control: form.control,
    name: 'references',
  })

  // Map slug to program title
  const slugToTitle: Record<string, string> = {
    'ma-pastoral-studies': 'Master of Arts in Pastoral Studies',
    'ma-theological-studies': 'Master of Arts in Theological Studies',
    'master-of-divinity': 'Master of Divinity',
    'bachelor-of-ministry': 'Bachelor of Ministry',
    'bachelor-of-theology': 'Bachelor of Theology',
    'associate-degree-program': 'Associate Degree Program'
  }

  useEffect(() => {
    const programSlug = searchParams.get('program')
    if (programSlug) {
      const programTitle = slugToTitle[programSlug] || programSlug
      form.setValue('selectedProgram', programTitle)
    }
  }, [searchParams, form])

  // Auto-detect user's location based on IP address
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Using ip-api.com - free and doesn't require API key
        const response = await fetch('http://ip-api.com/json/')

        if (response.ok) {
          const data = await response.json()

          if (data.status === 'success') {
            // Set country
            if (data.country) {
              form.setValue('country', data.country, { shouldValidate: false })
            }

            // Set state/region
            if (data.regionName) {
              form.setValue('state', data.regionName, { shouldValidate: false })
            }

            // Set city
            if (data.city) {
              form.setValue('city', data.city, { shouldValidate: false })
            }

            // Set postal code
            if (data.zip) {
              form.setValue('postalCode', data.zip, { shouldValidate: false })
            }

            // Also set nationality if not already set
            if (data.country && !form.getValues('nationality')) {
              form.setValue('nationality', data.country === 'India' ? 'Indian' : data.country, { shouldValidate: false })
            }
          }
        }
      } catch (error) {
        // Silently fail - user can enter manually
        console.log('Location detection failed:', error)
      }
    }

    detectLocation()
  }, [form])

  const steps = [
    {
      title: "Personal Information",
      icon: User,
      description: "Your basic contact information",
      fields: ['selectedProgram', 'firstName', 'middleName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus', 'nationality', 'email', 'alternateEmail', 'phone', 'whatsappNumber', 'address', 'city', 'state', 'postalCode', 'country']
    },
    {
      title: "Educational Background",
      icon: GraduationCap,
      description: "Previous academic qualifications",
      fields: ['education']
    },
    {
      title: "Spiritual Background",
      icon: Heart,
      description: "Your testimony and baptism",
      fields: ['testimony', 'baptismDate', 'baptismChurch', 'statementOfFaith']
    },
    {
      title: "Ministry & Church",
      icon: Church,
      description: "Church affiliation and ministry experience",
      fields: ['currentChurch', 'churchAddress', 'churchDenomination', 'membershipDate', 'pastorName', 'pastorEmail', 'pastorPhone', 'ministryPositions']
    },
    {
      title: "Calling & Purpose",
      icon: Heart,
      description: "Your calling and ministry goals",
      fields: ['reasonForSeminary', 'futureMinistryGoals']
    },
    {
      title: "References",
      icon: Users,
      description: "Pastoral and ministry references",
      fields: ['references']
    },
    {
      title: "Additional Information",
      icon: FileText,
      description: "Emergency contact and health information",
      fields: ['healthConditions', 'emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone', 'howDidYouHear', 'additionalComments']
    },
    {
      title: "Payment",
      icon: CheckCircle,
      description: "Application fee payment",
      fields: ['paymentMade', 'paymentScreenshotUrl']
    },
    {
      title: "Documents Upload",
      icon: FileText,
      description: "Upload required documents",
      fields: ['transcriptUrl', 'passportPhotoUrl', 'recommendationLetter1Url', 'recommendationLetter2Url']
    },
    {
      title: "Review & Submit",
      icon: CheckCircle,
      description: "Final review before submission",
      fields: []
    }
  ]

  const handleFileUpload = async (documentType: keyof typeof documents, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose a file smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    // Get student name for folder organization
    const firstName = form.getValues('firstName') || 'Unknown'
    const lastName = form.getValues('lastName') || 'Student'
    const studentFolder = `${firstName}_${lastName}`.replace(/[^a-zA-Z0-9_-]/g, '_')

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', `admissions/${studentFolder}`)

      const response = await fetch(process.env.NEXT_PUBLIC_PHP_UPLOAD_URL || '', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed')
      }

      // Update both file and URL
      setDocuments(prev => ({ ...prev, [documentType]: file }))
      setUploadedUrls(prev => ({ ...prev, [documentType]: data.url }))

      // Update form values for validation
      if (documentType === 'transcript') form.setValue('transcriptUrl', data.url, { shouldValidate: true })
      if (documentType === 'passport') form.setValue('passportPhotoUrl', data.url, { shouldValidate: true })
      if (documentType === 'recommendation1') form.setValue('recommendationLetter1Url', data.url, { shouldValidate: true })
      if (documentType === 'recommendation2') form.setValue('recommendationLetter2Url', data.url, { shouldValidate: true })
      if (documentType === 'paymentScreenshot') form.setValue('paymentScreenshotUrl', data.url, { shouldValidate: true })

      toast({
        title: "Upload successful",
        description: `${file.name} uploaded successfully`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const validateCurrentStep = async () => {
    const currentFields = steps[currentStep].fields as (keyof ApplicationFormValues)[]
    if (currentFields.length === 0) return true

    const result = await form.trigger(currentFields)

    if (!result) {
      const errors = form.formState.errors
      const errorMessages = currentFields
        .filter(field => errors[field])
        .map(field => {
          const error = errors[field] as any
          return error?.message || `${field} is invalid`
        })

      console.log('Validation failed for fields:', errorMessages)

      if (errorMessages.length > 0) {
        toast({
          title: "Please check your information",
          description: errorMessages[0],
          variant: "destructive"
        })
      }
    }

    return result
  }

  const handleNext = async () => {
    if (isUploading) {
      toast({
        title: "Please wait",
        description: "Document upload is still in progress.",
      })
      return
    }

    const isValid = await validateCurrentStep()

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmit = async (data: ApplicationFormValues) => {
    try {
      // Get highest education (first entry or most recent)
      const highestEducation = data.education[0]

      // Prepare application data with uploaded document URLs
      const applicationData = {
        ...data,
        studentFirstName: data.firstName,
        studentLastName: data.lastName,
        studentDateOfBirth: data.dateOfBirth,
        studentGender: data.gender,
        studentGrade: data.selectedProgram || 'Seminary',
        parentFirstName: data.firstName, // Map parent fields to student fields for adults
        parentLastName: data.lastName,
        parentEmail: data.email,
        parentPhone: data.phone,
        parentAddress: `${data.address}, ${data.city}, ${data.state}, ${data.postalCode}, ${data.country}`,

        studentDOB: new Date(data.dateOfBirth),
        studentEmail: data.email,
        studentPhone: data.phone,
        studentAddress: data.address,
        studentCity: data.city,
        studentState: data.state,
        studentCountry: data.country,
        highestEducation: highestEducation?.degree || '',
        previousInstitution: highestEducation?.institution || '',
        yearGraduated: highestEducation?.graduationYear ? parseInt(highestEducation.graduationYear) : null,
        degreeEarned: highestEducation?.fieldOfStudy || '',
        // Document URLs from form state
        transcriptUrl: data.transcriptUrl || null,
        passportPhotoUrl: data.passportPhotoUrl || null,
        recommendationLetter1Url: data.recommendationLetter1Url || null,
        recommendationLetter2Url: data.recommendationLetter2Url || null,
        paymentScreenshotUrl: data.paymentScreenshotUrl || null,
        paymentMade: data.paymentMade,
      }

      setIsSubmitting(true)
      console.log("Submitting form data:", applicationData) // Debug log

      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application')
      }

      setSubmittedAppId(result.applicationId || 'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase())
      setIsSuccessDialogOpen(true)

      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We will review it and contact you soon.",
      })

      // Reset form
      form.reset()
      setDocuments({
        transcript: null,
        passport: null,
        recommendation1: null,
        recommendation2: null,
        paymentScreenshot: null,
      })
      setUploadedUrls({
        transcript: '',
        passport: '',
        recommendation1: '',
        recommendation2: '',
        paymentScreenshot: '',
      })
      setCurrentStep(0)
    } catch (error) {
      console.error('Submission error:', error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onErrors = (errors: any) => {
    console.error("Form validation errors:", JSON.stringify(errors, null, 2))

    // Find all error paths
    const getErrorPaths = (obj: any, prefix = ''): string[] => {
      let paths: string[] = []
      for (const key in obj) {
        const nextPath = prefix ? (prefix.endsWith(']') ? `${prefix}${key}` : `${prefix}.${key}`) : key
        if (obj[key] && obj[key].message) {
          paths.push(nextPath)
        } else if (obj[key] && typeof obj[key] === 'object') {
          const subPaths = getErrorPaths(obj[key], nextPath)
          paths = [...paths, ...subPaths]
        }
      }
      return paths
    }

    const allPaths = getErrorPaths(errors)
    const errorFields = Object.keys(errors)

    if (errorFields.length > 0) {
      // Find the first step containing any of the error fields
      let firstStepWithError = -1
      for (let i = 0; i < steps.length; i++) {
        const stepFields = steps[i].fields
        if (stepFields && stepFields.some(field => errorFields.includes(field))) {
          firstStepWithError = i
          break
        }
      }

      if (firstStepWithError !== -1) {
        setCurrentStep(firstStepWithError)
        window.scrollTo({ top: 0, behavior: 'smooth' })

        // Use a timeout to allow the step to render before focusing
        setTimeout(() => {
          if (allPaths.length > 0) {
            form.setFocus(allPaths[0] as any)
          }
        }, 100)

        toast({
          title: "Incomplete Section",
          description: `Please fix errors in the "${steps[firstStepWithError].title}" section.`,
          variant: "destructive"
        })
        return
      }
    }

    toast({
      title: "Validation Error",
      description: "Please check all fields and try again.",
      variant: "destructive"
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PageHero
        title="Seminary Admission Application"
        description="Begin your journey in theological education. Complete this application to apply for admission to ACA programs."
        badge={{
          icon: GraduationCap,
          text: "Apply Now"
        }}
        gradient="red"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Progress Steps */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-between overflow-x-auto pb-4 gap-2">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center min-w-[60px] sm:min-w-[80px] flex-shrink-0">
                  <div className="flex items-center w-full">
                    {index > 0 && (
                      <div className={`
                        flex-1 h-0.5 md:h-1 mr-2 sm:mr-3
                        ${index <= currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}
                        transition-all duration-300
                      `} />
                    )}
                    <div className={`
                      w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shrink-0
                      ${index <= currentStep
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }
                      transition-all duration-300
                    `}>
                      <step.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        flex-1 h-0.5 md:h-1 ml-2 sm:ml-3
                        ${index < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}
                        transition-all duration-300
                      `} />
                    )}
                  </div>
                  <div className="mt-3 hidden lg:block text-center px-1">
                    <p className={`text-[10px] xl:text-xs font-medium leading-tight ${index <= currentStep ? 'text-primary' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile step indicator */}
            <div className="lg:hidden text-center mt-6 bg-slate-100 dark:bg-slate-800 rounded-lg py-3 px-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Step {currentStep + 1} of {steps.length}
              </p>
              <p className="text-sm font-semibold text-primary">
                {steps[currentStep].title}
              </p>
            </div>
          </div>

          {/* Form Card */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onErrors)}>
              <Card className="p-4 sm:p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 0: Personal Information */}
                    {currentStep === 0 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Personal Information</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Please provide your personal and contact details
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="selectedProgram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Program Applying For *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="text-sm sm:text-base">
                                    <SelectValue placeholder="Select a program" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Master of Arts in Pastoral Studies">Master of Arts in Pastoral Studies</SelectItem>
                                  <SelectItem value="Master of Arts in Theological Studies">Master of Arts in Theological Studies</SelectItem>
                                  <SelectItem value="Master of Divinity">Master of Divinity</SelectItem>
                                  <SelectItem value="Bachelor of Ministry">Bachelor of Ministry</SelectItem>
                                  <SelectItem value="Bachelor of Theology">Bachelor of Theology</SelectItem>
                                  <SelectItem value="Associate Degree Program">Associate Degree Program</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter first name" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="middleName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Middle Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter middle name (optional)" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter last name" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="text-sm sm:text-base">
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="maritalStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Marital Status *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="text-sm sm:text-base">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="single">Single</SelectItem>
                                    <SelectItem value="married">Married</SelectItem>
                                    <SelectItem value="widowed">Widowed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="nationality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nationality *</FormLabel>
                                <FormControl>
                                  <Input placeholder="E.g., Indian" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your.email@example.com" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="alternateEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Alternate Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="backup@example.com (optional)" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number *</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+91 98765 43210" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="whatsappNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>WhatsApp Number *</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+91 98765 43210" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  For important updates and communication
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Street Address *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Street address" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Auto-detected based on your location
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province *</FormLabel>
                                <FormControl>
                                  <Input placeholder="State" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Auto-detected based on your location
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code *</FormLabel>
                                <FormControl>
                                  <Input placeholder="PIN/ZIP Code" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Auto-detected based on your location
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Country" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Auto-detected based on your location
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 1: Educational Background */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Educational Background</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Tell us about your previous academic qualifications
                          </p>
                        </div>

                        {educationFields.map((field, index) => (
                          <div key={field.id} className="border rounded-lg p-6 space-y-6 relative">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-semibold text-primary">Education {index + 1}</h4>
                              {educationFields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEducation(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name={`education.${index}.degree`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Degree Obtained *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="text-sm sm:text-base">
                                          <SelectValue placeholder="Select degree" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="high-school">High School Diploma</SelectItem>
                                        <SelectItem value="associate">Associate Degree</SelectItem>
                                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                        <SelectItem value="master">Master's Degree</SelectItem>
                                        <SelectItem value="doctorate">Doctorate</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`education.${index}.institution`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Institution Name *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="University/College name" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`education.${index}.graduationYear`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Graduation Year *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="2020" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`education.${index}.fieldOfStudy`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Field of Study *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Major/Field of study" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`education.${index}.gpaOrPercentage`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>GPA / Percentage</FormLabel>
                                    <FormControl>
                                      <Input placeholder="E.g., 3.5 GPA or 75%" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                      Optional but helpful for evaluation
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => appendEducation({ degree: '', institution: '', graduationYear: '', fieldOfStudy: '', gpaOrPercentage: '' })}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Degree
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Spiritual Background */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Spiritual Background</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Your salvation experience and spiritual journey
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="baptismDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Baptism</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Leave blank if not yet baptized
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="baptismChurch"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Church Where Baptized</FormLabel>
                                <FormControl>
                                  <Input placeholder="Name of church (optional)" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="testimony"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Testimony *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Please describe how you came to faith in Christ (minimum 150 characters)"
                                    {...field}
                                    rows={5}
                                    className="text-sm sm:text-base resize-none"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Share your testimony
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="statementOfFaith"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Statement of Faith *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe your understanding of core Christian beliefs (minimum 100 characters)"
                                    {...field}
                                    rows={4}
                                    className="text-sm sm:text-base resize-none"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  Share your understanding of key doctrines (God, Jesus, salvation, scripture, etc.)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Ministry & Church */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Ministry & Church Affiliation</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Information about your church and ministry experience
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="currentChurch"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Current Church *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Church name" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="churchAddress"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Church Address *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Church address" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="churchDenomination"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Church Denomination *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Baptist, Independent, etc." {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="membershipDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Member Since</FormLabel>
                                <FormControl>
                                  <Input type="month" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  When did you become a member?
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="pastorName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pastor's Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Pastor's full name" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="pastorEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pastor's Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="pastor@church.com" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="pastorPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pastor's Phone *</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+91 98765 43210" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="border-t pt-6 mt-6">
                          <h4 className="font-semibold mb-4 text-primary">Ministry Experience</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            List all your ministry positions and roles
                          </p>

                          {ministryFields.map((field, index) => (
                            <div key={field.id} className="border rounded-lg p-6 mb-4 space-y-4">
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium">Position {index + 1}</h5>
                                {ministryFields.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMinistry(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Remove
                                  </Button>
                                )}
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`ministryPositions.${index}.organization`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Church/Organization *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Church or ministry name" {...field} className="text-sm sm:text-base" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`ministryPositions.${index}.position`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Position/Role *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g., Youth Pastor, Worship Leader" {...field} className="text-sm sm:text-base" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`ministryPositions.${index}.startDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Start Date *</FormLabel>
                                      <FormControl>
                                        <Input type="month" {...field} className="text-sm sm:text-base" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`ministryPositions.${index}.endDate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>End Date</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="month"
                                          {...field}
                                          className="text-sm sm:text-base"
                                          disabled={form.watch(`ministryPositions.${index}.isCurrent`)}
                                        />
                                      </FormControl>
                                      <FormDescription className="text-xs">
                                        Leave blank if current position
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`ministryPositions.${index}.isCurrent`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 md:col-span-2">
                                      <FormControl>
                                        <input
                                          type="checkbox"
                                          checked={field.value}
                                          onChange={field.onChange}
                                          className="h-4 w-4"
                                        />
                                      </FormControl>
                                      <FormLabel className="!mt-0 font-normal">
                                        This is my current position
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`ministryPositions.${index}.responsibilities`}
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel>Responsibilities *</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Describe your responsibilities in this role (minimum 50 characters)"
                                          {...field}
                                          rows={3}
                                          className="text-sm sm:text-base resize-none"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendMinistry({
                              organization: '',
                              position: '',
                              startDate: '',
                              endDate: '',
                              isCurrent: false,
                              responsibilities: ''
                            })}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Another Position
                          </Button>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Your pastor will be contacted for a reference letter as part of the admission process.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* Step 4: Calling & Purpose */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Calling & Purpose</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Share your calling to ministry and your goals
                          </p>
                        </div>

                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="reasonForSeminary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Why Seminary? *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={6}
                                    placeholder="Why do you want to attend seminary at this time? What are your expectations? (minimum 150 characters)"
                                    {...field}
                                    className="text-sm sm:text-base resize-none"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  {field.value?.length || 0} characters
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="futureMinistryGoals"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Future Ministry Goals *</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={5}
                                    placeholder="What are your ministry goals after completing your theological education? (minimum 100 characters)"
                                    {...field}
                                    className="text-sm sm:text-base resize-none"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  {field.value?.length || 0} characters
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 5: References */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">References</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Provide at least two ministry references who can speak to your character and calling
                          </p>
                        </div>

                        {referenceFields.map((field, index) => (
                          <div key={field.id} className="border rounded-lg p-6 space-y-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-primary">Reference {index + 1}</h4>
                              {referenceFields.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeReference(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <FormField
                                control={form.control}
                                name={`references.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Reference name" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`references.${index}.title`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title/Position *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="E.g., Senior Pastor, Ministry Director" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`references.${index}.organization`}
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Church/Organization *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Church or ministry organization" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`references.${index}.email`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address *</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="reference@email.com" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`references.${index}.phone`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone Number *</FormLabel>
                                    <FormControl>
                                      <Input type="tel" placeholder="+91 98765 43210" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`references.${index}.relationship`}
                                render={({ field }) => (
                                  <FormItem className="md:col-span-2">
                                    <FormLabel>Relationship *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="How do you know this person?" {...field} className="text-sm sm:text-base" />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                      E.g., "My pastor for 5 years" or "Ministry supervisor for 3 years"
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => appendReference({
                            name: '',
                            title: '',
                            organization: '',
                            email: '',
                            phone: '',
                            relationship: ''
                          })}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Reference
                        </Button>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Your references will be contacted to provide recommendation letters for your application. Minimum 2 references required.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* Step 6: Additional Information */}
                    {currentStep === 6 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Additional Information</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Emergency contact and other important details
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full name" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="emergencyContactRelationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Spouse, Parent, Sibling, etc." {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Emergency Contact Phone *</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+91 98765 43210" {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="healthConditions"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Health Conditions</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Please list any health conditions we should be aware of (optional)"
                                    {...field}
                                    rows={3}
                                    className="text-sm sm:text-base resize-none"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  This information helps us provide appropriate accommodations if needed
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="howDidYouHear"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>How Did You Hear About Us?</FormLabel>
                                <FormControl>
                                  <Input placeholder="Church, Friend, Website, etc." {...field} className="text-sm sm:text-base" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="additionalComments"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Additional Comments</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any additional information you'd like to share (optional)"
                                    {...field}
                                    rows={4}
                                    className="text-sm sm:text-base resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 7: Payment */}
                    {currentStep === 7 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Application Fee Payment</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Please scan the QR code to make your application payment.
                          </p>
                        </div>
                        <div className="flex justify-center">
                          <img
                            src="https://files.jabin.org/api/uploads/aca/69a09f3e926378.54408172_1772134206.jpeg"
                            alt="Payment QR Code"
                            className="w-64 h-64 border p-2 rounded-lg"
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="paymentMade"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                              </FormControl>
                              <div className="space-y-1">
                                <FormLabel className="!mt-0 font-medium">
                                  I have made the payment
                                </FormLabel>
                                <FormDescription className="text-xs">
                                  Please check this box if you have successfully completed the payment.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        {form.watch('paymentMade') && (
                          <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-lg">
                            <label className="block text-sm font-medium mb-2 text-green-800">Payment Screenshot *</label>
                            <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors bg-white">
                              <Upload className={`h-12 w-12 mx-auto mb-2 ${isUploading ? 'text-green-500 animate-pulse' : 'text-green-400'}`} />
                              <Input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => e.target.files && handleFileUpload('paymentScreenshot', e.target.files[0])}
                                className="max-w-xs mx-auto"
                                disabled={isUploading}
                              />
                              <p className="text-sm text-slate-500 mt-2">
                                {documents.paymentScreenshot?.name || 'Upload payment screenshot confirmation'}
                              </p>
                              {uploadedUrls.paymentScreenshot && (
                                <p className="text-xs text-green-600 mt-1">✓ Uploaded successfully</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 8: Documents Upload */}
                    {currentStep === 8 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Document Upload</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Please upload the required documents (PDF format preferred, max 10MB each)
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Academic Transcripts *</label>
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors ${form.formState.errors.transcriptUrl ? 'border-red-500 bg-red-50' : ''}`}>
                              <Upload className={`h-12 w-12 mx-auto mb-2 ${isUploading ? 'text-primary animate-pulse' : 'text-slate-400'}`} />
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => e.target.files && handleFileUpload('transcript', e.target.files[0])}
                                className="max-w-xs mx-auto"
                                disabled={isUploading}
                              />
                              <p className="text-sm text-slate-500 mt-2">
                                {documents.transcript?.name || 'Upload your official transcripts'}
                              </p>
                              {uploadedUrls.transcript && (
                                <p className="text-xs text-green-600 mt-1">✓ Uploaded successfully</p>
                              )}
                              {form.formState.errors.transcriptUrl && (
                                <p className="text-xs text-red-600 mt-1 font-medium">{form.formState.errors.transcriptUrl.message as string}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Passport Photo *</label>
                            <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors ${form.formState.errors.passportPhotoUrl ? 'border-red-500 bg-red-50' : ''}`}>
                              <Upload className={`h-12 w-12 mx-auto mb-2 ${isUploading ? 'text-primary animate-pulse' : 'text-slate-400'}`} />
                              <Input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                onChange={(e) => e.target.files && handleFileUpload('passport', e.target.files[0])}
                                className="max-w-xs mx-auto"
                                disabled={isUploading}
                              />
                              <p className="text-sm text-slate-500 mt-2">
                                {documents.passport?.name || 'Upload a recent passport-sized photo'}
                              </p>
                              {uploadedUrls.passport && (
                                <p className="text-xs text-green-600 mt-1">✓ Uploaded successfully</p>
                              )}
                              {form.formState.errors.passportPhotoUrl && (
                                <p className="text-xs text-red-600 mt-1 font-medium">{form.formState.errors.passportPhotoUrl.message as string}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Pastor Recommendation Letter (Optional)</label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                              <Upload className={`h-12 w-12 mx-auto mb-2 ${isUploading ? 'text-primary animate-pulse' : 'text-slate-400'}`} />
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => e.target.files && handleFileUpload('recommendation1', e.target.files[0])}
                                className="max-w-xs mx-auto"
                                disabled={isUploading}
                              />
                              <p className="text-sm text-slate-500 mt-2">
                                {documents.recommendation1?.name || 'If available, or will be sent separately'}
                              </p>
                              {uploadedUrls.recommendation1 && (
                                <p className="text-xs text-green-600 mt-1">✓ Uploaded successfully</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Additional Reference Letter (Optional)</label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                              <Upload className={`h-12 w-12 mx-auto mb-2 ${isUploading ? 'text-primary animate-pulse' : 'text-slate-400'}`} />
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => e.target.files && handleFileUpload('recommendation2', e.target.files[0])}
                                className="max-w-xs mx-auto"
                                disabled={isUploading}
                              />
                              <p className="text-sm text-slate-500 mt-2">
                                {documents.recommendation2?.name || 'If available, or will be sent separately'}
                              </p>
                              {uploadedUrls.recommendation2 && (
                                <p className="text-xs text-green-600 mt-1">✓ Uploaded successfully</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Reference letters can also be sent directly by your references to NIBSeminary@gmail.com
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}

                    {/* Step 9: Review & Submit */}
                    {currentStep === 9 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold mb-2">Review Your Application</h3>
                          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                            Please review your information before submitting
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="border-b pb-4">
                            <h4 className="font-semibold mb-2">Program</h4>
                            <p className="text-slate-600 dark:text-slate-400">{form.watch('selectedProgram') || 'Not selected'}</p>
                          </div>

                          <div className="border-b pb-4">
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Personal Information</h4>
                            <div className="grid sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                              <p><span className="font-medium">Name:</span> {form.watch('firstName')} {form.watch('lastName')}</p>
                              <p className="break-all"><span className="font-medium">Email:</span> {form.watch('email')}</p>
                              <p><span className="font-medium">Phone:</span> {form.watch('phone')}</p>
                              <p><span className="font-medium">Date of Birth:</span> {form.watch('dateOfBirth')}</p>
                            </div>
                          </div>

                          <div className="border-b pb-4">
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Education</h4>
                            {form.watch('education')?.map((edu, idx) => (
                              <div key={idx} className="mb-2">
                                <p className="text-xs sm:text-sm"><span className="font-medium">Degree {idx + 1}:</span> {edu.degree} - {edu.institution} ({edu.graduationYear})</p>
                              </div>
                            ))}
                          </div>

                          <div className="border-b pb-4">
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Church & Ministry</h4>
                            <p className="text-xs sm:text-sm"><span className="font-medium">Church:</span> {form.watch('currentChurch')}</p>
                            <p className="text-xs sm:text-sm"><span className="font-medium">Pastor:</span> {form.watch('pastorName')}</p>
                            <div className="mt-2">
                              <span className="font-medium text-xs sm:text-sm">Ministry Positions:</span>
                              {form.watch('ministryPositions')?.map((pos, idx) => (
                                <p key={idx} className="text-xs sm:text-sm ml-2">• {pos.position} at {pos.organization}</p>
                              ))}
                            </div>
                          </div>

                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              By submitting this application, you confirm that all information provided is accurate and complete.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-8 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="w-full sm:w-auto order-2 sm:order-1"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                        <span className="sm:hidden">Previous Step</span>
                      </Button>

                      {currentStep < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={isUploading}
                          className="w-full sm:w-auto order-1 sm:order-2"
                        >
                          <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Next'}</span>
                          <span className="sm:hidden">{isUploading ? 'Wait...' : 'Continue'}</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="bg-primary w-full sm:w-auto order-1 sm:order-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                              Submitting...
                            </div>
                          ) : (
                            <>
                              <span className="hidden sm:inline">Submit Application</span>
                              <span className="sm:hidden">Submit</span>
                              <CheckCircle className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </form>
          </Form>
        </div>
      </section>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <PartyPopper className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold">Submission Successful!</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Your application has been received and is now being processed by our admissions team.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border mt-4 text-center">
            <p className="text-sm text-slate-500 uppercase font-semibold tracking-wider">Application Number</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-mono font-bold text-primary">{submittedAppId}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  navigator.clipboard.writeText(submittedAppId)
                  toast({ title: "Copied!", description: "Application ID copied to clipboard." })
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Please keep this number for your records</p>
          </div>

          <div className="space-y-4 mt-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800 flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                A confirmation email has been sent to the primary email address provided in your application.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button asChild className="w-full sm:flex-1">
              <Link href="/track-application">
                <ExternalLink className="mr-2 h-4 w-4" />
                Track Progress
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:flex-1">
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Student Login
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default function SeminaryApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ApplicationFormContent />
    </Suspense>
  )
}