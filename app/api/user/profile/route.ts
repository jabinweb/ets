import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized"
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || session.user.email
    
    console.log('Profile API called for email:', email);

    // Try database lookup for real users
    console.log('Attempting database lookup for:', email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        studentNumber: true,
        classId: true,
        qualification: true,
        specialization: true,
        experience: true,
        salary: true,
        dateOfJoining: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        address: true,
        parentName: true,
        parentEmail: true,
        parentPhone: true,
        medicalInfo: true,
        previousSchool: true,
        emergencyContact: true,
        bio: true,
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true
          }
        }
      }
    })

    if (!user) {
      console.log('User not found in database for email:', email);
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    console.log('User found in database:', user.email);

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        salary: user.salary ? Number(user.salary) : null
      }
    })

  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch user profile"
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const updateData: Prisma.UserUpdateInput = {
      name: body.name,
      phone: body.phone,
      address: body.address,
      bio: body.bio,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
    }

    // Add role-specific fields
    if (session.user.role === 'STUDENT') {
      updateData.parentName = body.parentName
      updateData.parentEmail = body.parentEmail
      updateData.parentPhone = body.parentPhone
      updateData.emergencyContact = body.emergencyContact
      updateData.gender = body.gender
      updateData.medicalInfo = body.medicalInfo
      updateData.previousSchool = body.previousSchool
    } else if (session.user.role === 'TEACHER') {
      updateData.qualification = body.qualification
      updateData.specialization = body.specialization
      updateData.experience = body.experience ? parseInt(body.experience) : null
      updateData.emergencyContact = body.emergencyContactTeacher
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        studentNumber: true,
        classId: true,
        qualification: true,
        specialization: true,
        experience: true,
        salary: true,
        dateOfJoining: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        address: true,
        parentName: true,
        parentEmail: true,
        parentPhone: true,
        medicalInfo: true,
        previousSchool: true,
        emergencyContact: true,
        bio: true,
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
