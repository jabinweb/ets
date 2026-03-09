"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ClassHeaderProps {
  className: string
  grade: number
  section: string
  capacity: number
  onDelete: () => void
}

export function ClassHeader({ className, grade, section, capacity, onDelete }: ClassHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {className}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Grade {grade} • Section {section} • Capacity: {capacity}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Manage
        </Button>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Class
        </Button>
        <Button variant="outline" onClick={onDelete} className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  )
}
