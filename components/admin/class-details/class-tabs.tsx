"use client"

import { BarChart3, Users, BookOpen, Calendar } from 'lucide-react'

type TabType = 'overview' | 'students' | 'subjects' | 'schedule'

interface ClassTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function ClassTabs({ activeTab, onTabChange }: ClassTabsProps) {
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'students' as const, label: 'Students', icon: Users },
    { id: 'subjects' as const, label: 'Subjects', icon: BookOpen },
    { id: 'schedule' as const, label: 'Schedule', icon: Calendar }
  ]

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
