import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  BookOpen,
  Plus,
  Edit,
  Eye,
  Users,
  Award,
  Target
} from 'lucide-react'
import Link from 'next/link'

async function getCurriculumData() {
  try {
    const [subjects, classes, totalStudents] = await Promise.all([
      prisma.subject.findMany({
        include: {
          classes: {
            include: {
              class: {
                select: {
                  name: true,
                  grade: true,
                  students: {
                    select: { id: true }
                  }
                }
              }
            }
          },
          teachers: {
            include: {
              teacher: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      
      prisma.class.findMany({
        select: {
          id: true,
          name: true,
          grade: true,
          students: {
            select: { id: true }
          }
        },
        orderBy: { grade: 'asc' }
      }),
      
      prisma.user.count({
        where: { role: 'STUDENT' }
      })
    ])

    return { subjects, classes, totalStudents }
  } catch (error) {
    console.error('Error fetching curriculum data:', error)
    return { subjects: [], classes: [], totalStudents: 0 }
  }
}

export default async function CurriculumPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const { subjects, classes, totalStudents } = await getCurriculumData()

  const stats = {
    totalSubjects: subjects.length,
    totalClasses: classes.length,
    totalStudents,
    avgCreditsPerSubject: subjects.length > 0 ? Math.round(subjects.reduce((sum, s) => sum + s.credits, 0) / subjects.length) : 0
  }

  const curriculumOverview = [
    {
      grade: "Elementary (K-5)",
      subjects: ["English Language Arts", "Mathematics", "Science", "Social Studies", "Art", "Physical Education"],
      focus: "Foundation building and core literacy skills"
    },
    {
      grade: "Middle School (6-8)", 
      subjects: ["Advanced Math", "Literature", "Biology", "History", "Foreign Language", "Technology"],
      focus: "Critical thinking and subject specialization"
    },
    {
      grade: "High School (9-12)",
      subjects: ["Calculus", "Physics", "Chemistry", "Advanced Literature", "Computer Science", "Economics"],
      focus: "College preparation and career readiness"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Curriculum Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Design and manage academic curriculum across all grades
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/academics/curriculum/mapping">
              <Target className="h-4 w-4 mr-2" />
              Curriculum Mapping
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/academics/curriculum/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Link>
          </Button>
        </div>
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
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-slate-500">Across all grades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
            <p className="text-xs text-slate-500">Teaching curriculum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Students Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
            <p className="text-xs text-slate-500">Following curriculum</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgCreditsPerSubject}</div>
            <p className="text-xs text-slate-500">Per subject</p>
          </CardContent>
        </Card>
      </div>

      {/* Curriculum Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Overview by Grade Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {curriculumOverview.map((level, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {level.grade}
                  </h3>
                  <Badge variant="outline">{level.subjects.length} Subjects</Badge>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{level.focus}</p>
                <div className="flex flex-wrap gap-2">
                  {level.subjects.map((subject, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subjects Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subjects List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Subject Management</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search subjects..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subjects found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {subject.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Code: {subject.code} • {subject.credits} Credits
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/academics/curriculum/${subject.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {subject.description}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{subject.classes.length} Classes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          <span>{subject.teachers.length} Teachers</span>
                        </div>
                      </div>
                      <Badge variant={subject.classes.length > 0 ? "default" : "secondary"}>
                        {subject.classes.length > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/academics/curriculum/standards">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learning Standards
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/academics/curriculum/objectives">
                  <Target className="h-4 w-4 mr-2" />
                  Learning Objectives
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/academics/curriculum/assessment">
                  <Award className="h-4 w-4 mr-2" />
                  Assessment Methods
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/admin/academics/curriculum/resources">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Teaching Resources
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Curriculum Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium">Completion Rate</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Average across all subjects</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">87%</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium">Student Satisfaction</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Based on feedback</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">4.2/5</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <div className="font-medium">Teacher Resources</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Available materials</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">156</div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/academics/curriculum/analytics">
                  View Detailed Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
