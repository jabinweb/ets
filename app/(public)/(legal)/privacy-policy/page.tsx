import { PageHero } from "@/components/ui/page-hero"
import { Card } from "@/components/ui/card"
import { Shield, Lock, Eye, Check, Users, Server, Scale, Bell } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information."
        badge={{ iconName: "Shield", text: "Privacy" }}
        gradient="blue"
      />

      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 mb-8 bg-white dark:bg-slate-900 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Our Privacy Commitment</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                At North India Baptist Seminary, we take your privacy seriously. This policy explains how we handle your information.
              </p>
            </div>

            <div className="space-y-12">
              <section className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      We collect information you provide directly (e.g., name, email) and data
                      automatically (e.g., usage, cookies).
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Personal information provided during application and enrollment</li>
                      <li>Academic records and performance data</li>
                      <li>Financial information for billing purposes</li>
                      <li>Usage data from our website and learning platforms</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">2. How We Use Information</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      Your data helps us deliver educational services, personalize learning experiences, and improve our
                      programs. We do not sell your personal information.
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">3. Cookies & Tracking</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      We use cookies and similar technologies for site functionality and analytics.
                      You can manage cookie preferences in your browser.
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">4. Data Sharing</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      We may share information with service providers and when required by law.
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      We implement reasonable security measures to protect your information but
                      cannot guarantee absolute security.
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      You may access, update, or delete your data by contacting us at&nbsp;
                      <a href="mailto:privacy@greenwoodhigh.edu" className="text-primary hover:underline">privacy@greenwoodhigh.edu</a>.
                    </p>
                    <p>
                      Parents have the right to review their child&apos;s educational records and request corrections if needed.
                    </p>
                  </div>
                </div>
              </section>

              <section className="flex gap-6">
                <div className="shrink-0 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">7. Changes to Policy</h2>
                  <div className="space-y-4 text-slate-700 dark:text-slate-300">
                    <p>
                      We may revise this policy; the updated version will appear on this page
                      with a revised effective date. Significant changes will be communicated directly to parents and students.
                    </p>
                  </div>
                </div>
              </section>

              <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  For questions about this Privacy Policy, please contact:
                </p>
                <div className="flex items-center gap-2 text-primary">
                  <Lock className="h-5 w-5" />
                  <a href="mailto:privacy@greenwoodhigh.edu" className="font-medium hover:underline">
                    privacy@greenwoodhigh.edu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Last updated: June 1, 2024
        </div>
      </div>
    </div>
  )
}
