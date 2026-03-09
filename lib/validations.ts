import { z } from "zod"
import { Role, AttendanceStatus, ExamType, FeeType, AnnouncementType } from "@prisma/client"

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role),
})

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.date().optional(),
  gender: z.string().optional(), // Changed from z.nativeEnum(Gender) to z.string().optional()
  phone: z.string().optional(),
  address: z.string().optional(),
  admissionDate: z.date().optional(),
})

export const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  grade: z.number().min(1).max(12),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  teacherId: z.string().optional(),
})

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  description: z.string().optional(),
  credits: z.number().min(1, "Credits must be at least 1"),
})

export const attendanceSchema = z.object({
  classId: z.string(),
  date: z.date(),
  records: z.array(z.object({
    studentId: z.string(),
    status: z.nativeEnum(AttendanceStatus),
    notes: z.string().optional(),
  })),
})

export const examSchema = z.object({
  title: z.string().min(1, "Exam title is required"),
  description: z.string().optional(),
  type: z.nativeEnum(ExamType),
  classId: z.string(),
  subjectId: z.string(),
  date: z.date(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  totalMarks: z.number().min(1, "Total marks must be at least 1"),
  passMarks: z.number().min(0, "Pass marks cannot be negative"),
})

export const examResultSchema = z.object({
  examId: z.string(),
  studentId: z.string(),
  marksObtained: z.number().min(0, "Marks cannot be negative"),
  grade: z.string().optional(),
  remarks: z.string().optional(),
})

export const feeSchema = z.object({
  title: z.string().min(1, "Fee title is required"),
  type: z.nativeEnum(FeeType),
  amount: z.number().min(0, "Amount cannot be negative"),
  description: z.string().optional(),
  dueDate: z.date(),
})

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.nativeEnum(AnnouncementType),
  priority: z.number().min(1).max(5),
  classId: z.string().optional(),
  expiryDate: z.date().optional(),
})
