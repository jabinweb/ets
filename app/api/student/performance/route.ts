import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user and verify they are a student
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        class: {
          include: {
            subjects: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get student's performance data
    const subjectPerformances = await prisma.subjectPerformance.findMany({
      where: {
        studentId: user.id
      },
      include: {
        subject: true
      }
    });

    // Transform data for mobile app
    const performanceData = subjectPerformances.map(performance => {
      const percentage = performance.currentGrade ? getGradePercentage(performance.currentGrade) : 0;
      const color = getGradeColor(performance.currentGrade || 'F');
      
      return {
        subject: performance.subject.name,
        currentGrade: performance.currentGrade || 'N/A',
        currentPercentage: percentage,
        assignmentAverage: performance.assignmentAverage || 0,
        examAverage: performance.examAverage || 0,
        color: color
      };
    });

    return NextResponse.json(performanceData);
  } catch (error) {
    console.error('Error fetching student performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

function getGradePercentage(grade: string): number {
  const gradeMap: { [key: string]: number } = {
    'A+': 97,
    'A': 93,
    'A-': 90,
    'B+': 87,
    'B': 83,
    'B-': 80,
    'C+': 77,
    'C': 73,
    'C-': 70,
    'D+': 67,
    'D': 63,
    'D-': 60,
    'F': 0
  };
  return gradeMap[grade] || 0;
}

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#10B981'; // Green
  if (grade.startsWith('B')) return '#3B82F6'; // Blue
  if (grade.startsWith('C')) return '#F59E0B'; // Yellow
  if (grade.startsWith('D')) return '#EF4444'; // Red
  return '#6B7280'; // Gray for F or N/A
}
