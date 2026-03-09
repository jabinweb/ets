import { Metadata } from "next";
import Link from "next/link";
import { Book, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Statement of Faith | ETS",
  description: "Our theological beliefs and doctrinal positions at Evangelical Theological Seminary.",
};

const beliefs = [
  {
    number: 1,
    title: "THE SCRIPTURES",
    content: "We believe that the Holy Bible, as originally written in its sixty-six books, was verbally and plenarily inspired, the product of Spirit-controlled men. We believe it is infallible and inerrant, and therefore truth without any admixture of error. The Bible is the final authority for our faith and practice, and the standard by which all human conduct, creeds, and opinions shall be tried (2 Timothy 3:16-17; 2 Peter 1:20-21)."
  },
  {
    number: 2,
    title: "THE TRUE GOD",
    content: "We believe there is one and only one living and true God, an infinite Spirit, the Maker and Supreme Ruler of heaven and earth; inexpressibly glorious in holiness, and worthy of all possible honor, confidence, and love (Deuteronomy 6:4; Psalm 19:1-6; Isaiah 45:5-6, 18-22)."
  },
  {
    number: 3,
    title: "THE TRINITY",
    content: "We believe that God is One in essence, but in the unity of the Godhead, there are three persons: the Father, the Son, and the Holy Spirit, equal in every divine perfection, and executing distinct but harmonious offices (Matthew 28:18-19; 2 Corinthians 13:14)."
  },
  {
    number: 4,
    title: "GOD THE FATHER",
    content: "We believe that God the Father is a person separate from God the Son and God the Spirit, invisible to man in this life. He concerns Himself with the affairs of men, elects and draws men unto salvation, and has a paternal relationship with all believers (Matthew 28:19; 1 Timothy 1:17; Daniel 2:21; 4:17; Matthew 5:45; 1 Peter 1:2; John 6:44; Romans 8:15)."
  },
  {
    number: 5,
    title: "GOD THE SON",
    content: "We believe in the deity of Jesus Christ, that He was conceived by the Holy Spirit and born of the Virgin Mary; that He is true God and true man, possessing two natures. He lived a sinless life and is incapable of sinning. He gave Himself as a perfect substitutionary sacrifice for the sins of all men, arose bodily from the grave, ascended into heaven, and is seated at the right hand of God, interceding for His people. We believe He will personally come in the air for His Church before the Tribulation, and will return with His Church at the close of the Tribulation to establish His millennial kingdom on earth (John 10:30-33; Isaiah 7:14; Matthew 1:23; Luke 1:35; Hebrews 7:26; Ephesians 1:7; Colossians 1:20; 1 Corinthians 15:20; Acts 1:11; Hebrews 7:25; 1 Thessalonians 4:13-18; Revelation 19:11-16; 20:1-6)."
  },
  {
    number: 6,
    title: "GOD THE SPIRIT",
    content: "We believe in the personality and deity of the Holy Spirit, equal with God the Father and God the Son and of the same essence. He was active in creation and now restrains the evil one until God's purpose is fulfilled. He convicts of sin, righteousness, and judgment, regenerates, baptizes believers into the body of Christ, seals believers, indwells, fills, guides, teaches, and sanctifies them (Acts 5:3-4; John 14:26; John 16:8-11; Titus 3:5; 1 Corinthians 12:12-13; 1 Corinthians 6:19-20; Ephesians 1:14; Acts 4:31; Ephesians 5:18)."
  },
  {
    number: 7,
    title: "SPIRITUAL GIFTS",
    content: "We believe that the Holy Spirit bestows spiritual gifts upon believers. Some gifts are permanent for the entire church age, while others were temporary. Temporary gifts, such as apostles, prophets, tongues, interpretation of tongues, healing, and miracles, are not for this present period of church history. The purpose of the gifts of the Spirit is to prepare saints for ministry and to build up the Body of Christ (1 Corinthians 12; Romans 12:4-8; Ephesians 4:11-12)."
  },
  {
    number: 8,
    title: "CREATION",
    content: "We believe in God's direct creation of the physical universe, all spirit beings, man, and lower forms of life, without the process of evolution. We believe the Genesis account of creation is a literal, historical, and accurate account. All three Persons of the Trinity took part in creation, and God sustains all creation while existing independently of it (Genesis 1 and 2; Colossians 1:15-18)."
  },
  {
    number: 9,
    title: "ANGELS",
    content: "We believe God created an innumerable company of sinless spirit beings known as angels. Some angels continue in their holy state and are ministers of God, while Lucifer (now known as Satan) and many others rebelled against God. Though defeated at the cross, fallen angels continue to oppose God, and they will ultimately be judged and cast into the Lake of Fire for everlasting punishment (Colossians 1:16; Ezekiel 28:12-15; Revelation 12:7-9; 2 Corinthians 4:3-4; Ephesians 2:2; Revelation 20:10; Matthew 25:41)."
  },
  {
    number: 10,
    title: "MAN",
    content: "We believe man was created in the image and likeness of God, but through disobedience, Adam fell from his original state and became totally depraved, separated from God, and under condemnation and death. All men (except Jesus Christ) are born with sin natures and under the consequences of sin (Genesis 3; Romans 5:12)."
  },
  {
    number: 11,
    title: "SALVATION",
    content: "We believe salvation is wholly of grace through the substitutionary work of Jesus Christ, who paid the full redemptive price. Salvation is effective only upon personal faith in Jesus Christ. The new birth is instantaneous and results in holy fruits of repentance, faith, and newness of life in Christ (John 3:3; 2 Corinthians 5:17; 1 John 5:1; John 3:6-7; Acts 16:30-33; 2 Peter 1:4; Romans 6:23; Ephesians 2:8-9; John 1:12)."
  },
  {
    number: 12,
    title: "SECURITY OF THE BELIEVER",
    content: "We believe that all who are truly born again are kept by God the Father for Jesus Christ (Philippians 1:6, John 10:28-29; Romans 8:35-39; 1 Peter 1:5)."
  },
  {
    number: 13,
    title: "SANCTIFICATION",
    content: "We believe in four aspects of sanctification: preparatory (the work of the Holy Spirit in an unbeliever's life leading to belief in the gospel), positional (eternally setting apart believers at the time of regeneration), progressive (the process by which believers partake in God's holiness through the Word, self-examination, watchfulness, and prayer), and ultimate (when believers are in the presence of the Lord with glorified bodies) (1 Peter 1:1-2; John 6:44; 1 John 3:1; 1 Corinthians 1:2; Hebrews 10:10-24; Proverbs 4:18; Philippians 3:20-21)."
  },
  {
    number: 14,
    title: "DISPENSATIONS",
    content: "We believe dispensations are stewardships by which God administers His purpose on earth through man under varying responsibilities. They are not ways of salvation, which has always been by grace through faith. We believe God's program and purposes for Israel and the Church are separate and distinct."
  },
  {
    number: 15,
    title: "THE UNIVERSAL CHURCH",
    content: "We believe in the unity of all true believers in the Church, the Body of Christ, which was established on the Day of Pentecost and will be completed at the Rapture. All believers of this age are added to this Church by the baptism of the Holy Spirit (Ephesians 1:22-23; Colossians 1:18; Ephesians 5:22-32; 1 Corinthians 12:12-13)."
  },
  {
    number: 16,
    title: "THE LOCAL CHURCH",
    content: "We believe a local church is a congregation of baptized believers associated by a covenant of faith and fellowship in the Gospel, observing Christ's ordinances, and exercising spiritual gifts, rights, and privileges. Its officers are pastors and deacons. The church's mission is the faithful witnessing of Christ. We believe the local church is under the authority of Christ, and it is Scriptural for true churches to cooperate in contending for the faith and spreading the Gospel (Acts 2:41-42; 1 Corinthians 11:23-24; Ephesians 4:11; Acts 20:17-28; 1 Timothy 3:1-13; Acts 15:13-15)."
  },
  {
    number: 17,
    title: "THE ORDINANCES",
    content: "We believe Christ left two ordinances for the Church: Baptism and the Lord's Supper. Baptism is the immersion of believers in water as a public testimony of faith in the crucified, buried, and risen Savior. The Lord's Supper is a commemoration of Christ's death until He comes, and should always be preceded by self-examination. Only born-again believers in fellowship with Christ may partake in communion (Acts 8:36, 38-39; Romans 6:3-5; 1 Corinthians 11:23-28)."
  },
  {
    number: 18,
    title: "CIVIL GOVERNMENT",
    content: "We believe civil government is divinely appointed for the good order of human society. Magistrates are to be prayed for, honored, and obeyed unless they oppose the will of Christ, who is the only Lord of conscience (Romans 13:1-7; Acts 4:19-20; Matthew 22:21)."
  },
  {
    number: 19,
    title: "THE RIGHTEOUS AND THE WICKED",
    content: "We believe that there is a radical and essential difference between the righteous and the wicked; that such only as through faith are justified in the name of the Lord Jesus Christ, and sanctified by the Spirit of God, are truly righteous in His esteem; while all such as continue in impenitence and unbelief are in His sight wicked, and under the curse; and this distinction holds among men both in and after death, in the everlasting happiness of the saved and the everlasting conscious suffering of the lost (Malachi 3:18; Genesis 18:23; Romans 6:17-18; 1 John 5:19; Romans 7:6; Romans 6:23; Proverbs 14:32; Luke 16:25; Matthew 25:34-41; John 8:21)."
  },
  {
    number: 20,
    title: "THINGS TO COME",
    content: "We believe that the Scriptures foretell certain events among which are the following:",
    subsections: [
      {
        subtitle: "Rapture of the Church",
        text: "We believe that Jesus Christ will return to the atmosphere of this earth; that the dead in Christ will rise first, then believers who are still living will be caught up together with them to meet the Lord in the air and to ever be with the Lord; that the rapture is the next event on the revealed calendar and that no prophecy need be fulfilled before this occurs. We believe the rapture will occur before the tribulation (1 Thessalonians 4:13-18; 1 Corinthians 15:42-44, 51-54; Philippians 3:20-21; 1 Thessalonians 5:9; Romans 5:9)."
      },
      {
        subtitle: "Tribulation",
        text: "We believe that following the rapture there will be a time of tribulation on the earth known as the seventieth week of Daniel; that though there will be salvation during this period, it will be a time when the antichrist will be manifested, and that there will be great judgments from God. The latter part of this period is known as the Great Tribulation (Daniel 9:27; Matthew 24; Revelation 5-19)."
      },
      {
        subtitle: "Second Coming",
        text: "We believe that following the tribulation Christ will return to the earth with His glorified saints to establish the millennial kingdom; that during the 1,000 years of peace and prosperity Satan will be bound and Christ will reign with a rod of iron; that at the end of the millennium Satan will be released for a short time, deceive many, and lead them in final rebellion, but be put down with his armies by God (John 14:3; Acts 1:11; 1 Thessalonians 4:16; James 5:8; Hebrews 9:28; Revelation 20:7-10)."
      },
      {
        subtitle: "Eternal State",
        text: "We believe that the unsaved men of all ages will be resurrected and together with the evil angels will be finally judged and condemned to everlasting conscious punishment in hell; that all saved of all ages in glorified bodies will enjoy everlasting blessing in the presence of God (Revelation 20:11-15)."
      }
    ]
  },
  {
    number: 21,
    title: "THE FAMILY",
    content: "We believe the family is the first institution established by God. In light of God's creative design, we believe that the Bible teaches that marriage is the joining of one man (genetically male) and one woman (genetically female) into a monogamous, lifelong covenant relationship. Sexual intimacy within marriage is honorable, but we believe that any sexual activity outside of marriage is condemned by God as immoral and is a perversion of God's gracious will; these immoral perversions include, but are not limited to, adultery, multiple sexual unions, all forms of homosexuality, incest, polygamy, and polyamory.\n\nWe believe in the sanctity of life. We hold that all life is a gift from God. We believe that a new, living human person is formed at conception, that the unborn is a living soul, and that all human life is sacred. We believe that no human being has the right to take another human being's life either at the beginning [abortion] or at the end of that individual's existence [euthanasia] (Genesis 2:18-25; Matthew 19:3-12; Ephesians 5:22-33; Romans 1:18-27; 7:2; 1 Corinthians 6:9-20; 7:1-5; Exodus 20:14; Leviticus 18:22-23; 20:13; 1 Timothy 1:10; Hebrews 13:4; Jeremiah 1:5)."
  }
];

export default function StatementOfFaithPage() {
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
              <Book className="h-5 w-5 text-white" />
              <span className="text-sm font-bold text-white">Our Beliefs</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Statement of Faith
            </h1>
            
            <p className="text-xl text-slate-300 leading-relaxed">
              Our theological convictions and doctrinal positions that guide our ministry, teaching, and mission at North India Baptist Seminary.
            </p>
          </div>
        </div>
      </section>

      {/* Beliefs Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            {beliefs.map((belief) => (
              <div 
                key={belief.number}
                className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-8 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{belief.number}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                      {belief.title}
                    </h3>
                    
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {belief.content}
                    </p>

                    {belief.subsections && (
                      <div className="mt-6 space-y-4 pl-4 border-l-2 border-primary/20">
                        {belief.subsections.map((subsection, idx) => (
                          <div key={idx}>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                              {subsection.subtitle}
                            </h4>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {subsection.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Questions About Our Beliefs?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              We would be happy to discuss our theological convictions with you and answer any questions you may have.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
