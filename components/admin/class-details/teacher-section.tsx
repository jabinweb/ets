"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  Edit, 
  Plus, 
  Search, 
  X, 
  Check 
} from 'lucide-react'

interface Teacher {
  id: string
  name: string
  email: string
  qualification?: string
  specialization?: string
  phone?: string
}

interface TeacherSectionProps {
  teacher: Teacher | null
  classId: string
  className: string
  onTeacherChange: () => void
}

export function TeacherSection({ teacher, classId, className, onTeacherChange }: TeacherSectionProps) {
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false)
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([])
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('')
  const [isChangingTeacher, setIsChangingTeacher] = useState(false)
  const { toast } = useToast()

  const fetchAvailableTeachers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/teachers')
      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        setAvailableTeachers(result.data)
      } else {
        setAvailableTeachers([])
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setAvailableTeachers([])
    }
  }, [])

  useEffect(() => {
    if (showTeacherDropdown && availableTeachers.length === 0) {
      fetchAvailableTeachers()
    }
  }, [showTeacherDropdown, availableTeachers.length, fetchAvailableTeachers])

  const handleChangeTeacher = async (newTeacherId: string) => {
    const selectedTeacher = availableTeachers.find(t => t.id === newTeacherId)
    if (!selectedTeacher) return

    const confirmed = confirm(`Are you sure you want to assign ${selectedTeacher.name} as the new class teacher for ${className}?`)
    if (!confirmed) return

    setIsChangingTeacher(true)
    const toastId = toast.loading("Updating class teacher...")

    try {
      const response = await fetch(`/api/admin/classes/${classId}/teacher`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: newTeacherId })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Teacher updated successfully!", {
          description: `${selectedTeacher.name} is now the class teacher for ${className}`
        })
        
        onTeacherChange()
        setShowTeacherDropdown(false)
        setTeacherSearchTerm('')
      } else {
        throw new Error(result.error || 'Failed to update teacher')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update teacher'
      toast.error("Update failed", { description: errorMessage })
    } finally {
      setIsChangingTeacher(false)
    }
  }

  const filteredTeachers = Array.isArray(availableTeachers) 
    ? availableTeachers.filter(teacher => {
        if (!teacher || typeof teacher !== 'object') return false
        
        const name = teacher.name || ''
        const email = teacher.email || ''
        const specialization = teacher.specialization || ''
        
        return (
          name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
          email.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
          specialization.toLowerCase().includes(teacherSearchTerm.toLowerCase())
        )
      })
    : []

  if (teacher) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Class Teacher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={teacher.name} />
              <AvatarFallback className="text-lg">
                {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {teacher.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher.qualification && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{teacher.qualification}</span>
                  </div>
                )}
              </div>
              {teacher.specialization && (
                <Badge variant="outline" className="mt-2">
                  {teacher.specialization}
                </Badge>
              )}
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                disabled={isChangingTeacher}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isChangingTeacher ? 'Updating...' : 'Change Teacher'}
              </Button>

              {showTeacherDropdown && (
                <TeacherDropdown
                  teachers={filteredTeachers}
                  searchTerm={teacherSearchTerm}
                  onSearchChange={setTeacherSearchTerm}
                  onSelectTeacher={handleChangeTeacher}
                  onClose={() => {
                    setShowTeacherDropdown(false)
                    setTeacherSearchTerm('')
                  }}
                  currentTeacherId={teacher.id}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No teacher assigned
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Class Teacher
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No Teacher Assigned
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            This class doesn&apos;t have a teacher assigned yet.
          </p>
          <Button 
            onClick={() => setShowTeacherDropdown(true)}
            disabled={isChangingTeacher}
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Teacher
          </Button>

          {showTeacherDropdown && (
            <TeacherDropdown
              teachers={filteredTeachers}
              searchTerm={teacherSearchTerm}
              onSearchChange={setTeacherSearchTerm}
              onSelectTeacher={handleChangeTeacher}
              onClose={() => {
                setShowTeacherDropdown(false)
                setTeacherSearchTerm('')
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface TeacherDropdownProps {
  teachers: Teacher[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onSelectTeacher: (teacherId: string) => void
  onClose: () => void
  currentTeacherId?: string
}

function TeacherDropdown({ 
  teachers, 
  searchTerm, 
  onSearchChange, 
  onSelectTeacher, 
  onClose,
  currentTeacherId 
}: TeacherDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-slate-900 dark:text-white">Select Teacher</h4>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search teachers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <button
              key={teacher.id}
              className="w-full p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-b-0"
              onClick={() => onSelectTeacher(teacher.id)}
              disabled={teacher.id === currentTeacherId}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={teacher.name} />
                  <AvatarFallback>
                    {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {teacher.name}
                    {teacher.id === currentTeacherId && (
                      <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {teacher.email}
                  </div>
                  {teacher.specialization && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {teacher.specialization}
                    </div>
                  )}
                </div>
                {teacher.id === currentTeacherId && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </button>
          ))
        ) : (
          <div className="p-4 text-center text-slate-500 dark:text-slate-400">
            {searchTerm ? 'No teachers found matching your search' : 'No teachers available'}
          </div>
        )}
      </div>
    </div>
  )
}
