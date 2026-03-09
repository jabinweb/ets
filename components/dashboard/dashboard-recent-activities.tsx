import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, ArrowRight, Clock, CheckCircle, Bell } from 'lucide-react'
import Link from 'next/link'

type RecentActivity = {
  id: string | number
  message: string
  time: string
  status: string
}

type Props = {
  recentActivities: RecentActivity[]
}

export function DashboardRecentActivities({ recentActivities }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'active': return <Bell className="h-4 w-4 text-blue-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Recent Activities
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/activities">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activity.time}
                  </p>
                </div>
                <Badge variant={activity.status === 'completed' ? 'default' : activity.status === 'pending' ? 'secondary' : 'outline'}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activities to display</p>
            <p className="text-sm">Check back later for updates</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
