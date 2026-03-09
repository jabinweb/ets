"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SecuritySettings } from '@/components/settings/security-settings'
import { PreferencesSettings } from '@/components/settings/preferences-settings'
import { NotificationSettings } from '@/components/settings/notification-settings'
import { 
  Shield, 
  Settings, 
  Bell,
  ChevronLeft
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("security")

  const userRole = session?.user?.role || 'STUDENT'

  const tabs = [
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell }
  ]

  const getPageTitle = () => {
    switch (userRole) {
      case 'TEACHER':
        return 'Teacher Settings'
      case 'STUDENT':
        return 'Student Settings'
      case 'ADMIN':
        return 'Admin Settings'
      default:
        return 'Settings'
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {getPageTitle()}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="flex items-center gap-2"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-6">
                <TabsContent value="security" className="space-y-6">
                  <SecuritySettings />
                </TabsContent>

                <TabsContent value="preferences" className="space-y-6">
                  <PreferencesSettings userRole={userRole} />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <NotificationSettings userRole={userRole} />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
