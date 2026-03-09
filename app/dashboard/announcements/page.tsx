"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Search, 
  Filter,
  Calendar,
  AlertCircle,
  BookOpen,
  Users,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'GENERAL' | 'ACADEMIC' | 'EVENT' | 'URGENT'
  priority: number
  isActive: boolean
  publishDate: string
  expiryDate: string | null
  class?: {
    name: string
  } | null
  isRead?: boolean
  readAt?: string | null
}

export default function AnnouncementsPage() {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements')
      if (!res.ok) throw new Error('Failed to fetch announcements')
      
      const data = await res.json()
      if (data.success) {
        setAnnouncements(data.data)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load announcements'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const filterAnnouncements = useCallback(() => {
    let filtered = [...announcements]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(a => a.type === filterType)
    }

    // Filter by read status
    if (showUnreadOnly) {
      filtered = filtered.filter(a => !a.isRead)
    }

    setFilteredAnnouncements(filtered)
  }, [announcements, searchQuery, filterType, showUnreadOnly])


  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  useEffect(() => {
    filterAnnouncements()
  }, [filterAnnouncements])


  const markAsRead = async (announcementId: string) => {
    try {
      const res = await fetch('/api/announcements/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId })
      })

      if (!res.ok) throw new Error('Failed to mark as read')

      // Update local state
      setAnnouncements(prev => prev.map(a => 
        a.id === announcementId ? { ...a, isRead: true, readAt: new Date().toISOString() } : a
      ))
    } catch (error) {
      console.error('Error marking announcement as read:', error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GENERAL': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'ACADEMIC': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'EVENT': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GENERAL': return <Bell className="w-3 h-3" />
      case 'ACADEMIC': return <BookOpen className="w-3 h-3" />
      case 'EVENT': return <Calendar className="w-3 h-3" />
      case 'URGENT': return <AlertCircle className="w-3 h-3" />
      default: return <Bell className="w-3 h-3" />
    }
  }

  const stats = {
    total: announcements.length,
    unread: announcements.filter(a => !a.isRead).length,
    urgent: announcements.filter(a => a.type === 'URGENT').length,
    events: announcements.filter(a => a.type === 'EVENT').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading announcements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">Stay updated with school news and events</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.events}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="ALL">All Types</option>
                <option value="GENERAL">General</option>
                <option value="ACADEMIC">Academic</option>
                <option value="EVENT">Events</option>
                <option value="URGENT">Urgent</option>
              </select>
              <Button
                variant={showUnreadOnly ? 'default' : 'outline'}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Unread Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No announcements found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id}
              className={`transition-all hover:shadow-md ${!announcement.isRead ? 'border-l-4 border-l-primary' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {announcement.isRead ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{announcement.title}</h3>
                          <Badge className={getTypeColor(announcement.type)}>
                            {getTypeIcon(announcement.type)}
                            <span className="ml-1">{announcement.type}</span>
                          </Badge>
                          {announcement.priority >= 4 && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                          {!announcement.isRead && (
                            <Badge variant="default">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(announcement.publishDate), 'MMM dd, yyyy')}
                          </div>
                          {announcement.class && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              Class: {announcement.class.name}
                            </div>
                          )}
                          {announcement.expiryDate && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <Clock className="w-3 h-3" />
                              Expires: {format(new Date(announcement.expiryDate), 'MMM dd, yyyy')}
                            </div>
                          )}
                          {announcement.isRead && announcement.readAt && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Read on {format(new Date(announcement.readAt), 'MMM dd, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!announcement.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(announcement.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
