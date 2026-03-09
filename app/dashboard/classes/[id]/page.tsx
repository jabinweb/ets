import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Users 
} from "lucide-react"

export default async function ClassDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const session = await auth()
  
  if (!session || session.user?.role !== "TEACHER") {
    redirect("/auth/signin")
  }

  const classData = await prisma.class.findUnique({
    where: { 
      id: id,
      teacherId: session.user.id // Ensure this class belongs to the teacher
    },
    include: {
      students: {
        orderBy: { name: 'asc' }
      },
      subjects: {
        include: { subject: true }
      },
      timetable: {
        include: { subject: true },
        orderBy: [
          { day: 'asc' },
          { startTime: 'asc' }
        ]
      }
    }
  })

  if (!classData) {
    notFound()
  }

  // Get recent exams for this class
  const recentExams = await prisma.exam.findMany({
    where: { classId: classData.id },
    orderBy: { date: 'desc' },
    take: 5,
    include: {
      subject: true,
      _count: {
        select: { results: true }
      }
    }
  })

  // Get recent attendance records
  const recentAttendance = await prisma.attendance.findMany({
    where: { classId: classData.id },
    orderBy: { date: 'desc' },
    take: 5,
    include: {
      records: true
    }
  })

  // Format day of week for display
  const formatDay = (day: string) => {
    return day.charAt(0) + day.slice(1).toLowerCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{classData.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Grade {classData.grade}, Section {classData.section} • {classData.students.length} Students
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/classes">
              <span className="hidden sm:inline">Back to Classes</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href={`/dashboard/attendance?classId=${classData.id}`}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Take Attendance
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-auto">
          <TabsTrigger value="students" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Students</span>
            <span className="sm:hidden text-[10px]">Students</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Subjects</span>
            <span className="sm:hidden text-[10px]">Subjects</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
            <span className="sm:hidden text-[10px]">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Exams</span>
            <span className="sm:hidden text-[10px]">Exams</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex-col sm:flex-row gap-1 sm:gap-2 py-2 text-xs sm:text-sm">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Attendance</span>
            <span className="sm:hidden text-[10px]">Attend</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="mt-4 md:mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                {classData.students.length} students enrolled in this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classData.students.length === 0 ? (
                <div className="text-center py-4">No students enrolled yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classData.students.map((student) => (
                    <div 
                      key={student.id}
                      className="p-3 border rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 sm:mr-3 shrink-0">
                          {student.name?.[0] || 'S'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{student.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{student.studentNumber || 'No ID'}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/students/${student.id}`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subjects" className="mt-4 md:mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Subjects</CardTitle>
              <CardDescription>
                {classData.subjects.length} subjects in this class curriculum
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classData.subjects.length === 0 ? (
                <div className="text-center py-4">No subjects assigned yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classData.subjects.map((subjectLink) => (
                    <div 
                      key={subjectLink.subjectId}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div className="font-medium">{subjectLink.subject.name}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {subjectLink.subject.description}
                      </div>
                      <div className="mt-3 text-xs">
                        <span className="bg-muted px-2 py-1 rounded">
                          {subjectLink.subject.credits} Credits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-4 md:mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>
                Weekly timetable for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classData.timetable.length === 0 ? (
                <div className="text-center py-4">No schedule entries yet.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(day => {
                    const dayEntries = classData.timetable.filter((entry) => entry.day === day);
                    if (dayEntries.length === 0) return null;
                    
                    return (
                      <div key={day} className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-3">
                          <h3 className="font-semibold">{formatDay(day)}</h3>
                        </div>
                        <div className="p-3">
                          <div className="space-y-2">
                            {dayEntries.map((entry) => (
                              <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 bg-card rounded border">
                                <div className="flex items-center min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 sm:mr-3 shrink-0">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-sm sm:text-base truncate">{entry.subject.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{entry.subject.code}</div>
                                  </div>
                                </div>
                                <div className="text-xs sm:text-sm ml-10 sm:ml-0 font-medium">
                                  {entry.startTime} - {entry.endTime}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="exams" className="mt-4 md:mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exams</CardTitle>
              <CardDescription>
                Recently created exams for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentExams.length === 0 ? (
                <div className="text-center py-4">No exams found.</div>
              ) : (
                <div className="space-y-4">
                  {recentExams.map((exam) => (
                    <div 
                      key={exam.id}
                      className="p-3 sm:p-4 border rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">{exam.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {exam.subject.name} • {exam.type.toLowerCase()}
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right ml-10 sm:ml-0">
                          <div className="text-sm">
                            {new Date(exam.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {exam._count.results} / {classData.students.length} completed
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Marks:</span> {exam.totalMarks}
                        </div>
                        <Button size="sm" variant="outline" asChild className="w-full sm:w-auto">
                          <Link href={`/dashboard/exams?examId=${exam.id}`}>
                            Grade Exam
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/exams">
                    View All Exams
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="mt-4 md:mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>
                Recently taken attendance for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttendance.length === 0 ? (
                <div className="text-center py-4">No attendance records found.</div>
              ) : (
                <div className="space-y-4">
                  {recentAttendance.map((attendance) => {
                    const presentCount = attendance.records.filter((r) => r.status === "PRESENT").length;
                    const attendancePercentage = Math.round((presentCount / attendance.records.length) * 100);
                    
                    return (
                      <div 
                        key={attendance.id}
                        className="p-3 sm:p-4 border rounded-lg"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm sm:text-base">Attendance Record</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(attendance.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-left sm:text-right ml-10 sm:ml-0">
                            <div className="text-sm font-medium">
                              {presentCount} / {attendance.records.length} Present
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {attendancePercentage}% Attendance Rate
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/attendance?classId=${classData.id}`}>
                    Take Attendance
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
