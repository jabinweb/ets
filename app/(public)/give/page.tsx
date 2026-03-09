"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/ui/page-hero'
import { Heart, GraduationCap, Globe, Building2, HandHeart, Users, TrendingUp, Mail, CreditCard, Banknote } from 'lucide-react'
import Link from 'next/link'

export default function GivePage() {
  const paymentMethods = [
    {
      icon: CreditCard,
      title: 'UPI Payment',
      description: 'Instant bank transfer using UPI ID',
      details: 'upi.etsaca@sib',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-900'
    },
    {
      icon: Banknote,
      title: 'Bank Transfer',
      description: 'Direct bank account transfer',
      details: 'Account #0970053000000011',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-900'
    }
  ]

  return (
    <div className="min-h-screen">
      <PageHero
        title="Make a Payment"
        description="At Evangelical Theological Seminary (ETS), we are committed to training and equipping expository preachers, theological educators, and scholars to serve in India and Asia. Your payments support our mission and help maintain quality theological education."
        badge={{
          icon: Heart,
          text: "Payment Information"
        }}
        gradient="green"
      />

      {/* Payment Instructions Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-slate-900 dark:text-white">
                Payment Instructions
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Follow these important steps when making your payment
              </p>
            </div>

            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
              <CardContent className="p-8 md:p-12 space-y-6">
                <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                    <strong>Important!</strong> Write your name and purpose in the comments/remarks section while making the payment. This will help us to track the payment.
                  </p>
                </div>
                
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  If your name is Albert, then kindly write "<strong>Application fee for Albert</strong>". (Important !)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-slate-900 dark:text-white">
                Payment Methods
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Choose your preferred payment method
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {paymentMethods.map((method, index) => (
                <Card 
                  key={index} 
                  className={`border-2 ${method.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 group`}
                >
                  <CardContent className="p-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${method.bgColor} mb-6 group-hover:scale-110 transition-transform`}>
                      <method.icon className={`h-8 w-8 ${method.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                      {method.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                      {method.description}
                    </p>
                    
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
                      <p className="font-mono text-slate-800 dark:text-slate-200 break-all">
                        {method.details}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bank Transfer Details */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-slate-900 dark:text-white">
                Bank Transfer Details
              </h2>
            </div>

            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
              <CardContent className="p-8 md:p-12 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Account Number:</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 font-mono">0970053000000011</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Account Name:</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300">Evangelical Theological Seminary</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Bank:</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300">South Indian Bank</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">IFSC Code:</h3>
                    <p className="text-lg text-slate-600 dark:text-slate-300 font-mono">SIBL0000571</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* UPI Details */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-slate-900 dark:text-white">
                UPI Payment
              </h2>
            </div>

            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-xl">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
                  <CreditCard className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">UPI ID</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg inline-block">
                  <p className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200 break-all">
                    upi.etsaca@sib
                  </p>
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-300 mt-4">
                  Use this UPI ID for instant bank transfers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/30 shadow-2xl bg-white dark:bg-slate-800">
              <CardContent className="p-12 text-center space-y-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mb-4">
                  <Heart className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  Thank You for Your Support
                </h2>
                <div className="space-y-3 text-xl text-slate-600 dark:text-slate-300">
                  <p className="font-semibold">Your payments help sustain our mission,</p>
                  <p className="font-semibold">enable quality theological education,</p>
                  <p className="font-semibold">and support future ministry leaders.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Button size="lg" className="bg-primary hover:bg-primary-dark text-white h-14 px-10 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all text-lg">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Make Payment
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary/5 h-14 px-10 rounded-full font-semibold text-lg">
                    <Mail className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="mt-12 text-center">
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                For questions about payments or to discuss partnership opportunities:
              </p>
              <a 
                href="mailto:ets@acaindia.org" 
                className="text-lg font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                ets@acaindia.org
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}