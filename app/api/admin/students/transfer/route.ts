import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const studentId = formData.get("studentId") as string
    const toClassId = formData.get("toClassId") as string | null
    const reason = formData.get("reason") as string | null
    const effectiveDate = formData.get("effectiveDate") as string
    const transferType = (formData.get("type") as string) || "CLASS_CHANGE"
    
    // External school transfer fields
    const isExternalTransfer = formData.get("isExternalTransfer") === "true"
    const externalSchoolName = formData.get("externalSchoolName") as string | null
    const externalSchoolAddress = formData.get("externalSchoolAddress") as string | null
    const externalSchoolContact = formData.get("externalSchoolContact") as string | null

    if (!studentId || !effectiveDate) {
      return NextResponse.json(
        { error: "Student ID and Effective Date are required" },
        { status: 400 }
      )
    }

    // Validate based on transfer type
    if (isExternalTransfer) {
      if (!externalSchoolName) {
        return NextResponse.json(
          { error: "External school name is required for school transfers" },
          { status: 400 }
        )
      }
    } else {
      if (!toClassId) {
        return NextResponse.json(
          { error: "Target class is required for internal transfers" },
          { status: 400 }
        )
      }
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Verify student exists and is a student
      const student = await tx.user.findUnique({
        where: { id: studentId },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              capacity: true,
              _count: {
                select: { students: true }
              }
            }
          }
        }
      })

      if (!student || student.role !== "STUDENT") {
        throw new Error("Student not found")
      }

      let targetClass = null
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let actualTransferType = transferType as any

      if (isExternalTransfer) {
        // External transfer - student leaving the school
        actualTransferType = "SCHOOL_TRANSFER_OUT"
      } else {
        // Internal transfer - verify target class exists
        targetClass = await tx.class.findUnique({
          where: { id: toClassId! },
          include: {
            _count: {
              select: { students: true }
            }
          }
        })

        if (!targetClass) {
          throw new Error("Target class not found")
        }

        // Check if student is already in the target class
        if (student.classId === toClassId) {
          throw new Error("Student is already in this class")
        }

        // Validate class capacity
        if (targetClass._count.students >= targetClass.capacity) {
          throw new Error(`Target class ${targetClass.name} is at full capacity (${targetClass.capacity} students)`)
        }

        // Determine transfer type - defaults to CLASS_CHANGE
        // Can be overridden by the transferType parameter if specified
      }

      // Check for existing pending transfers
      const existingPendingTransfer = await tx.transfer.findFirst({
        where: {
          studentId: studentId,
          status: "PENDING"
        }
      })

      if (existingPendingTransfer) {
        throw new Error("Student already has a pending transfer request")
      }

      // Create transfer record
      const transfer = await tx.transfer.create({
        data: {
          studentId: studentId,
          fromClassId: student.classId,
          toClassId: isExternalTransfer ? null : toClassId,
          type: actualTransferType,
          status: "APPROVED",
          reason: reason || (isExternalTransfer ? "Transfer to external school" : "Administrative transfer"),
          effectiveDate: new Date(effectiveDate),
          requestedById: session.user.id!,
          approvedById: session.user.id!,
          academicYear: new Date().getFullYear().toString(),
          completedDate: new Date(),
          // External transfer fields
          isExternalTransfer: isExternalTransfer,
          externalSchoolName: externalSchoolName,
          externalSchoolAddress: externalSchoolAddress,
          externalSchoolContact: externalSchoolContact,
        },
        include: {
          student: {
            select: {
              name: true,
              email: true,
              studentNumber: true
            }
          },
          fromClass: {
            select: {
              name: true,
              grade: true
            }
          },
          toClass: {
            select: {
              name: true,
              grade: true
            }
          }
        }
      })

      // Update student's status
      if (isExternalTransfer) {
        // For external transfer, remove from current class
        await tx.user.update({
          where: { id: studentId },
          data: {
            classId: null
          }
        })
      } else {
        // For internal transfer, update to new class
        await tx.user.update({
          where: { id: studentId },
          data: {
            classId: toClassId
          }
        })
      }

      return transfer
    })

    // In a production system, you would also:
    // 1. Send email notifications to student, parents, and teachers
    // 2. Update related records (clear timetable preferences, reassign lockers, etc.)
    // 3. Generate transfer certificate/document
    // 4. Log activity in audit trail
    // 5. Trigger webhook for external systems

    // Return success with transfer details
    return NextResponse.redirect(
      new URL(`/admin/students/transfers?success=true&transferId=${result.id}`, request.url)
    )
  } catch (error) {
    console.error("Transfer error:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Failed to process transfer"
    
    return NextResponse.redirect(
      new URL(`/admin/students/transfers?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
}

// Get transfer history
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (studentId) {
      where.studentId = studentId
    }
    
    if (status && status !== "all") {
      where.status = status.toUpperCase()
    }

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentNumber: true,
              image: true
            }
          },
          fromClass: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true
            }
          },
          toClass: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true
            }
          },
          requestedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          approvedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          rejectedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: limit,
        skip: offset
      }),
      prisma.transfer.count({ where })
    ])

    return NextResponse.json({
      transfers,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error("Failed to fetch transfers:", error)
    return NextResponse.json(
      { error: "Failed to fetch transfer history" },
      { status: 500 }
    )
  }
}
