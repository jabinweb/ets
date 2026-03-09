import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { studentId, classId } = body;

    if (!studentId || !classId) {
      return NextResponse.json(
        { error: 'Student ID and Class ID are required' },
        { status: 400 }
      );
    }

    // Verify student exists and is a student
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true, name: true }
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Invalid student ID' },
        { status: 400 }
      );
    }

    // Verify class exists
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      select: { 
        id: true, 
        name: true, 
        capacity: true,
        _count: {
          select: { students: true }
        }
      }
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    // Check if class is full
    if (classData._count.students >= classData.capacity) {
      return NextResponse.json(
        { error: 'Class is at full capacity' },
        { status: 400 }
      );
    }

    // Update student's class
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: { classId: classId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${student.name} has been assigned to ${classData.name}`,
      student: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        class: updatedStudent.class
      }
    });

  } catch (error) {
    console.error('Error assigning class:', error);
    return NextResponse.json(
      { error: 'Failed to assign class' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch unassigned students
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get all students without a class
    const unassignedStudents = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        classId: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        studentNumber: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get all available classes
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true,
        section: true,
        grade: true,
        capacity: true,
        _count: {
          select: { students: true }
        }
      },
      orderBy: {
        grade: 'asc'
      }
    });

    return NextResponse.json({
      unassignedStudents,
      classes: classes.map(c => ({
        ...c,
        currentEnrollment: c._count.students,
        availableSeats: c.capacity - c._count.students
      }))
    });

  } catch (error) {
    console.error('Error fetching unassigned students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
