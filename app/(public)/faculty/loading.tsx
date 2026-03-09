import { PageHero } from "@/components/ui/page-hero"
import { FacultySkeleton } from "@/components/faculty/faculty-skeleton"

export default function FacultyLoading() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Our Faculty & Staff"
        description="Meet our dedicated team of educators and support professionals"
        badge={{
          iconName: "GraduationCap",
          text: "Expert Educators"
        }}
        gradient="blue"
      />

      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Our Leadership in <span className="text-primary">Education</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Our faculty brings together experienced educators, subject matter experts, and caring mentors
              who are dedicated to helping each student reach their full potential.
            </p>
          </div>
          
          <FacultySkeleton />
        </div>
      </section>
    </div>
  )
}
