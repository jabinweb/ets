import { PageHero } from '@/components/ui/page-hero'
import { Card } from '@/components/ui/card'
import {
  Accessibility,
  Keyboard,
  Eye,
  ScreenShare,
  Languages,
  MessageSquare,
  Phone,
  CheckSquare
} from 'lucide-react'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Accessibility"
        description="Our commitment to making our website accessible to everyone."
        badge={{ iconName: 'Accessibility', text: 'Inclusive' }}
        gradient="blue"
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
            <Accessibility className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Accessibility Statement</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            North India Baptist Seminary is committed to ensuring digital accessibility for people of all abilities.
            We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-6 hover:shadow-lg transition-all border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Visual Accessibility</h2>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>High contrast mode available</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Text resizing without loss of functionality</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Alt text for all informative images</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Keyboard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Keyboard Navigation</h2>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Full keyboard accessibility</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Skip to content functionality</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Logical tab order</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <ScreenShare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Screen Readers</h2>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>ARIA landmarks for key sections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Descriptive link text</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Semantic HTML structure</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Languages className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Language & Content</h2>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Clear, simple language</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Consistent navigation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Translation options</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 mb-8 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Accessibility Commitment</h2>

          <div className="space-y-8">
            <p className="text-slate-700 dark:text-slate-300">
              We are committed to making our website accessible in accordance with:
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl">
                <h3 className="font-semibold mb-2">WCAG 2.1 Level AA</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl">
                <h3 className="font-semibold mb-2">ADA Compliance</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Our site follows Americans with Disabilities Act standards for accessible design.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-lg mb-4">Accessibility Features</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Our website includes the following accessibility features:
              </p>
              <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span>Resizable text</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span>Alt text for images</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span>Color contrast compliance</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span>Keyboard navigation</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span>ARIA attributes</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  <span>Screen reader compatibility</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Contact Us About Accessibility</h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <p className="text-slate-700 dark:text-slate-300 mb-6 text-center">
              We welcome your feedback on the accessibility of our website. Please contact us if you encounter any barriers:
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Email</div>
                  <a href="mailto:accessibility@greenwoodhigh.edu" className="text-primary hover:underline">
                    accessibility@greenwoodhigh.edu
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Phone</div>
                  <a href="tel:+15551234567" className="text-primary hover:underline">
                    (555) 123-4567
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
