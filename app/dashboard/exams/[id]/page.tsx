import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, Clock, Users, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GradeStudentsForm } from "@/components/exams/grade-students-form"

export default async function ExamGradingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect("/auth/signin")
  
  const userRole = session.user?.role
  
  // Only teachers and admins can grade
  if (userRole !== "TEACHER" && userRole !== "ADMIN") {
    redirect("/dashboard/exams")
  }

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: true,
      class: {
        include: {
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              studentNumber: true
            },
            orderBy: {
              name: 'asc'
            }
          }
        }
      },
      results: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              studentNumber: true
            }
          }
        }
      }
    }
  })

  if (!exam) {
    notFound()
  }

  // Check if teacher owns this class (if not admin)
  if (userRole === "TEACHER") {
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId: session.user.id },
      select: { id: true }
    })
    const classIds = teacherClasses.map(c => c.id)
    
    if (!classIds.includes(exam.classId)) {
      redirect("/dashboard/exams")
    }
  }

  const isPastDue = new Date(exam.date) < new Date()

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/exams">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exams
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              {exam.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{exam.type}</Badge>
              <Badge variant={isPastDue ? "default" : "outline"}>
                {isPastDue ? "Completed" : "Upcoming"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{exam.subject.name}</p>
            <p className="text-sm text-muted-foreground">{exam.class.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Exam Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{new Date(exam.date).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {exam.duration} minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Grading Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Total: {exam.totalMarks}</p>
            <p className="text-sm text-muted-foreground">
              Pass: {exam.passMarks} ({Math.round((exam.passMarks / exam.totalMarks) * 100)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {exam.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{exam.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Grade Students
          </CardTitle>
          <CardDescription>
            Enter marks and grades for each student. Results will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GradeStudentsForm
            examId={id}
            students={exam.class.students}
            existingResults={exam.results}
            totalMarks={exam.totalMarks}
            passMarks={exam.passMarks}
          />
        </CardContent>
      </Card>
    </div>
  )
}
