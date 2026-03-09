import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter,
  Building,
  Plus,
  Users,
  Edit,
  Eye
} from 'lucide-react'
import Link from 'next/link'

async function getClasses() {
  try {
    return await prisma.class.findMany({
      include: {
        teacher: {
          select: {
            name: true,
            email: true
          }
        },
        students: {
          select: {
            id: true
          }
        },
        subjects: {
          include: {
            subject: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: { grade: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return []
  }
}

export default async function AdminClassesPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const classes = await getClasses()

  const stats = {
    total: classes.length,
    withTeacher: classes.filter(cls => cls.teacher).length,
    totalStudents: classes.reduce((sum, cls) => sum + cls.students.length, 0),
    avgClassSize: classes.length > 0 ? Math.round(classes.reduce((sum, cls) => sum + cls.students.length, 0) / classes.length) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Classes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage class structure and assignments
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/classes/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              With Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withTeacher}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Class Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.avgClassSize}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search classes by name or grade..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Grade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No classes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <div key={classItem.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {classItem.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Grade {classItem.grade} • Section {classItem.section}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/classes/${classItem.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Class Teacher:</span>
                      <span className="font-medium">
                        {classItem.teacher ? classItem.teacher.name : 'Not assigned'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Students:</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{classItem.students.length}/{classItem.capacity}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Subjects:</span>
                      <span className="font-medium">{classItem.subjects.length}</span>
                    </div>
                    
                    {classItem.subjects.length > 0 && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {classItem.subjects.slice(0, 3).map((cs) => (
                            <Badge key={cs.id} variant="secondary" className="text-xs">
                              {cs.subject.code}
                            </Badge>
                          ))}
                          {classItem.subjects.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{classItem.subjects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
