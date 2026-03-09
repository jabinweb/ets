import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { FacultyMemberProfile } from "@/components/faculty/faculty-member-profile"

interface FacultyMemberPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function FacultyMemberPage({ params }: FacultyMemberPageProps) {
  const { id } = await params

  const facultyMember = await prisma.user.findUnique({
    where: {
      id: id,
      role: "TEACHER"
    },
    include: {
      teacherSubjects: {
        include: {
          subject: true
        }
      },
      classTeacher: {
        include: {
          students: true
        }
      }
    }
  })

  if (!facultyMember) {
    notFound()
  }

  // Transform data for the component
  const formattedFacultyMember = {
    id: facultyMember.id,
    name: facultyMember.name || "Faculty Member",
    email: facultyMember.email,
    image: facultyMember.image || "https://images.unsplash.com/photo-1577375729152-4c8b5fcda381?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    qualification: facultyMember.qualification || "Qualified Educator",
    specialization: facultyMember.specialization || "General Education",
    experience: facultyMember.experience,
    bio: facultyMember.bio || `${facultyMember.name} is a dedicated educator committed to student success.`,
    dateOfJoining: facultyMember.dateOfJoining,
    subjects: facultyMember.teacherSubjects.map(ts => ts.subject.name),
    classes: facultyMember.classTeacher.map(cls => ({
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      studentCount: cls.students.length
    }))
  }

  return <FacultyMemberProfile facultyMember={formattedFacultyMember} />
}
