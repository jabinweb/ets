import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Award,
  BookOpen,
  Activity,
  Star,
} from "lucide-react"

export default async function PerformancePage() {
  const session = await auth()
  if (!session) redirect("/auth/signin")
  
  const userRole = session.user?.role
  const userId = session.user.id

  // STUDENT VIEW - Show their performance reports
  if (userRole === "STUDENT") {
    const performanceReports = await prisma.studentPerformanceReport.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: 'desc' }
    })

    const subjectPerformances = await prisma.subjectPerformance.findMany({
      where: { studentId: userId },
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const goals = await prisma.studentGoal.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: 'desc' }
    })

    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          My Performance
        </h1>

        {/* Overall Performance Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {performanceReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="text-lg">{report.semester} {report.academicYear}</CardTitle>
                <CardDescription>{report.reportType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">GPA</span>
                    <span className="font-bold text-lg">{report.overallGPA.toString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Attendance</span>
                    <span className="font-semibold">{report.attendanceRate.toString()}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={report.academicStatus === 'EXCELLENT' ? 'default' : 'secondary'}>
                      {report.academicStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  {report.classRank && report.classSize && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rank</span>
                      <span className="font-semibold">{report.classRank} / {report.classSize}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="subjects" className="mb-6">
          <TabsList>
            <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Subject Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectPerformances.map((perf) => (
                    <div key={perf.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{perf.subject.name}</h3>
                          <p className="text-sm text-muted-foreground">{perf.semester} {perf.academicYear}</p>
                        </div>
                        <div className="text-right">
                          {perf.currentGrade && (
                            <Badge variant="outline" className="text-lg">{perf.currentGrade}</Badge>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">{perf.currentPercentage.toString()}%</p>
                        </div>
                      </div>
                      <Progress value={parseFloat(perf.currentPercentage.toString())} className="mb-2" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {perf.assignmentAverage && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assignments:</span>
                            <span className="font-medium">{perf.assignmentAverage.toString()}%</span>
                          </div>
                        )}
                        {perf.examAverage && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Exams:</span>
                            <span className="font-medium">{perf.examAverage.toString()}%</span>
                          </div>
                        )}
                      </div>
                      {perf.improvementTrend && (
                        <div className="flex items-center gap-2 mt-2">
                          {perf.improvementTrend === 'IMPROVING' && (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600">Improving</span>
                            </>
                          )}
                          {perf.improvementTrend === 'DECLINING' && (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600">Needs attention</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  My Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                          )}
                        </div>
                        <Badge variant={goal.status === 'ACHIEVED' ? 'default' : 'secondary'}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Progress value={goal.progress} className="mb-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress: {goal.progress}%</span>
                        {goal.targetDate && (
                          <span className="text-muted-foreground">
                            Due: {new Date(goal.targetDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {goals.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No goals set yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // TEACHER VIEW - Show their performance reviews
  if (userRole === "TEACHER") {
    const performanceReviews = await prisma.performanceReview.findMany({
      where: { teacherId: userId },
      include: {
        reviewer: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          My Performance Reviews
        </h1>

        <div className="space-y-6">
          {performanceReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{review.reviewPeriod}</CardTitle>
                    <CardDescription>
                      {new Date(review.startDate).toLocaleDateString()} - {new Date(review.endDate).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={review.status === 'FINALIZED' ? 'default' : 'secondary'}>
                    {review.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Overall Rating:</span>
                    <span className="text-2xl font-bold text-primary">{review.overallRating.toString()}/5.0</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Teaching Quality</p>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{review.teachingQuality}/5</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Classroom Management</p>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{review.classroomManagement}/5</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Student Engagement</p>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{review.studentEngagement}/5</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Professional Development</p>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{review.professionalDevelopment}/5</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Collaboration</p>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{review.collaboration}/5</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Punctuality</p>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{review.punctuality}/5</span>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                  </div>

                  {review.strengths && (
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Strengths</h3>
                      <p className="text-sm text-muted-foreground">{review.strengths}</p>
                    </div>
                  )}

                  {review.improvements && (
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Areas for Improvement</h3>
                      <p className="text-sm text-muted-foreground">{review.improvements}</p>
                    </div>
                  )}

                  {review.goals && (
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Goals</h3>
                      <p className="text-sm text-muted-foreground">{review.goals}</p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Set: {review.goalsSet}</span>
                        <span>Achieved: {review.goalsAchieved}</span>
                      </div>
                    </div>
                  )}

                  {review.reviewer && (
                    <p className="text-sm text-muted-foreground">Reviewed by: {review.reviewer.name}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {performanceReviews.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No performance reviews available yet
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Default fallback
  redirect("/dashboard")
}
