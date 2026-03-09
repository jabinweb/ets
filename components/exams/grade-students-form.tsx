"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Save, Loader2 } from 'lucide-react'

interface Student {
  id: string
  name: string | null
  email: string | null
  studentNumber: string | null
}

interface ExistingResult {
  id: string
  studentId: string
  marksObtained: number
  grade: string | null
  remarks: string | null
}

interface GradeStudentsFormProps {
  examId: string
  students: Student[]
  existingResults: ExistingResult[]
  totalMarks: number
  passMarks: number
}

interface StudentGrade {
  studentId: string
  marksObtained: string
  grade: string
  remarks: string
}

export function GradeStudentsForm({
  examId,
  students,
  existingResults,
  totalMarks,
  passMarks
}: GradeStudentsFormProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [grades, setGrades] = useState<Record<string, StudentGrade>>(() => {
    const initial: Record<string, StudentGrade> = {}
    students.forEach(student => {
      const existing = existingResults.find(r => r.studentId === student.id)
      initial[student.id] = {
        studentId: student.id,
        marksObtained: existing?.marksObtained?.toString() || '',
        grade: existing?.grade || '',
        remarks: existing?.remarks || ''
      }
    })
    return initial
  })

  const calculateGrade = (marks: number): string => {
    const percentage = (marks / totalMarks) * 100
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B+'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C+'
    if (percentage >= 50) return 'C'
    if (percentage >= 40) return 'D'
    return 'F'
  }

  const handleMarksChange = (studentId: string, value: string) => {
    const marks = parseInt(value) || 0
    const autoGrade = value ? calculateGrade(marks) : ''
    
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: value,
        grade: autoGrade
      }
    }))
  }

  const handleGradeChange = (studentId: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        grade: value
      }
    }))
  }

  const handleRemarksChange = (studentId: string, value: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value
      }
    }))
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      // Filter out students with no marks entered
      const results = Object.values(grades).filter(g => g.marksObtained !== '')

      if (results.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Grades to Save',
          description: 'Please enter marks for at least one student'
        })
        setIsSaving(false)
        return
      }

      // Validate marks
      const invalidMarks = results.filter(r => {
        const marks = parseInt(r.marksObtained)
        return isNaN(marks) || marks < 0 || marks > totalMarks
      })

      if (invalidMarks.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Invalid Marks',
          description: `Marks must be between 0 and ${totalMarks}`
        })
        setIsSaving(false)
        return
      }

      const payload = results.map(r => ({
        examId,
        studentId: r.studentId,
        marksObtained: parseInt(r.marksObtained),
        grade: r.grade || null,
        remarks: r.remarks || null
      }))

      const response = await fetch('/api/exam-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ results: payload })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: `Grades saved for ${results.length} student(s)`
        })
        // Refresh the page to show updated results
        window.location.reload()
      } else {
        throw new Error(result.error || 'Failed to save grades')
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save grades'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-semibold border">Student</th>
              <th className="text-left p-3 font-semibold border w-32">Marks (/{totalMarks})</th>
              <th className="text-left p-3 font-semibold border w-24">Grade</th>
              <th className="text-left p-3 font-semibold border">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const studentGrade = grades[student.id]
              const marks = parseInt(studentGrade.marksObtained) || 0
              const isPassing = marks >= passMarks
              const hasMarks = studentGrade.marksObtained !== ''

              return (
                <tr key={student.id} className="border-b hover:bg-muted/20">
                  <td className="p-3 border">
                    <div>
                      <p className="font-medium">{student.name || 'Unknown'}</p>
                      {student.studentNumber && (
                        <p className="text-sm text-muted-foreground">{student.studentNumber}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border">
                    <Input
                      type="number"
                      min="0"
                      max={totalMarks}
                      value={studentGrade.marksObtained}
                      onChange={(e) => handleMarksChange(student.id, e.target.value)}
                      placeholder="0"
                      className={hasMarks ? (isPassing ? 'border-green-500' : 'border-red-500') : ''}
                    />
                  </td>
                  <td className="p-3 border">
                    <Input
                      value={studentGrade.grade}
                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                      placeholder="A"
                      maxLength={3}
                      className="uppercase"
                    />
                  </td>
                  <td className="p-3 border">
                    <Textarea
                      value={studentGrade.remarks}
                      onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                      placeholder="Optional remarks..."
                      rows={1}
                      className="min-h-[40px]"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          <p>Pass marks: {passMarks} ({Math.round((passMarks / totalMarks) * 100)}%)</p>
          <p className="text-xs mt-1">Grades are auto-calculated based on percentage</p>
        </div>
        <Button onClick={handleSaveAll} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Grades
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
