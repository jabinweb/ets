/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, UserCheck, Clock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { TransferHistory } from "@/components/admin/transfer-history"
import { TransferDialog } from "@/components/admin/transfer-dialog"

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    fromClass?: string
    toClass?: string
    success?: string
    error?: string
    transferId?: string
  }>
}

export default async function StudentTransfersPage({ searchParams }: PageProps) {
  const session = await auth()
  const params = await searchParams

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const searchQuery = params.search
  const fromClassFilter = params.fromClass && params.fromClass !== 'all-classes' ? params.fromClass : undefined
  const showSuccess = params.success === 'true'
  const errorMessage = params.error ? decodeURIComponent(params.error) : null

  // Get all classes for filter dropdowns
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      grade: true
    },
    orderBy: { grade: 'asc' }
  })

  // For now, we'll track transfers by looking at students who have changed classes
  // In a production system, you'd want a proper Transfer model with history
  
  // Get all students with their current and transfer information
  const students = await prisma.user.findMany({
    where: {
      role: 'STUDENT',
      ...(searchQuery ? {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { studentNumber: { contains: searchQuery, mode: 'insensitive' } }
        ]
      } : {})
    },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          grade: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Calculate summary statistics
  const totalStudents = students.length
  const studentsWithClass = students.filter(s => s.classId).length
  const studentsWithoutClass = totalStudents - studentsWithClass

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Transfer completed successfully!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <div>
                <p className="font-medium">Transfer failed</p>
                <p className="text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Transfers</h1>
          <p className="text-muted-foreground mt-1">
            Manage student class transfers and assignments
          </p>
        </div>
        <TransferDialog students={students} classes={classes} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned to Classes</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWithClass}</div>
            <p className="text-xs text-muted-foreground">
              {((studentsWithClass / totalStudents) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignment</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{studentsWithoutClass}</div>
            <p className="text-xs text-muted-foreground">
              Need class assignment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Students</CardTitle>
          <CardDescription>Search and filter students by class</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                name="search"
                placeholder="Search by name, email, or student number..."
                defaultValue={searchQuery}
                className="pl-10"
              />
            </div>
            <Select name="fromClass" defaultValue={fromClassFilter || 'all-classes'}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Current Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-classes">All Classes</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Apply Filters</Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/students/transfers">Clear</Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>
            View and manage student class assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student Number</TableHead>
                  <TableHead>Current Class</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No students found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  students
                    .filter((student) => {
                      if (fromClassFilter === 'unassigned') {
                        return !student.classId
                      } else if (fromClassFilter) {
                        return student.classId === fromClassFilter
                      }
                      return true
                    })
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.studentNumber ? (
                            <Badge variant="outline">{student.studentNumber}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.class ? (
                            <div className="font-medium">{student.class.name}</div>
                          ) : (
                            <Badge variant="secondary">Unassigned</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.class ? (
                            <Badge variant="outline">Grade {student.class.grade}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.classId ? (
                            <Badge className="bg-green-500">Assigned</Badge>
                          ) : (
                            <Badge variant="destructive">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/students/${student.id}`}>
                                View Profile
                              </Link>
                            </Button>
                            <TransferDialog 
                              students={students} 
                              classes={classes} 
                              preselectedStudent={student}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transfer History */}
      <TransferHistory />
    </div>
  )
}
