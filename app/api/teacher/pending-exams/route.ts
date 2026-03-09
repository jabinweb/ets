import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user and verify they are a teacher
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get pending exams for this teacher's subjects
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: { teacherId: user.id },
      select: { subjectId: true }
    });

    const subjectIds = teacherSubjects.map(ts => ts.subjectId);

    const pendingExams = await prisma.exam.findMany({
      where: {
        subjectId: { in: subjectIds },
        date: { gte: new Date() } // Only future or current exams
      },
      include: {
        subject: true,
        class: true,
        results: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Transform data for mobile app
    const examData = pendingExams.map(exam => {
      const totalStudents = exam.class?.capacity || 0; // Using capacity since currentEnrollment doesn't exist
      const gradedCount = exam.results.filter((result) => result.marksObtained !== null).length;
      const pendingCount = totalStudents - gradedCount;

      return {
        title: `${exam.subject.name} - ${exam.title}`,
        className: exam.class?.name || 'Unknown Class',
        type: exam.type,
        total: totalStudents,
        pending: pendingCount,
        totalMarks: exam.totalMarks,
        date: exam.date.toISOString(),
        examId: exam.id
      };
    });

    return NextResponse.json(examData);
  } catch (error) {
    console.error('Error fetching pending exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending exams' },
      { status: 500 }
    );
  }
}
