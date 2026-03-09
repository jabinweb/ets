import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, BookOpen } from "lucide-react"
import Link from "next/link"
import { CreateExamDialog } from "@/components/exams/create-exam-dialog"

export default async function ExamsPage() {
  const session = await auth()
  if (!session) redirect("/auth/signin")
  
  const userRole = session.user?.role
  const userId = session.user.id


  // STUDENT VIEW - Show their grades
  if (userRole === "STUDENT") {
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        class: {
          include: {
            subjects: { include: { subject: true } }
          }
        },
        examResults: {
          include: {
            exam: {
              include: {
                subject: true,
                class: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!student || !student.class) {
      return (
        <div>
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            My Exams
          </h1>
          <Card>
            <CardContent className="p-6 text-center text-slate-500">
              You are not assigned to any class yet.
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          My Exams & Results
        </h1>
        
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Class Information</CardTitle>
            <CardDescription>
              {student.class.name} - Grade {student.class.grade}
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="all" className="mb-6 sm:mb-8">
          <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Results</TabsTrigger>
            {student.class.subjects.map((cs) => (
              <TabsTrigger key={cs.subjectId} value={cs.subjectId} className="text-xs sm:text-sm">
                {cs.subject.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  All Exam Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.examResults.length === 0 ? (
                  <div className="text-slate-500 text-sm">No exam results available yet.</div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {student.examResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">{result.exam.type}</Badge>
                              <span className="font-semibold text-sm sm:text-base">{result.exam.title}</span>
                            </div>
                            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                              {result.exam.subject.name} • {new Date(result.exam.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-xl sm:text-2xl font-bold text-primary">
                              {result.marksObtained}/{result.exam.totalMarks}
                            </div>
                            {result.grade && (
                              <Badge variant="outline" className="mt-1 text-xs">Grade: {result.grade}</Badge>
                            )}
                          </div>
                        </div>
                        {result.remarks && (
                          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                            <span className="font-medium">Remarks:</span> {result.remarks}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 sm:gap-4 text-xs text-slate-500">
                          <span>Pass Marks: {result.exam.passMarks}</span>
                          <span>Duration: {result.exam.duration} mins</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {student.class.subjects.map((cs) => (
            <TabsContent key={cs.subjectId} value={cs.subjectId}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    {cs.subject.name} Results
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{cs.subject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {student.examResults.filter(r => r.exam.subjectId === cs.subjectId).length === 0 ? (
                    <div className="text-slate-500 text-sm">No results for this subject yet.</div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {student.examResults
                        .filter(r => r.exam.subjectId === cs.subjectId)
                        .map((result) => (
                          <div key={result.id} className="border rounded-lg p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="text-xs">{result.exam.type}</Badge>
                                  <span className="font-semibold text-sm sm:text-base">{result.exam.title}</span>
                                </div>
                                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                                  {new Date(result.exam.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <div className="text-xl sm:text-2xl font-bold text-primary">
                                  {result.marksObtained}/{result.exam.totalMarks}
                                </div>
                                {result.grade && (
                                  <Badge variant="outline" className="mt-1 text-xs">Grade: {result.grade}</Badge>
                                )}
                              </div>
                            </div>
                            {result.remarks && (
                              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                                <span className="font-medium">Remarks:</span> {result.remarks}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

  // TEACHER VIEW - Show classes and grade students
  if (userRole !== "TEACHER") redirect("/dashboard")

  // Fetch classes taught by this teacher
  const teacherId = session.user.id
  const classes = await prisma.class.findMany({
    where: { teacherId },
    include: {
      subjects: { include: { subject: true } },
      students: true,
      exams: {
        include: {
          results: {
            include: { student: true }
          }
        }
      }
    }
  })

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Exams & Assessments
        </h1>
        <CreateExamDialog />
      </div>
      <Tabs defaultValue={classes[0]?.id || ""} className="mb-6 sm:mb-8">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1">
          {classes.map((cls) => (
            <TabsTrigger key={cls.id} value={cls.id} className="text-xs sm:text-sm">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {cls.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {classes.map((cls) => (
          <TabsContent key={cls.id} value={cls.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Assignments & Exams for {cls.name}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {cls.subjects.map((s) => s.subject.name).join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cls.exams.length === 0 ? (
                  <div className="text-slate-500 text-sm">No assignments or exams scheduled.</div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {cls.exams.map((exam) => (
                      <div key={exam.id} className="border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge variant="secondary" className="text-xs">{exam.type}</Badge>
                          <span className="font-semibold text-sm sm:text-base">{exam.title}</span>
                          <span className="text-xs text-slate-500">{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                        <div className="overflow-x-auto -mx-3 sm:mx-0">
                          <div className="inline-block min-w-full align-middle">
                            <table className="w-full text-xs sm:text-sm border">
                              <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800">
                                  <th className="text-left py-2 px-2 sm:px-3 whitespace-nowrap">Student</th>
                                  <th className="text-left py-2 px-2 sm:px-3 whitespace-nowrap">Marks</th>
                                  <th className="text-left py-2 px-2 sm:px-3 whitespace-nowrap">Grade</th>
                                  <th className="text-left py-2 px-2 sm:px-3 whitespace-nowrap">Remarks</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cls.students.map((student) => {
                                  const result = exam.results.find((r) => r.studentId === student.id)
                                  return (
                                    <tr key={student.id} className="border-b last:border-b-0">
                                      <td className="py-2 px-2 sm:px-3">{student.name}</td>
                                      <td className="py-2 px-2 sm:px-3">{result?.marksObtained ?? "-"}</td>
                                      <td className="py-2 px-2 sm:px-3">{result?.grade ?? "-"}</td>
                                      <td className="py-2 px-2 sm:px-3 max-w-[150px] truncate" title={result?.remarks || "-"}>{result?.remarks ?? "-"}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <Button asChild variant="link" className="mt-2 text-xs sm:text-sm px-0">
                          <Link href={`/dashboard/exams/${exam.id}`}>
                            Grade / Edit
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
