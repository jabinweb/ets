"use client"

import { Card, CardContent } from '@/components/ui/card'
import { PageHero } from '@/components/ui/page-hero'
import { Home, Utensils, Dumbbell, Stethoscope, Store } from 'lucide-react'
import Image from 'next/image'

export default function CampusPage() {
  const facilities = [
    {
      icon: Home,
      title: 'Residential Facilities',
      description: 'ETS provides separate hostel facilities for both men and women, with comfortable accommodation and essential amenities for about 100 single students.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      icon: Utensils,
      title: 'Cafeteria & Kitchen',
      description: 'Modern cafeteria and kitchen facilities catering to about 250 people at a time, with menus considering varied regional tastes.',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20'
    },
    {
      icon: Dumbbell,
      title: 'Recreational Activities',
      description: 'Sports facilities including basketball, throwball, lawn tennis, badminton, volleyball courts, football field and swimming pool.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-900'
    },
    {
      icon: Stethoscope,
      title: 'Medical Assistance',
      description: '24-hour hospital staffed with resident medical officers and a medical lab for the health and wellbeing of students.',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-900'
    },
    {
      icon: Store,
      title: 'Shopping & Essentials',
      description: 'Full-fledged department store and House of Love for exchanging materials to meet the needs of the ACA family.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-900'
    }
  ]

  return (
    <div className="min-h-screen">
      <PageHero
        title="Life at Evangelical Theological Seminary"
        description="Experience holistic growth through our comprehensive residential and recreational facilities designed to support your spiritual and academic journey."
        badge={{
          icon: Home,
          text: "ETS Life"
        }}
        gradient="blue"
      />

      {/* Campus Image Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=90"
                alt="ACA Campus in Patiala"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Our Permanent Campus</h3>
                <p className="text-lg opacity-90">Patiala, Punjab</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Life Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-slate-900 dark:text-white">
                Residential & Campus Facilities
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                ETS provides comprehensive facilities to support your spiritual, academic, and personal growth during your theological education.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {facilities.map((item, index) => (
                <Card 
                  key={index} 
                  className={`border-2 ${item.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <CardContent className="p-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${item.bgColor} mb-6`}>
                      <item.icon className={`h-8 w-8 ${item.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Intensive Sessions Highlight */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/30 shadow-2xl bg-white dark:bg-slate-800">
              <CardContent className="p-8 md:p-12">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                    <Home className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    Residential & Community Life
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    At ETS, we believe that spiritual and academic growth flourishes in a supportive, comfortable environment. Our residential facilities provide a home away from home where students from diverse backgrounds can live, learn, and grow together in faith.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">~100</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Students Served</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">4</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Facility Types</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Support Available</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700">
              <CardContent className="p-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      Detailed Facilities Information
                    </h3>
                    
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-slate-800 dark:text-white">Hostels for Single Students</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        ETS provides separate hostel facilities for both men and women, "House of Fellowship" and "House of Harmony" for men and "House of Grace" for women. Located within the campus, the hostels provide affordable, homely and safe accommodation for about 100 single students. The hostels have spacious and airy buildings with well-furnished rooms. A cot, mattress, table, chair, and a cupboard are provided for each student. Purified drinking water and running hot and cold water are available round the clock in the hostel. While only twin sharing rooms are available for men, a few single occupancy rooms are available for women which are usually assigned to graduating/senior students.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-slate-800 dark:text-white">Family Quarters</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        Apart from the hostels for the single students, a few well-furnished single and double bedroom quarters are available for married students within the campus. For availing this facility, the students should apply to the Registrar during the admission process. The Higher Secondary School within the campus is an ideal place where your children can get good education.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-slate-800 dark:text-white">Cafeteria Facilities</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        The ETS cafeteria and a kitchen with modern amenities can cater to about 250 people at a time. The menu takes into consideration the varied tastes of the student body, who are from all the regions of India. A dairy farm and other agricultural ventures are undertaken to provide clean and healthy food to our staff and students.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-slate-800 dark:text-white">Recreational & Medical Facilities</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        ETS provides enough healthy opportunities for physical, mental, emotional and spiritual entertainment of students. Facilities such as basketball, throwball, lawn tennis, badminton, volleyball courts, a football field and a swimming pool are additional features of the ETS campus. The campus' roads are paved and lighted to provide a safe and beautiful living environment. The campus also has parks and fellowship centers for quiet time and reflection. The campus has a 24-hour hospital which is staffed with resident medical officers and a medical lab.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-slate-800 dark:text-white">Additional Services</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        House of Love is a place to exchange materials that would meet the needs of individual believers who are members of the ACA family. A full-fledged department store in the campus caters to the needs of the students and their families. All the provisions necessary for families are available at the supermarket.
                      </p>
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
