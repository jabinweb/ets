import { Metadata } from "next";
import Link from "next/link";
import { Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Faith Values | ETS",
  description: "The fundamental aspects that define our theological foundation and educational philosophy at Evangelical Theological Seminary.",
};

const values = [
  {
    number: 1,
    title: "Fundamental Baptist Beliefs",
    description: "Our institution aligns with Fundamental Baptist beliefs and adheres to dispensational theology."
  },
  {
    number: 2,
    title: "Salvation by Grace Alone",
    description: "In our Soteriology, we hold to the doctrine of Election, affirming that Salvation is by Grace alone, through Faith alone, in Christ alone."
  },
  {
    number: 3,
    title: "Premillennial Eschatology",
    description: "In our eschatology, we affirm a premillennial, pretribulational return of the Lord Jesus Christ and His millennial earthly Kingdom."
  },
  {
    number: 4,
    title: "Congregational Ecclesiology",
    description: "We uphold a congregational approach to ecclesiology, emphasizing the importance of the local church. All ministries, both local and global, must be governed by her in association with other local churches of like faith."
  },
  {
    number: 5,
    title: "Cessationist Position",
    description: "We are cessationists concerning tongues, signs and wonders, and spiritual gifts."
  },
  {
    number: 6,
    title: "Literal Biblical Hermeneutics",
    description: "Our interpretation of Scripture is based on Literal, Grammatical, Historical Hermeneutics."
  },
  {
    number: 7,
    title: "Great Commission Missiology",
    description: "We emphasize the Great Commission Missiology, reflecting our urgency and commitment to spreading the Gospel worldwide, driven by the belief in Christ's imminent return."
  }
];

export default function FaithValuesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 mb-6">
              <Heart className="h-5 w-5 text-white" />
              <span className="text-sm font-bold text-white">Our Foundation</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Faith Values
            </h1>
            
            <p className="text-xl text-slate-300 leading-relaxed">
              Seven fundamental aspects that define our theological foundation and educational philosophy at North India Baptist Seminary.
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value) => (
                <div
                  key={value.number}
                  className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-8 hover:border-primary/30 transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="text-lg font-bold text-primary">{value.number}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                        {value.title}
                      </h3>
                      
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Context Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                Our Commitment
              </h2>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  These seven fundamental aspects represent the core of our theological identity and guide every area of ministry and education at ACA. They reflect our unwavering commitment to biblical truth and our dedication to preparing faithful servants of Christ.
                </p>
                
                <p>
                  Our alignment with Fundamental Baptist beliefs and dispensational theology provides the framework for our understanding of Scripture, salvation, and the church's mission in the world. We hold these convictions not as mere academic positions, but as living truths that shape our community and ministry.
                </p>
                
                <p>
                  By maintaining these values, we ensure that every graduate of ACA is thoroughly equipped with sound doctrine and a clear understanding of God's Word, ready to serve faithfully in whatever calling God has placed upon their lives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Learn More About ACA
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Explore our complete Statement of Faith or learn more about our academic programs and how we apply these values in theological education.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/about/statement-of-faith">
                  Statement of Faith
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/programs">
                  View Programs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
