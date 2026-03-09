"use client"

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { staggerContainer, staggerItem } from '@/lib/motion'
import { 
  Mail, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award,
  Clock,
  Star,
  ArrowLeft,
  Download
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type FacultyMember = {
  id: string
  name: string
  email: string
  image: string
  qualification: string
  specialization: string
  experience: number | null
  bio: string
  dateOfJoining: Date | null
  subjects: string[]
  classes: {
    id: string
    name: string
    grade: number
    studentCount: number
  }[]
}

type FacultyMemberProfileProps = {
  facultyMember: FacultyMember
}

export function FacultyMemberProfile({ facultyMember }: FacultyMemberProfileProps) {
  const yearsOfExperience = facultyMember.experience || 
    (facultyMember.dateOfJoining ? 
      Math.floor((new Date().getTime() - facultyMember.dateOfJoining.getTime()) / (1000 * 60 * 60 * 24 * 365)) : 0)

  const totalStudents = facultyMember.classes.reduce((sum, cls) => sum + cls.studentCount, 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header with back button */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/faculty">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Faculty
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Hero Section */}
          <motion.div 
            className="relative mb-8"
            variants={staggerItem}
          >
            <Card className="overflow-hidden">
              <div className="relative h-48 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <Image
                          src={facultyMember.image}
                          alt={facultyMember.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {facultyMember.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge variant="default" className="text-sm">
                          {facultyMember.specialization}
                        </Badge>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Award className="h-4 w-4 mr-1" />
                          {facultyMember.qualification}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {yearsOfExperience} years experience
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {totalStudents} students
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {facultyMember.classes.length} classes
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Contact
                      </Button>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Bio and Details */}
            <motion.div 
              className="lg:col-span-2 space-y-6"
              variants={staggerItem}
            >
              {/* About Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {facultyMember.bio}
                  </p>
                </CardContent>
              </Card>

              {/* Subjects Taught */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Subjects Taught
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {facultyMember.subjects.map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Classes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Current Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {facultyMember.classes.map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {cls.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Grade {cls.grade}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {cls.studentCount}
                          </div>
                          <p className="text-xs text-slate-500">students</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Quick Stats and Contact */}
            <motion.div 
              className="space-y-6"
              variants={staggerItem}
            >
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Experience</span>
                    <span className="font-semibold">{yearsOfExperience} years</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Students</span>
                    <span className="font-semibold">{totalStudents}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Classes</span>
                    <span className="font-semibold">{facultyMember.classes.length}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Subjects</span>
                    <span className="font-semibold">{facultyMember.subjects.length}</span>
                  </div>
                  {facultyMember.dateOfJoining && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Joined</span>
                        <span className="font-semibold">
                          {new Date(facultyMember.dateOfJoining).getFullYear()}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {facultyMember.email}
                    </span>
                  </div>
                  <Button className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </CardContent>
              </Card>

              {/* Achievement Badge */}
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Recognized Educator
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Committed to excellence in education and student development
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
