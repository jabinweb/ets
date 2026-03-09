"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, ArrowRight, Building2, School } from "lucide-react"

interface Student {
  id: string
  name: string | null
  email: string
  studentNumber: string | null
  class: {
    id: string
    name: string
    grade: number
  } | null
}

interface Class {
  id: string
  name: string
  grade: number
}

interface TransferDialogProps {
  students: Student[]
  classes: Class[]
  preselectedStudent?: Student
}

export function TransferDialog({ students, classes, preselectedStudent }: TransferDialogProps) {
  const [transferType, setTransferType] = useState<"internal" | "external">("internal")
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {preselectedStudent ? (
          <Button size="sm">
            <ArrowRight className="h-4 w-4 mr-1" />
            Transfer
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Transfer Student
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form action="/api/admin/students/transfer" method="POST" onSubmit={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {preselectedStudent ? `Transfer ${preselectedStudent.name}` : "Transfer Student"}
            </DialogTitle>
            <DialogDescription>
              {transferType === "internal" 
                ? "Move student to a different class within the school" 
                : "Transfer student to an external school"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Transfer Type Selection */}
            <div className="space-y-3">
              <Label>Transfer Type</Label>
              <RadioGroup 
                value={transferType} 
                onValueChange={(value) => setTransferType(value as "internal" | "external")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 flex-1 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="internal" id="internal" />
                  <Label htmlFor="internal" className="flex items-center gap-2 cursor-pointer flex-1">
                    <School className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Internal Transfer</div>
                      <div className="text-xs text-muted-foreground">Within this school</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 flex-1 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="external" id="external" />
                  <Label htmlFor="external" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Building2 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">External Transfer</div>
                      <div className="text-xs text-muted-foreground">To another school</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              <input type="hidden" name="isExternalTransfer" value={transferType === "external" ? "true" : "false"} />
            </div>

            {/* Student Selection */}
            {!preselectedStudent && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student</Label>
                <Select name="studentId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.studentNumber || 'No ID'})
                        {student.class && ` - ${student.class.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {preselectedStudent && (
              <input type="hidden" name="studentId" value={preselectedStudent.id} />
            )}

            {transferType === "internal" ? (
              <>
                {/* Internal Transfer Fields */}
                {preselectedStudent?.class && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <span className="text-sm font-medium">Current:</span>
                    <span className="px-2 py-1 bg-background rounded text-sm">{preselectedStudent.class.name}</span>
                    <ArrowRight className="h-4 w-4 mx-2" />
                    <span className="text-sm text-muted-foreground">New Class</span>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="toClassId">Transfer To Class</Label>
                  <Select name="toClassId" required={transferType === "internal"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem 
                          key={cls.id} 
                          value={cls.id}
                          disabled={preselectedStudent?.class?.id === cls.id}
                        >
                          {cls.name} (Grade {cls.grade})
                          {preselectedStudent?.class?.id === cls.id && ' - Current'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                {/* External Transfer Fields */}
                <div className="space-y-2">
                  <Label htmlFor="externalSchoolName">External School Name *</Label>
                  <Input
                    id="externalSchoolName"
                    name="externalSchoolName"
                    placeholder="Enter school name"
                    required={transferType === "external"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalSchoolAddress">School Address</Label>
                  <Textarea
                    id="externalSchoolAddress"
                    name="externalSchoolAddress"
                    placeholder="Enter school address"
                    className="min-h-[60px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="externalSchoolContact">Contact Number</Label>
                  <Input
                    id="externalSchoolContact"
                    name="externalSchoolContact"
                    placeholder="Phone or email"
                    type="text"
                  />
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Transfer</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Enter reason for transfer (optional)"
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                type="date"
                id="effectiveDate"
                name="effectiveDate"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <ArrowRight className="h-4 w-4 mr-2" />
              Process Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
