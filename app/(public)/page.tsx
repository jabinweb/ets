import { Metadata } from 'next'
import { HeroSection } from '@/components/landing/hero-section'
import { AboutSection } from '@/components/landing/about-section'
import { FivePillarsSection } from '@/components/landing/five-pillars-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { IntroVideoSection } from '@/components/landing/intro-video-section'
import { EtsLifeSection } from '@/components/landing/ets-life-section'

export const metadata: Metadata = {
  title: 'Evangelical Theological Seminary | Training Faithful Servants',
  description: 'An Institute of Asian Christian Academy of India',
}

export default function SeminaryHomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <IntroVideoSection />
      <FivePillarsSection />
      <EtsLifeSection />
      <FeaturesSection />
      <TestimonialsSection />
    </div>
  )
}
