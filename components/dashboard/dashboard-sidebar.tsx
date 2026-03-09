"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Bell, 
  FileText, 
  UserCheck, 
  Settings,
  PieChart,
  BarChart3,
  School,
  Building,
  User,
  Activity,
  ChevronDown,
  ChevronRight,
  X,
  type LucideIcon
} from "lucide-react"

// Define menuCategories outside component to avoid recreating it on each render
const createMenuCategories = () => {
  const menuCategories: Record<string, {
    name: string;
    items: {
      title: string;
      href: string;
      icon: LucideIcon;
      badge?: string | number;
    }[];
  }[]> = {
    STUDENT: [
      {
        name: "Academics",
        items: [
          { title: "Dashboard", href: "/dashboard", icon: PieChart },
          { title: "My Exams", href: "/dashboard/exams", icon: FileText },
          { title: "Assignments", href: "/dashboard/assignments", icon: FileText },
          { title: "Performance", href: "/dashboard/performance", icon: BarChart3 },
          { title: "Timetable", href: "/dashboard/timetable", icon: Calendar },
          { title: "Attendance", href: "/dashboard/attendance", icon: UserCheck },
        ]
      },
      {
        name: "Financial",
        items: [
          { title: "Fee Payments", href: "/dashboard/fees", icon: CreditCard },
        ]
      },
      {
        name: "Communication",
        items: [
          { title: "Announcements", href: "/dashboard/announcements", icon: Bell },
        ]
      },
      {
        name: "Account",
        items: [
          { title: "My Profile", href: "/dashboard/profile", icon: User },
          { title: "Settings", href: "/dashboard/settings", icon: Settings },
        ]
      }
    ],
    TEACHER: [
      {
        name: "Classes",
        items: [
          { title: "Dashboard", href: "/dashboard", icon: PieChart },
          { title: "My Classes", href: "/dashboard/classes", icon: BookOpen },
          { title: "Timetable", href: "/dashboard/timetable", icon: Calendar },
          { title: "Attendance", href: "/dashboard/attendance", icon: UserCheck },
        ]
      },
      {
        name: "Teaching",
        items: [
          { title: "Lesson Plans", href: "/dashboard/lesson-plans", icon: FileText },
          { title: "Learning Materials", href: "/dashboard/materials", icon: BookOpen },
          { title: "Assignments", href: "/dashboard/assignments", icon: FileText, badge: 3 },
          { title: "Exams", href: "/dashboard/exams", icon: FileText },
        ]
      },
      {
        name: "Communication",
        items: [
          { title: "Announcements", href: "/dashboard/announcements", icon: Bell },
        ]
      },
      {
        name: "Professional",
        items: [
          { title: "Performance", href: "/dashboard/performance", icon: BarChart3 },
          { title: "Payroll", href: "/dashboard/payroll", icon: CreditCard },
          { title: "Leave Requests", href: "/dashboard/leave", icon: Calendar },
        ]
      },
      {
        name: "Account",
        items: [
          { title: "My Profile", href: "/dashboard/profile", icon: User },
          { title: "Settings", href: "/dashboard/settings", icon: Settings },
        ]
      }
    ],
    ADMIN: [
      {
        name: "Admin",
        items: [
          { title: "Admin Dashboard", href: "/admin", icon: Building },
          { title: "School Dashboard", href: "/dashboard", icon: School },
        ]
      },
    ],
  };
  
  return menuCategories;
};

export function DashboardSidebar({ user }: { user: { role?: string } }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeCategories, setActiveCategories] = useState<number[]>([])

  console.log("DashboardSidebar render, mobileOpen:", mobileOpen)

  // Listen for toggle event from header
  useEffect(() => {
    const handleToggle = () => {
      console.log("Toggle event received")
      setMobileOpen(prev => !prev)
    }
    
    window.addEventListener('toggleSidebar', handleToggle)
    return () => window.removeEventListener('toggleSidebar', handleToggle)
  }, [])

  // Use static reference to menu categories to avoid recreation
  const menuCategories = useMemo(() => createMenuCategories(), []);

  // Correctly memoize with menuCategories dependency included
  const categories = useMemo(() => {
    return menuCategories[user.role || 'STUDENT'] || []
  }, [user.role, menuCategories])
  
  // Also memoize allItems with correct dependencies
  const allItems = useMemo(() => {
    return categories.flatMap(category => category.items)
  }, [categories])

  // Close sidebar when pathname changes (route navigation)
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])
  
  // Set active categories based on current pathname
  useEffect(() => {
    // Find which category contains the current page
    const currentCategoryIndices: number[] = []
    
    categories.forEach((category, index) => {
      if (category.items.some(item => item.href === pathname)) {
        currentCategoryIndices.push(index)
      }
    })
    
    // If a category is found, set it as active, otherwise default to first category
    if (currentCategoryIndices.length > 0) {
      setActiveCategories(currentCategoryIndices)
    } else if (categories.length > 0) {
      setActiveCategories([0]) // Default to first category
    }
  }, [pathname, categories])

  const toggleCategory = (index: number) => {
    setActiveCategories(prev => {
      // If category is already active, remove it from active list
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      } 
      // Otherwise add it to the active list
      return [...prev, index]
    })
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <span className="font-bold text-lg text-primary">{user.role} Dashboard</span>
        </div>
        <nav className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-120px)]">
          {categories.map((category, categoryIndex) => (
            <div key={category.name} className="space-y-1">
              <div 
                className="flex items-center justify-between cursor-pointer px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary"
                onClick={() => toggleCategory(categoryIndex)}
              >
                <span>{category.name}</span>
                {activeCategories.includes(categoryIndex) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
              {activeCategories.includes(categoryIndex) && (
                <div className="ml-2 space-y-1 border-l-2 border-slate-100 dark:border-slate-700 pl-2">
                  {category.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`
          fixed inset-0 transition-all duration-300
          ${mobileOpen ? "visible opacity-100" : "invisible opacity-0"}
          lg:hidden
        `}
        style={{ 
          background: mobileOpen ? "rgba(0,0,0,0.5)" : "transparent",
          zIndex: 9999
        }}
        onClick={() => {
          console.log("Overlay clicked")
          setMobileOpen(false)
        }}
        aria-label="Sidebar overlay"
      >
        <div
          className={`
            fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
            transform transition-transform duration-300 ease-in-out shadow-2xl
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          style={{ zIndex: 10000 }}
          onClick={e => {
            console.log("Sidebar content clicked")
            e.stopPropagation()
          }}
        >
          <button
            className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-primary"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-lg text-primary">{user.role} Dashboard</span>
          </div>
          <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)]">
            {allItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}
