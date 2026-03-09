import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Filter,
  Users,
  UserPlus,
  GraduationCap,
  Mail,
  Edit,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { Role } from '@prisma/client'

async function getStudents() {
  try {
    return await prisma.user.findMany({
      where: { role: Role.STUDENT },
      include: {
        class: {
          select: {
            name: true,
            grade: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return []
  }
}

export default async function AdminStudentsPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const students = await getStudents()

  const stats = {
    total: students.length,
    withClass: students.filter(student => student.class).length,
    withoutClass: students.filter(student => !student.class).length,
    grades: [...new Set(students.filter(s => s.class).map(s => s.class!.grade))].length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Students
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage student records and information
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/students/add">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Enrolled in Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.withClass}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pending Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.withoutClass}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.grades}</div>
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
                placeholder="Search students by name, email, or student number..."
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

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No students found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.image || ''} alt={student.name || ''} />
                        <AvatarFallback>
                          {student.name?.split(' ').map(n => n[0]).join('') || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {student.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Student ID: {student.studentNumber || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {student.class ? (
                        <Badge variant="outline">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {student.class.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Unassigned
                        </Badge>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/students/${student.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      <span>{student.class ? `Grade ${student.class.grade}` : 'Not enrolled'}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Joined: {new Date(student.createdAt).toLocaleDateString()}
                    </div>
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
