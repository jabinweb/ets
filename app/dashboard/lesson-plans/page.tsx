import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, PlusCircle, Calendar, Clock } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { prisma } from "@/lib/prisma"

export default async function LessonPlansPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  if (session.user?.role !== "TEACHER") {
    redirect("/dashboard")
  }
  
  // Fetch subjects taught by this teacher
  const teacherSubjects = await prisma.teacherSubject.findMany({
    where: {
      teacherId: session.user.id
    },
    include: {
      subject: true
    }
  })

  const subjects = teacherSubjects.map(ts => ({
    id: ts.subject.id,
    name: ts.subject.name,
    code: ts.subject.code,
    color: getSubjectColor(ts.subject.code)
  }))

  // Fetch lesson plans created by this teacher or public ones
  const lessonPlans = await prisma.lessonPlan.findMany({
    where: {
      OR: [
        { teacherId: session.user.id },
        { isPublic: true }
      ]
    },
    include: {
      subject: true,
      class: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lesson Plans</h1>
          <p className="text-slate-500 dark:text-slate-400">Create and manage your lesson plans by subject</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/lesson-plans/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Lesson Plan
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Plans</TabsTrigger>
          {subjects.map(subject => (
            <TabsTrigger key={subject.id} value={subject.id}>{subject.name}</TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessonPlans.map(plan => {
              const objectives = Array.isArray(plan.objectives) ? plan.objectives : []
              return (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge className={getSubjectColor(plan.subject.code)}>
                        {plan.subject.name}
                      </Badge>
                      <Badge variant={plan.status === 'PUBLISHED' ? 'default' : 'outline'}>
                        {plan.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{plan.title}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Updated: {formatDate(plan.updatedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm mb-3">
                      <Clock className="h-4 w-4 mr-2 text-slate-500" />
                      <span>{plan.duration} min</span>
                    </div>
                    {objectives.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Objectives:</p>
                        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
                          {objectives.slice(0, 2).map((obj, i) => {
                            const text = typeof obj === 'string' ? obj : (obj as {text?: string; description?: string})?.text || (obj as {text?: string; description?: string})?.description
                            return <li key={i}>{text}</li>
                          })}
                          {objectives.length > 2 && (
                            <li className="text-slate-400">+{objectives.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/lesson-plans/${plan.id}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/lesson-plans/${plan.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
            
            {lessonPlans.length === 0 && (
              <div className="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-slate-400" />
                <h3 className="mt-4 text-lg font-medium">No Lesson Plans</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  You haven&apos;t created any lesson plans yet.
                </p>
                <Button asChild>
                  <Link href="/dashboard/lesson-plans/create">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Plan
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {subjects.map(subject => (
          <TabsContent key={subject.id} value={subject.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessonPlans
                .filter(plan => plan.subject.id === subject.id)
                .map(plan => {
                  const objectives = Array.isArray(plan.objectives) ? plan.objectives : []
                  return (
                    <Card key={plan.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Badge className={getSubjectColor(plan.subject.code)}>
                            {plan.subject.name}
                          </Badge>
                          <Badge variant={plan.status === 'PUBLISHED' ? 'default' : 'outline'}>
                            {plan.status}
                          </Badge>
                        </div>
                        <CardTitle className="mt-2">{plan.title}</CardTitle>
                        <CardDescription className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Updated: {formatDate(plan.updatedAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm mb-3">
                          <Clock className="h-4 w-4 mr-2 text-slate-500" />
                          <span>{plan.duration} min</span>
                        </div>
                        {objectives.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Objectives:</p>
                            <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
                              {objectives.slice(0, 2).map((obj, i) => {
                                const text = typeof obj === 'string' ? obj : (obj as {text?: string; description?: string})?.text || (obj as {text?: string; description?: string})?.description
                                return <li key={i}>{text}</li>
                              })}
                              {objectives.length > 2 && (
                                <li className="text-slate-400">+{objectives.length - 2} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/lesson-plans/${plan.id}`}>
                            <FileText className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/lesson-plans/${plan.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
                
              {lessonPlans.filter(plan => plan.subject.id === subject.id).length === 0 && (
                <div className="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium">No Lesson Plans</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    You haven&apos;t created any lesson plans for this subject yet.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/lesson-plans/create">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Plan
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function getSubjectColor(code: string): string {
  const colors: Record<string, string> = {
    'MATH': 'bg-blue-100 text-blue-800',
    'ENG': 'bg-green-100 text-green-800',
    'SCI': 'bg-purple-100 text-purple-800',
    'HIST': 'bg-orange-100 text-orange-800',
    'ART': 'bg-pink-100 text-pink-800',
    'PE': 'bg-yellow-100 text-yellow-800'
  }
  return colors[code] || 'bg-slate-100 text-slate-800'
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
