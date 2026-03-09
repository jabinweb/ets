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
  MessageSquare,
  DollarSign,
  Bus,
  Library,
  Clipboard,
  Database,
  Shield,
} from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
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

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Auto-expand menu when on a child route
  useEffect(() => {
    const activeParent = menuItems.find(item =>
      item.children?.some(child => pathname === child.href)
    )

    if (activeParent && !openMenus.includes(activeParent.id)) {
      setOpenMenus(prev => [...prev, activeParent.id])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const menuItems = [
    {
      id: 'overview',
      title: 'Overview',
      icon: LayoutDashboard,
      href: '/admin',
    },
    {
      id: 'admissions',
      title: 'Admissions',
      icon: UserCheck,
      children: [
        { title: 'Applications', href: '/admin/admissions', icon: ClipboardList },
        { title: 'New Application', href: '/admin/admissions/new', icon: FileText },
        { title: 'Reports', href: '/admin/admissions/reports', icon: BarChart3 }
      ]
    },
    {
      id: 'students',
      title: 'Students',
      icon: Users,
      children: [
        { title: 'All Students', href: '/admin/students', icon: Users },
        { title: 'Add Student', href: '/admin/students/add', icon: Users },
        { title: 'Attendance', href: '/admin/students/attendance', icon: UserCheck },
        { title: 'Performance', href: '/admin/students/performance', icon: Award },
        { title: 'Transfers', href: '/admin/students/transfers', icon: FileText }
      ]
    },
    {
      id: 'teachers',
      title: 'Teachers',
      icon: GraduationCap,
      children: [
        { title: 'All Teachers', href: '/admin/teachers', icon: GraduationCap },
        { title: 'Add Teacher', href: '/admin/teachers/add', icon: GraduationCap },
        { title: 'Performance', href: '/admin/teachers/performance', icon: Award },
        { title: 'Schedule', href: '/admin/teachers/schedule', icon: Calendar },
        { title: 'Payroll', href: '/admin/teachers/payroll', icon: DollarSign }
      ]
    },
    {
      id: 'classes',
      title: 'Classes',
      icon: Building,
      children: [
        { title: 'All Classes', href: '/admin/classes', icon: Building },
        { title: 'Schedules', href: '/admin/classes/schedules', icon: Calendar },
        { title: 'Subjects', href: '/admin/classes/subjects', icon: BookOpen },
        { title: 'Timetables', href: '/admin/classes/timetables', icon: Clipboard }
      ]
    },
    {
      id: 'academics',
      title: 'Academics',
      icon: BookOpen,
      children: [
        { title: 'Curriculum', href: '/admin/academics/curriculum', icon: BookOpen },
        { title: 'Exams', href: '/admin/academics/exams', icon: FileText },
        { title: 'Results', href: '/admin/academics/results', icon: BarChart3 },
        { title: 'Assessment', href: '/admin/academics/assessment', icon: Clipboard }
      ]
    },
    {
      id: 'finance',
      title: 'Finance',
      icon: CreditCard,
      children: [
        { title: 'Fee Management', href: '/admin/finance/fees', icon: CreditCard },
        { title: 'Payments', href: '/admin/finance/payments', icon: DollarSign },
        { title: 'Expenses', href: '/admin/finance/expenses', icon: FileText },
        { title: 'Reports', href: '/admin/finance/reports', icon: BarChart3 },
        { title: 'Budgets', href: '/admin/finance/budgets', icon: Clipboard },
        { title: 'Scholarships', href: '/admin/finance/scholarships', icon: Award }
      ]
    },
    {
      id: 'files',
      title: 'Files',
      icon: FileText,
      href: '/admin/files',
    },
    {
      id: 'communication',
      title: 'Communication',
      icon: MessageSquare,
      children: [
        { title: 'Announcements', href: '/admin/announcements', icon: Bell },
        { title: 'Events', href: '/admin/events', icon: Calendar },
      ]
    },
    // {
    //   id: 'facilities',
    //   title: 'Facilities',
    //   icon: Building,
    //   children: [
    //     { title: 'Library', href: '/admin/facilities/library', icon: Library },
    //     { title: 'Transport', href: '/admin/facilities/transport', icon: Bus },
    //     { title: 'Cafeteria', href: '/admin/facilities/cafeteria', icon: Building },
    //     { title: 'Hostel', href: '/admin/facilities/hostel', icon: Building },
    //     { title: 'Maintenance', href: '/admin/facilities/maintenance', icon: Settings }
    //   ]
    // },
    // {
    //   id: 'human-resources',
    //   title: 'Human Resources',
    //   icon: Users,
    //   children: [
    //     { title: 'Staff Management', href: '/admin/hr/staff', icon: Users },
    //     { title: 'Payroll', href: '/admin/hr/payroll', icon: DollarSign },
    //     { title: 'Leave Management', href: '/admin/hr/leave', icon: Calendar },
    //     { title: 'Performance', href: '/admin/hr/performance', icon: Award },
    //     { title: 'Recruitment', href: '/admin/hr/recruitment', icon: UserCheck }
    //   ]
    // },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: BarChart3,
      children: [
        { title: 'Dashboard', href: '/admin/reports', icon: BarChart3 },
        { title: 'Academic Reports', href: '/admin/reports/academic', icon: BookOpen },
        { title: 'Financial Reports', href: '/admin/reports/financial', icon: DollarSign },
        { title: 'Attendance Reports', href: '/admin/reports/attendance', icon: UserCheck },
        { title: 'Custom Reports', href: '/admin/reports/custom', icon: FileText }
      ]
    },
    {
      id: 'user',
      title: 'Users & Permissions',
      icon: Database,
      children: [
        { title: 'User Management', href: '/admin/system/users', icon: Users },
        { title: 'Roles & Permissions', href: '/admin/system/permissions', icon: Shield },
        // { title: 'Backup & Restore', href: '/admin/system/backup', icon: Database },
        // { title: 'System Logs', href: '/admin/system/logs', icon: FileText },
        // { title: 'Data Import/Export', href: '/admin/system/data', icon: FileText }
      ]
    },
    // {
    //   id: 'website',
    //   title: 'Website Management',
    //   icon: Globe,
    //   children: [
    //     { title: 'Content Management', href: '/admin/website/content', icon: FileText },
    //     { title: 'News & Updates', href: '/admin/website/news', icon: Bell },
    //     { title: 'Gallery', href: '/admin/website/gallery', icon: Building },
    //     { title: 'SEO Settings', href: '/admin/website/seo', icon: Globe }
    //   ]
    // },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      href: '/admin/settings',
    },
    // {
    //   id: 'support',
    //   title: 'Help & Support',
    //   icon: HelpCircle,
    //   children: [
    //     { title: 'Documentation', href: '/admin/support/docs', icon: FileText },
    //     { title: 'Support Tickets', href: '/admin/support/tickets', icon: MessageSquare },
    //     { title: 'System Status', href: '/admin/support/status', icon: BarChart3 },
    //     { title: 'Contact Support', href: '/admin/support/contact', icon: HelpCircle }
    //   ]
    // }
  ]

  // Helper function to check if a menu has an active child
  const hasActiveChild = (item: typeof menuItems[0]) => {
    return item.children?.some(child => pathname === child.href)
  }

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        type="button"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Sidebar for desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <Link href="/admin" className="flex items-center space-x-3">
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
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      hasActiveChild(item) || openMenus.includes(item.id)
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

      {/* Sidebar for mobile (drawer) */}
      <div
        className={`
          fixed inset-0 z-50 transition-all duration-300
          ${mobileOpen ? "block" : "pointer-events-none"}
          lg:hidden
        `}
        style={{ background: mobileOpen ? "rgba(0,0,0,0.3)" : "transparent" }}
        onClick={() => setMobileOpen(false)}
        aria-label="Sidebar overlay"
      >
        <div
          className={`
            fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50
            transform transition-transform duration-300
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-primary"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            type="button"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <Link href="/admin" className="flex items-center space-x-3">
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
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        hasActiveChild(item) || openMenus.includes(item.id)
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
      </div>
    </>
  )
}
