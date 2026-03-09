import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Clock, Calendar, BookOpen, Target, Package, Activity, CheckSquare, Users, FileText, Tag } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default async function LessonPlanViewPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  const lessonPlan = await prisma.lessonPlan.findUnique({
    where: { id },
    include: {
      subject: true,
      class: true,
      teacher: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!lessonPlan) {
    notFound()
  }

  // Check access permissions
  const canAccess = 
    lessonPlan.teacherId === session.user.id || 
    lessonPlan.isPublic ||
    session.user.role === 'ADMIN'

  if (!canAccess) {
    redirect("/dashboard/lesson-plans")
  }

  const canEdit = lessonPlan.teacherId === session.user.id || session.user.role === 'ADMIN'

  const objectives = Array.isArray(lessonPlan.objectives) ? lessonPlan.objectives : []
  const materials = Array.isArray(lessonPlan.materials) ? lessonPlan.materials : []
  const activities = Array.isArray(lessonPlan.activities) ? lessonPlan.activities : []
  const assessment = Array.isArray(lessonPlan.assessment) ? lessonPlan.assessment : []
  const differentiation = Array.isArray(lessonPlan.differentiation) ? lessonPlan.differentiation : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/lesson-plans">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{lessonPlan.title}</h1>
              <Badge variant={lessonPlan.status === 'PUBLISHED' ? 'default' : 'outline'}>
                {lessonPlan.status}
              </Badge>
            </div>
            <p className="text-slate-500">
              {lessonPlan.subject.name} {lessonPlan.class && `• ${lessonPlan.class.name} - Section ${lessonPlan.class.section}`}
            </p>
          </div>
        </div>
        {canEdit && (
          <Button asChild>
            <Link href={`/dashboard/lesson-plans/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-slate-500">Duration</p>
                <p className="text-xl font-semibold">{lessonPlan.duration} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-slate-500">Subject</p>
                <p className="text-xl font-semibold">{lessonPlan.subject.code}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {lessonPlan.lessonNumber && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-slate-500">Lesson #</p>
                  <p className="text-xl font-semibold">{lessonPlan.lessonNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-slate-500">Last Updated</p>
                <p className="text-sm font-medium">
                  {new Date(lessonPlan.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {lessonPlan.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300">{lessonPlan.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Learning Objectives */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Learning Objectives
            </CardTitle>
            <CardDescription>What students will learn and be able to do</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {objectives.map((obj, index) => {
                const text = typeof obj === 'string' ? obj : (obj as {text?: string; description?: string})?.text || (obj as {text?: string; description?: string})?.description || ''
                return (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{text}</p>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              Materials & Resources
            </CardTitle>
            <CardDescription>Required materials and equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {materials.map((material, index) => {
                const text = typeof material === 'string' ? material : (material as {name?: string; description?: string})?.name || (material as {name?: string; description?: string})?.description || ''
                return (
                  <li key={index} className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{text}</span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Teaching Activities */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Teaching Activities & Procedures
            </CardTitle>
            <CardDescription>Step-by-step lesson activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const text = typeof activity === 'string' ? activity : (activity as {title?: string; description?: string})?.description || (activity as {title?: string; description?: string})?.title || ''
                return (
                  <div key={index} className="border-l-4 border-purple-300 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Step {index + 1}</Badge>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{text}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment */}
      {assessment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-orange-500" />
              Assessment Methods
            </CardTitle>
            <CardDescription>How student learning will be evaluated</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.map((item, index) => {
                const text = typeof item === 'string' ? item : (item as {method?: string; description?: string})?.description || (item as {method?: string; description?: string})?.method || ''
                return (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-medium shrink-0 mt-0.5">
                      ✓
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{text}</p>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Differentiation */}
      {differentiation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Differentiation Strategies
            </CardTitle>
            <CardDescription>Adaptations for different learning needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {differentiation.map((item, index) => {
                const text = typeof item === 'string' ? item : (item as {strategy?: string; description?: string})?.description || (item as {strategy?: string; description?: string})?.strategy || ''
                return (
                  <div key={index} className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-slate-700 dark:text-slate-300">{text}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Homework */}
      {lessonPlan.homework && (
        <Card>
          <CardHeader>
            <CardTitle>Homework Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{lessonPlan.homework}</p>
          </CardContent>
        </Card>
      )}

      {/* Teacher Notes */}
      {lessonPlan.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Teacher Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap italic">{lessonPlan.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {lessonPlan.academicYear && (
              <div>
                <p className="text-slate-500">Academic Year</p>
                <p className="font-medium">{lessonPlan.academicYear}</p>
              </div>
            )}
            {lessonPlan.semester && (
              <div>
                <p className="text-slate-500">Semester</p>
                <p className="font-medium">{lessonPlan.semester}</p>
              </div>
            )}
            {lessonPlan.unit && (
              <div>
                <p className="text-slate-500">Unit</p>
                <p className="font-medium">{lessonPlan.unit}</p>
              </div>
            )}
            {lessonPlan.tags && (
              <div>
                <p className="text-slate-500 mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {lessonPlan.tags.split(',').map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div>
              Created by {lessonPlan.teacher.name} • {new Date(lessonPlan.createdAt).toLocaleDateString()}
            </div>
            <div className="flex gap-4">
              {lessonPlan.isTemplate && <Badge variant="outline">Template</Badge>}
              {lessonPlan.isPublic && <Badge variant="outline">Public</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
