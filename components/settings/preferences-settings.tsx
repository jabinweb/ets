"use client"

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Settings, 
  Palette, 
  Globe, 
  Save,
  Monitor,
  Sun,
  Moon,
  Calendar
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface PreferencesSettingsProps {
  userRole: 'STUDENT' | 'TEACHER' | 'ADMIN'
}

export function PreferencesSettings({ userRole }: PreferencesSettingsProps) {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12',
    emailDigest: true,
    dashboardLayout: 'default',
    compactMode: false,
    showProfilePicture: true,
    autoSave: true,
    // Teacher specific
    gradingScale: 'letter',
    classViewMode: 'grid',
    // Student specific
    studyReminders: true,
    assignmentNotifications: true
  })

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      const result = await response.json()
      
      if (result.success) {
        setPreferences(result.data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const handlePreferenceChange = (key: string, value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const toastId = toast.loading("Saving preferences...")

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Preferences saved successfully!")
      } else {
        throw new Error(result.error || 'Failed to save preferences')
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Failed to save preferences", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="justify-start"
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="justify-start"
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="justify-start"
              >
                <Monitor className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and padding for more content
              </p>
            </div>
            <Switch
              checked={preferences.compactMode}
              onCheckedChange={(checked) => handlePreferenceChange('compactMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Show Profile Picture</Label>
              <p className="text-sm text-muted-foreground">
                Display profile picture in navigation
              </p>
            </div>
            <Switch
              checked={preferences.showProfilePicture}
              onCheckedChange={(checked) => handlePreferenceChange('showProfilePicture', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => handlePreferenceChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => handlePreferenceChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select
                value={preferences.dateFormat}
                onValueChange={(value) => handlePreferenceChange('dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select
                value={preferences.timeFormat}
                onValueChange={(value) => handlePreferenceChange('timeFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 Hour (AM/PM)</SelectItem>
                  <SelectItem value="24">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Dashboard Layout</Label>
            <Select
              value={preferences.dashboardLayout}
              onValueChange={(value) => handlePreferenceChange('dashboardLayout', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="expanded">Expanded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save changes as you type
              </p>
            </div>
            <Switch
              checked={preferences.autoSave}
              onCheckedChange={(checked) => handlePreferenceChange('autoSave', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive daily summary emails
              </p>
            </div>
            <Switch
              checked={preferences.emailDigest}
              onCheckedChange={(checked) => handlePreferenceChange('emailDigest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Role-specific preferences */}
      {userRole === 'TEACHER' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Teaching Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Grading Scale</Label>
                <Select
                  value={preferences.gradingScale}
                  onValueChange={(value) => handlePreferenceChange('gradingScale', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                    <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                    <SelectItem value="points">Points Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Class View Mode</Label>
                <Select
                  value={preferences.classViewMode}
                  onValueChange={(value) => handlePreferenceChange('classViewMode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid View</SelectItem>
                    <SelectItem value="list">List View</SelectItem>
                    <SelectItem value="table">Table View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'STUDENT' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Study Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Study Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders for upcoming assignments and exams
                </p>
              </div>
              <Switch
                checked={preferences.studyReminders}
                onCheckedChange={(checked) => handlePreferenceChange('studyReminders', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Assignment Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new assignments are posted
                </p>
              </div>
              <Switch
                checked={preferences.assignmentNotifications}
                onCheckedChange={(checked) => handlePreferenceChange('assignmentNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  )
}
