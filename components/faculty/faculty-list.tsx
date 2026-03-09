"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, GraduationCap, Award, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type FacultyMember = {
  id: string
  name: string
  role: string
  department: string
  image: string
  qualifications: string
  experience: string
  description: string
  email: string
}

type FacultyListProps = {
  facultyMembers: FacultyMember[]
}

export function FacultyList({ facultyMembers }: FacultyListProps) {

  return (
    <>
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
          Our Leadership in <span className="text-primary">Education</span>
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Our faculty brings together experienced educators, subject matter experts, and caring mentors
          who are dedicated to helping each student reach their full potential.
        </p>
      </div>

      {facultyMembers.length === 0 ? (
        <div className="text-center p-10">
          <p className="text-slate-500 dark:text-slate-400">No faculty members found.</p>
        </div>
      ) : (
        /* Faculty Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {facultyMembers.map((member) => (
            <Card key={member.id} className="group overflow-hidden border-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl flex flex-col">
              <div className="relative h-72 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized={member.image.includes('cdn-icons-png')}
                />
                {/* Subtle Navy Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D103F]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-[#981b1e] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                    {member.department}
                  </span>
                </div>
              </div>

              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[#0D103F] dark:text-white mb-1 group-hover:text-[#981b1e] transition-colors duration-300 line-clamp-1">
                    {member.name}
                  </h3>
                  <p className="text-[#C9A84C] text-sm font-semibold uppercase tracking-wider">
                    {member.role}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mr-3 group-hover:bg-[#0D103F]/5 transition-colors">
                      <GraduationCap className="h-4 w-4 text-[#0D103F]" />
                    </div>
                    <span className="font-medium line-clamp-1">{member.qualifications}</span>
                  </div>

                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mr-3 group-hover:bg-[#0D103F]/5 transition-colors">
                      <Award className="h-4 w-4 text-[#0D103F]" />
                    </div>
                    <span className="font-medium">{member.experience} exp.</span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0D103F] dark:text-slate-300 font-semibold px-0">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button asChild className="bg-[#0D103F] hover:bg-[#1a1e5a] text-white shadow-lg shadow-[#0D103F]/20 px-0">
                    <Link href={`/faculty/${member.id}`}>
                      Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Join Our Team CTA */}
      <div className="mt-20 bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-2xl max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
            Join Our Teaching Team
          </h3>
          <p className="text-slate-600 dark:text-slate-300">
            We&apos;re always looking for passionate educators to join our community.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            View Open Positions
          </Button>
          <Button variant="outline">
            Learn About Benefits
          </Button>
        </div>
      </div>
    </>
  )
}
