import { PageHero } from "@/components/ui/page-hero"
import { Card } from "@/components/ui/card"
import { FileText, BookOpen, Award, AlertTriangle, Scale, CheckCircle, Info } from "lucide-react"

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Terms of Use"
        description="Please read these terms carefully before using our website and services."
        badge={{ iconName: "FileText", text: "Legal" }}
        gradient="gray"
      />

      <div className="container mx-auto px-4 py-16">
        <Card className="p-8 mb-8 bg-white dark:bg-slate-900 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200/80 dark:bg-slate-800/80 mb-4">
                <Scale className="h-8 w-8 text-slate-700 dark:text-slate-300" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                These terms govern your use of North India Baptist Seminary&apos;s website and digital services.
              </p>
            </div>

            <div className="space-y-10">
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Effective Date: June 1, 2024</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  By accessing or using our seminary website, online portal, or related digital services,
                  you agree to be bound by these Terms of Use. If you do not agree, please do not use our services.
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  <span>1. Acceptance of Terms</span>
                </h2>
                <div className="pl-8 border-l-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <p className="mb-2">
                    By accessing or using this site, you agree to be bound by these Terms of Use
                    and all applicable laws and regulations.
                  </p>
                  <p>
                    If you are accepting these terms on behalf of a seminary student, you represent that
                    you have legal authority to do so.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  <span>2. Use of Site</span>
                </h2>
                <div className="pl-8 border-l-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <p>
                    You agree to use the site only for lawful purposes and in a way that does not
                    infringe on the rights of others or restrict their use.
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-1">
                    <li>Access educational materials and theological resources provided by the seminary</li>
                    <li>Submit assignments and view academic progress</li>
                    <li>Communicate with faculty and staff through approved channels</li>
                    <li>Access seminary announcements and important information</li>
                  </ul>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Award className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  <span>3. Intellectual Property</span>
                </h2>
                <div className="pl-8 border-l-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <p>
                    All content, design, text, graphics, and code on this site are the property of
                    North India Baptist Seminary or its licensors and protected by copyright laws.
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  <span>4. Disclaimers & Limitation of Liability</span>
                </h2>
                <div className="pl-8 border-l-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <p>
                    This site is provided &quot;as is&quot; without warranties of any kind. North India Baptist Seminary
                    is not liable for any damages arising from your use of the site.
                  </p>
                </div>
              </section>

              <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  If you have any questions about these Terms of Use, please contact us at:
                </p>
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <FileText className="h-5 w-5" />
                  <a href="mailto:ets@acaindia.org" className="font-medium hover:underline">
                    ets@acaindia.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
