"use client"

import { useState, useEffect } from 'react'
import { Bell, Search, User, LogOut, Settings, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { logout } from '@/app/actions/auth'
import { format } from 'date-fns'

interface Notification {
  id: string
  title: string
  description: string
  type: 'info' | 'warning' | 'success' | 'error'
  createdAt: Date
  isRead: boolean
}

interface DashboardHeaderProps {
  user: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/announcements')
        const data = await response.json()
        
        if (data.success) {
          // Transform announcements to notification format
          const notifs = data.data.map((announcement: {
            id: string
            title: string
            content: string | null
            priority: string
            type: string
            publishDate: string
            isRead: boolean
          }) => ({
            id: announcement.id,
            title: announcement.title,
            description: announcement.content?.substring(0, 100) || 'No description',
            type: announcement.priority === 'HIGH' ? 'error' as const : 
                  announcement.type === 'EVENT' ? 'success' as const : 'info' as const,
            createdAt: new Date(announcement.publishDate),
            isRead: announcement.isRead
          }))
          
          setNotifications(notifs)
          setUnreadCount(notifs.filter((n: Notification) => !n.isRead).length)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchNotifications()
  }, [])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/announcements/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ announcementId: notificationId }),
      })
      
      setNotifications(notifications.map((n: Notification) => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Mark each unread notification as read
      const unreadNotifications = notifications.filter((n: Notification) => !n.isRead)
      await Promise.all(
        unreadNotifications.map((n: Notification) =>
          fetch('/api/announcements/mark-read', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ announcementId: n.id }),
          })
        )
      )
      
      setNotifications(notifications.map((n: Notification) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const handleSignOut = async () => {
    try {
      // Clear any client-side stored data
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
      }
      
      // Call server action to sign out and clear server-side session
      await logout()
      
      // Force a hard reload to clear all state and cache
      window.location.replace('/')
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect to home page if signout fails
      window.location.replace('/')
    }
  }

  // Role label and color
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN": return { label: "Admin", color: "bg-red-100 text-red-700" }
      case "TEACHER": return { label: "Teacher", color: "bg-blue-100 text-blue-700" }
      case "STUDENT": return { label: "Student", color: "bg-green-100 text-green-700" }
      default: return { label: "User", color: "bg-gray-100 text-gray-700" }
    }
  }
  const roleInfo = getRoleLabel(user?.role)

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-2">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => {
            console.log("Hamburger clicked, dispatching toggleSidebar event")
            window.dispatchEvent(new Event('toggleSidebar'))
          }}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />

          {/* Notifications */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-4 flex justify-between items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </div>

              <ScrollArea className="h-[calc(100vh-180px)] mt-4">
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          notification.isRead
                            ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-sm font-semibold ${
                                notification.isRead ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                            <p className={`text-xs ${
                              notification.isRead ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {notification.description}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-2">
                              {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${getNotificationColor(notification.type)}`}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                  <AvatarFallback>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'No email'}
                  </p>
                  <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mt-1 ${roleInfo.color}`}>
                    {roleInfo.label}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

