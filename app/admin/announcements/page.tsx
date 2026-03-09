import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter,
  Bell,
  Plus,
  Eye,
  Edit,
  Calendar,
  Users,
  AlertCircle,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { AnnouncementType } from '@prisma/client'

async function getAnnouncements() {
  try {
    return await prisma.announcement.findMany({
      include: {
        class: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            userAnnouncements: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return []
  }
}

function getTypeColor(type: AnnouncementType) {
  switch (type) {
    case 'GENERAL': return 'bg-blue-100 text-blue-800'
    case 'ACADEMIC': return 'bg-green-100 text-green-800'
    case 'EVENT': return 'bg-purple-100 text-purple-800'
    case 'URGENT': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getTypeIcon(type: AnnouncementType) {
  switch (type) {
    case 'GENERAL': return <Bell className="h-4 w-4" />
    case 'ACADEMIC': return <BookOpen className="h-4 w-4" />
    case 'EVENT': return <Calendar className="h-4 w-4" />
    case 'URGENT': return <AlertCircle className="h-4 w-4" />
    default: return <Bell className="h-4 w-4" />
  }
}

export default async function AdminAnnouncementsPage() {
  const session = await auth()
  
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  const announcements = await getAnnouncements()

  const stats = {
    total: announcements.length,
    active: announcements.filter(a => a.isActive).length,
    urgent: announcements.filter(a => a.type === 'URGENT').length,
    expired: announcements.filter(a => a.expiryDate && a.expiryDate < new Date()).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Announcements
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage school-wide communications
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
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
                placeholder="Search announcements..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter by Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No announcements found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {announcement.title}
                        </h3>
                        <Badge className={getTypeColor(announcement.type)}>
                          {getTypeIcon(announcement.type)}
                          <span className="ml-1">{announcement.type}</span>
                        </Badge>
                        {!announcement.isActive && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/announcements/${announcement.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Published: {new Date(announcement.publishDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>
                        {announcement.class ? `Class: ${announcement.class.name}` : 'School-wide'}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Priority: {announcement.priority}/5
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {announcement.expiryDate 
                        ? `Expires: ${new Date(announcement.expiryDate).toLocaleDateString()}`
                        : 'No expiry'
                      }
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
