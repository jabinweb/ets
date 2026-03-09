import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, ClipboardList } from "lucide-react"

export default async function TeacherClassesPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "TEACHER") {
    redirect("/auth/signin")
  }

  // Fetch classes assigned to this teacher
  const teacherId = session.user.id
  const classes = await prisma.class.findMany({
    where: { 
      teacherId: teacherId 
    },
    include: {
      _count: {
        select: { students: true }
      },
      subjects: {
        include: { subject: true }
      }
    },
    orderBy: { grade: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Classes</h1>
          <p className="text-muted-foreground">Manage your assigned classes and students</p>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-xl mb-1">No Classes Assigned</h3>
            <p className="text-muted-foreground text-center mb-4">
              You don&apos;t have any classes assigned to you yet.
            </p>
            <Button variant="outline">Contact Administrator</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle>
                  <Link 
                    href={`/dashboard/classes/${classItem.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {classItem.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{classItem._count.students} Students</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {classItem.subjects.length} {classItem.subjects.length === 1 ? 'Subject' : 'Subjects'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {classItem.subjects.slice(0, 3).map((sub) => (
                      <span key={sub.subjectId} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {sub.subject.name}
                      </span>
                    ))}
                    {classItem.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        +{classItem.subjects.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between mt-4 pt-2 border-t">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/classes/${classItem.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/attendance?classId=${classItem.id}`}>
                        <ClipboardList className="h-4 w-4 mr-1" />
                        Attendance
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}