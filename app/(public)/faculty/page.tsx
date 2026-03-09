import { prisma } from "@/lib/prisma"
import { FacultyList } from "@/components/faculty/faculty-list"
import { PageHero } from "@/components/ui/page-hero"

export default async function FacultyPage() {
  // Fetch faculty members from database
  const facultyMembers = await prisma.user.findMany({
    where: {
      role: "TEACHER"
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      qualification: true,
      specialization: true,
      experience: true,
      bio: true,
      teacherSubjects: {
        include: {
          subject: true
        }
      },
      dateOfJoining: true
    }
  })

  console.log(`Found ${facultyMembers.length} faculty members`)

  // Transform data to the format expected by the component
  const formattedFaculty = facultyMembers.map(teacher => {
    // Determine department based on specialization or first subject
    let department = teacher.specialization || "Faculty"
    if (!department && teacher.teacherSubjects.length > 0) {
      department = teacher.teacherSubjects[0].subject.name
    }

    // Calculate years of experience based on dateOfJoining if available
    let experience = teacher.experience ? `${teacher.experience} years` : "New Teacher"
    if (!teacher.experience && teacher.dateOfJoining) {
      const years = Math.floor((new Date().getTime() - teacher.dateOfJoining.getTime()) / (1000 * 60 * 60 * 24 * 365))
      experience = years > 0 ? `${years} years` : "New Teacher"
    }

    return {
      id: teacher.id,
      name: teacher.name || "Faculty Member",
      role: teacher.specialization || "Teacher",
      department: department,
      image: teacher.image || "https://cdn-icons-png.flaticon.com/512/9131/9131478.png", // Default image
      qualifications: teacher.qualification || "Qualified Educator",
      experience: experience,
      description: teacher.bio || `${teacher.name} is a dedicated educator specializing in ${department}.`,
      email: teacher.email
    }
  })

  return (
    <div className="min-h-screen">
      <PageHero
        title="Our Faculty & Leadership"
        description="Learn from world-class scholars and practitioners dedicated to your spiritual and academic growth."
        badge={{
          iconName: "GraduationCap",
          text: "Expository Excellence"
        }}
        gradient="gray"
        className="border-none"
      />

      <section className="py-24 bg-[#FCFBF8] dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <FacultyList
            facultyMembers={formattedFaculty}
          />
        </div>
      </section>
    </div>
  )
}
