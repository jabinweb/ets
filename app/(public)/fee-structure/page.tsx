"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHero } from '@/components/ui/page-hero'
import { CheckCircle2, AlertCircle, Mail, DollarSign } from 'lucide-react'

export default function FeeStructurePage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Fee Structure"
        description="Affordable theological education with flexible payment plans designed to help you pursue your calling without financial barriers."
        badge={{
          icon: DollarSign,
          text: "Investment in Ministry"
        }}
        gradient="purple"
      />

      {/* Fee Plans Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* First Plan */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b-2 border-primary/20">
                <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">
                  Standard Plan - Pay Per Session
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-8 space-y-8">
                  {/* Online Sessions */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-3 text-sm">1</span>
                      Online Sessions
                    </h3>
                    <div className="ml-11 space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span>Registration Fee (per session)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹500</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span>Course Fee (₹500 per subject × 4 subjects)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹2,000</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-primary/5 px-4 rounded-lg mt-3">
                        <span className="font-bold text-slate-900 dark:text-white">Total per Online Session</span>
                        <span className="font-bold text-lg text-primary">₹2,500</span>
                      </div>
                    </div>
                  </div>

                  {/* Onsite Sessions */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-3 text-sm">2</span>
                      Onsite Sessions
                    </h3>
                    <div className="ml-11 space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span>Registration Fee</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹500</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span>Course Fee (₹500 per subject × 4 subjects)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹2,000</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-primary/5 px-4 rounded-lg mt-3">
                        <span className="font-bold text-slate-900 dark:text-white">Total per Onsite Session</span>
                        <span className="font-bold text-lg text-primary">₹2,500</span>
                      </div>
                    </div>
                  </div>

                  {/* Yearly Breakdown */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-3 text-sm">3</span>
                      Annual Total
                    </h3>
                    <div className="ml-11 space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between items-center py-2">
                        <span>3 Online Sessions</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹7,500</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span>2 Onsite Sessions</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹5,000</span>
                      </div>
                      <div className="flex justify-between items-center py-4 bg-gradient-to-r from-primary to-primary/90 text-white px-4 rounded-lg mt-4">
                        <span className="font-bold text-lg">Annual Total</span>
                        <span className="font-bold text-2xl">₹12,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Second Plan */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b-2 border-primary/20">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                    SAVE ₹3,500
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                    Package Plan - Annual Payment
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-8 space-y-8">
                  {/* Package Details */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-3 text-sm">1</span>
                      Package Details
                    </h3>
                    <div className="ml-11">
                      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold text-slate-900 dark:text-white">Cost per Branch</span>
                          <span className="font-bold text-xl text-primary">₹1,000</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">One-time payment covers all subjects in each branch</p>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white mb-3">Four Theological Branches:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {['Systematic Theology', 'Historical Theology', 'Biblical Theology', 'Practical Theology'].map((branch) => (
                              <div key={branch} className="flex items-center text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                                <span className="text-sm">{branch}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Annual Breakdown */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-3 text-sm">2</span>
                      Annual Total
                    </h3>
                    <div className="ml-11 space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span>Registration Fee (Online + Onsite)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹1,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span>Online Courses (4 branches × ₹1,000)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹4,000</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                        <span>Onsite Courses (4 branches × ₹1,000)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">₹4,000</span>
                      </div>
                      <div className="flex justify-between items-center py-4 bg-gradient-to-r from-primary to-primary/90 text-white px-4 rounded-lg mt-4">
                        <span className="font-bold text-lg">Annual Package Total</span>
                        <span className="font-bold text-2xl">₹9,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Note */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">Payment Flexibility</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        If paying the full amount at once is challenging, you may opt for three installments. However, failure to complete payments as agreed will result in removal from the program. We encourage you to pray earnestly and seek God's provision—if it is His will, He will make a way for your studies at ACA.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="p-0">
                <div className="p-8 text-center">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-xl">Questions About Fees?</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">Contact us for clarification or assistance with payment arrangements.</p>
                  <div className="flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300">
                    <Mail className="h-5 w-5 text-primary" />
                    <a 
                      href="mailto:ets@acaindia.org" 
                      className="font-semibold text-primary hover:text-primary/80 transition-colors text-lg"
                    >
                      ets@acaindia.org
                    </a>
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
