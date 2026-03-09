"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Settings, 
  Bell,
  BarChart3,
  FileText,
  UserCheck,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Building,
  Award,
  MessageSquare
} from 'lucide-react'

interface User {
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
}

interface AdminSidebarProps {
  user: User
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [schoolName, setSchoolName] = useState('ACA')

  useEffect(() => {
    fetch('/api/school/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSchoolName(data.data.schoolShortName)
        }
      })
      .catch(err => console.error('Failed to fetch school settings:', err))
  }, [])

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const menuItems = [
    {
      id: 'overview',
      title: 'Overview',
      icon: LayoutDashboard,
      href: '/dashboard',
      role: ['ADMIN', 'TEACHER', 'STUDENT']
    },
    {
      id: 'admissions',
      title: 'Admissions',
      icon: UserCheck,
      role: ['ADMIN'],
      children: [
        { title: 'Applications', href: '/dashboard/admissions', icon: ClipboardList },
        { title: 'New Application', href: '/dashboard/admissions/new', icon: FileText },
        { title: 'Reports', href: '/dashboard/admissions/reports', icon: BarChart3 }
      ]
    },
    {
      id: 'students',
      title: 'Students',
      icon: Users,
      role: ['ADMIN', 'TEACHER'],
      children: [
        { title: 'All Students', href: '/dashboard/students', icon: Users },
        { title: 'Add Student', href: '/dashboard/students/add', icon: Users },
        { title: 'Attendance', href: '/dashboard/students/attendance', icon: UserCheck }
      ]
    },
    {
      id: 'teachers',
      title: 'Teachers',
      icon: GraduationCap,
      role: ['ADMIN'],
      children: [
        { title: 'All Teachers', href: '/dashboard/teachers', icon: GraduationCap },
        { title: 'Add Teacher', href: '/dashboard/teachers/add', icon: GraduationCap },
        { title: 'Performance', href: '/dashboard/teachers/performance', icon: Award }
      ]
    },
    {
      id: 'classes',
      title: 'Classes',
      icon: Building,
      role: ['ADMIN', 'TEACHER'],
      children: [
        { title: 'All Classes', href: '/dashboard/classes', icon: Building },
        { title: 'Schedules', href: '/dashboard/classes/schedules', icon: Calendar },
        { title: 'Subjects', href: '/dashboard/classes/subjects', icon: BookOpen }
      ]
    },
    {
      id: 'academics',
      title: 'Academics',
      icon: BookOpen,
      role: ['ADMIN', 'TEACHER'],
      children: [
        { title: 'Curriculum', href: '/dashboard/academics/curriculum', icon: BookOpen },
        { title: 'Exams', href: '/dashboard/academics/exams', icon: FileText },
        { title: 'Results', href: '/dashboard/academics/results', icon: BarChart3 }
      ]
    },
    {
      id: 'finance',
      title: 'Finance',
      icon: CreditCard,
      role: ['ADMIN'],
      children: [
        { title: 'Fee Management', href: '/dashboard/finance/fees', icon: CreditCard },
        { title: 'Payments', href: '/dashboard/finance/payments', icon: CreditCard },
        { title: 'Reports', href: '/dashboard/finance/reports', icon: BarChart3 }
      ]
    },
    {
      id: 'communication',
      title: 'Communication',
      icon: MessageSquare,
      role: ['ADMIN', 'TEACHER'],
      children: [
        { title: 'Announcements', href: '/dashboard/communication/announcements', icon: Bell },
        { title: 'Messages', href: '/dashboard/communication/messages', icon: MessageSquare },
        { title: 'Events', href: '/dashboard/communication/events', icon: Calendar }
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: BarChart3,
      href: '/dashboard/reports',
      role: ['ADMIN', 'TEACHER']
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      role: ['ADMIN']
    }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.role.includes(user?.role || 'STUDENT')
  )

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <div className="font-bold text-slate-900 dark:text-white">
              {schoolName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Admin Panel
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
        {filteredMenuItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    openMenus.includes(item.id)
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  {openMenus.includes(item.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                <AnimatePresence>
                  {openMenus.includes(item.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              pathname === child.href
                                ? "bg-primary text-primary-foreground"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                            )}
                          >
                            <child.icon className="h-4 w-4" />
                            <span>{child.title}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
