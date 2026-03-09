"use client"

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar,
  Save,
  GraduationCap,
  Users,
  BookOpen,
  AlertCircle
} from 'lucide-react'

interface NotificationSettingsProps {
  userRole: 'STUDENT' | 'TEACHER' | 'ADMIN'
}

export function NotificationSettings({ userRole }: NotificationSettingsProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    // Email notifications
    emailEnabled: true,
    emailDigestFrequency: 'daily',
    emailAssignments: true,
    emailGrades: true,
    emailAnnouncements: true,
    emailEvents: true,
    emailReminders: true,
    
    // Push notifications
    pushEnabled: true,
    pushAssignments: true,
    pushGrades: true,
    pushMessages: true,
    pushEvents: true,
    
    // In-app notifications
    inAppEnabled: true,
    inAppSound: true,
    inAppBadges: true,
    
    // Role-specific
    // Teacher
    parentMessages: true,
    studentSubmissions: true,
    classUpdates: true,
    
    // Student
    assignmentDue: true,
    gradePosted: true,
    teacherMessages: true,
    
    // Parent
    childProgress: true,
    teacherCommunication: true,
    schoolEvents: true,
    
    // Timing
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  })

  useEffect(() => {
    fetchNotificationSettings()
  }, [])

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notifications')
      const result = await response.json()
      
      if (result.success) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    }
  }

  const handleNotificationChange = (key: string, value: string | boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const toastId = toast.loading("Saving notification settings...")

    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications)
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Notification settings saved!")
      } else {
        throw new Error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Failed to save settings", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={notifications.emailEnabled}
              onCheckedChange={(checked) => handleNotificationChange('emailEnabled', checked)}
            />
          </div>

          {notifications.emailEnabled && (
            <>
              <div className="space-y-2">
                <Label>Email Digest Frequency</Label>
                <Select
                  value={notifications.emailDigestFrequency}
                  onValueChange={(value) => handleNotificationChange('emailDigestFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Email me about:</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <Label>New assignments</Label>
                    </div>
                    <Switch
                      checked={notifications.emailAssignments}
                      onCheckedChange={(checked) => handleNotificationChange('emailAssignments', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <Label>Grade updates</Label>
                    </div>
                    <Switch
                      checked={notifications.emailGrades}
                      onCheckedChange={(checked) => handleNotificationChange('emailGrades', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <Label>Announcements</Label>
                    </div>
                    <Switch
                      checked={notifications.emailAnnouncements}
                      onCheckedChange={(checked) => handleNotificationChange('emailAnnouncements', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Label>Events and deadlines</Label>
                    </div>
                    <Switch
                      checked={notifications.emailEvents}
                      onCheckedChange={(checked) => handleNotificationChange('emailEvents', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      <Label>Reminders</Label>
                    </div>
                    <Switch
                      checked={notifications.emailReminders}
                      onCheckedChange={(checked) => handleNotificationChange('emailReminders', checked)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive instant notifications on your device
              </p>
            </div>
            <Switch
              checked={notifications.pushEnabled}
              onCheckedChange={(checked) => handleNotificationChange('pushEnabled', checked)}
            />
          </div>

          {notifications.pushEnabled && (
            <div className="space-y-4">
              <h4 className="font-medium">Push notifications for:</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>New assignments</Label>
                  <Switch
                    checked={notifications.pushAssignments}
                    onCheckedChange={(checked) => handleNotificationChange('pushAssignments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Grade updates</Label>
                  <Switch
                    checked={notifications.pushGrades}
                    onCheckedChange={(checked) => handleNotificationChange('pushGrades', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>New messages</Label>
                  <Switch
                    checked={notifications.pushMessages}
                    onCheckedChange={(checked) => handleNotificationChange('pushMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Events and deadlines</Label>
                  <Switch
                    checked={notifications.pushEvents}
                    onCheckedChange={(checked) => handleNotificationChange('pushEvents', checked)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role-specific notifications */}
      {userRole === 'TEACHER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teaching Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Parent Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when parents send messages
                </p>
              </div>
              <Switch
                checked={notifications.parentMessages}
                onCheckedChange={(checked) => handleNotificationChange('parentMessages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Student Submissions</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when students submit assignments
                </p>
              </div>
              <Switch
                checked={notifications.studentSubmissions}
                onCheckedChange={(checked) => handleNotificationChange('studentSubmissions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Class Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about changes to your classes
                </p>
              </div>
              <Switch
                checked={notifications.classUpdates}
                onCheckedChange={(checked) => handleNotificationChange('classUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'STUDENT' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Student Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Assignment Due Dates</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders before assignments are due
                </p>
              </div>
              <Switch
                checked={notifications.assignmentDue}
                onCheckedChange={(checked) => handleNotificationChange('assignmentDue', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Grade Posted</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when grades are posted
                </p>
              </div>
              <Switch
                checked={notifications.gradePosted}
                onCheckedChange={(checked) => handleNotificationChange('gradePosted', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Teacher Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when teachers send messages
                </p>
              </div>
              <Switch
                checked={notifications.teacherMessages}
                onCheckedChange={(checked) => handleNotificationChange('teacherMessages', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Disable notifications during specified hours
              </p>
            </div>
            <Switch
              checked={notifications.quietHoursEnabled}
              onCheckedChange={(checked) => handleNotificationChange('quietHoursEnabled', checked)}
            />
          </div>

          {notifications.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select
                  value={notifications.quietHoursStart}
                  onValueChange={(value) => handleNotificationChange('quietHoursStart', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={i} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>End Time</Label>
                <Select
                  value={notifications.quietHoursEnd}
                  onValueChange={(value) => handleNotificationChange('quietHoursEnd', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0')
                      return (
                        <SelectItem key={i} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  )
}
