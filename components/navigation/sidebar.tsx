"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  BookOpen,
  Calendar,
  CreditCard,
  GraduationCap,
  Home,
  MessageSquare,
  Settings,
  Users,
  ClipboardList,
  TrendingUp,
  Bell,
  Menu,
  X,
} from "lucide-react"

const navigation = {
  ADMIN: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Classes", href: "/admin/classes", icon: GraduationCap },
    { name: "Subjects", href: "/admin/subjects", icon: BookOpen },
    { name: "Attendance", href: "/admin/attendance", icon: ClipboardList },
    { name: "Exams", href: "/admin/exams", icon: TrendingUp },
    { name: "Fees", href: "/admin/fees", icon: CreditCard },
    { name: "Announcements", href: "/admin/announcements", icon: Bell },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
  TEACHER: [
    { name: "Dashboard", href: "/teacher", icon: Home },
    { name: "My Classes", href: "/teacher/classes", icon: GraduationCap },
    { name: "Attendance", href: "/teacher/attendance", icon: ClipboardList },
    { name: "Exams", href: "/teacher/exams", icon: TrendingUp },
    { name: "Messages", href: "/teacher/messages", icon: MessageSquare },
    { name: "Schedule", href: "/teacher/schedule", icon: Calendar },
  ],
  STUDENT: [
    { name: "Dashboard", href: "/student", icon: Home },
    { name: "My Classes", href: "/student/classes", icon: BookOpen },
    { name: "Attendance", href: "/student/attendance", icon: ClipboardList },
    { name: "Exams", href: "/student/exams", icon: TrendingUp },
    { name: "Fees", href: "/student/fees", icon: CreditCard },
    { name: "Messages", href: "/student/messages", icon: MessageSquare },
    { name: "Schedule", href: "/student/schedule", icon: Calendar },
  ],
}

const allowedRoles = ["ADMIN", "TEACHER", "STUDENT"] as const
type AllowedRole = typeof allowedRoles[number]

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!session?.user) return null

  const role: AllowedRole = allowedRoles.includes(session.user.role as AllowedRole)
    ? (session.user.role as AllowedRole)
    : "STUDENT"

  const userNavigation = navigation[role] || []

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-sidebar-foreground">SchoolMS</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {userNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-sidebar-foreground">{session.user.name}</p>
                <p className="text-xs text-sidebar-foreground/60">{session.user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
