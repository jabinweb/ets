import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSeminaryPrograms() {
  try {
    console.log('Seeding seminary programs...');

    // Delete existing programs
    await prisma.programFeature.deleteMany({});
    await prisma.program.deleteMany({});

    // Define the programs based on the provided information
    const programsData = [
      {
        title: 'Master of Theology (M.Th.)',
        description: 'This is a 4-year residential program which includes both introductory theology and advanced level theological training. With in-depth study of languages like biblical Greek and Hebrew, this curriculum is best suited for those who want to have a deep understanding of the Word of God and hope to do doctorate level studies and research. Anyone with any bachelor\'s degree can apply.',
        level: "Master's Degree",
        duration: '4 Years',
        credits: 'Residential Program',
        institution: 'ACA',
        slug: 'mth-theology',
        icon: 'GraduationCap',
        gradient: 'from-purple-500 to-indigo-600',
        features: [
          'In-depth biblical language study (Greek & Hebrew)',
          'Residential program with accommodation',
          'Preparation for doctoral studies',
          'Open to graduates with any bachelor\'s degree',
          '4-year comprehensive theological training'
        ]
      },
      {
        title: 'Master of Divinity (M.Div.)',
        description: 'This 3-year residential program is tailored for all those seeking a formal education in theology to build their knowledge and practice of the Word of God. Those involved in ministry and secular work and who can\'t afford to take a break from those commitments, will benefit greatly from this course. Anyone with any bachelor\'s degree can apply.',
        level: "Master's Degree",
        duration: '3 Years',
        credits: 'Residential Program',
        institution: 'ACA',
        slug: 'mdiv-divinity',
        icon: 'Cross',
        gradient: 'from-red-500 to-orange-600',
        features: [
          'Formal theological education',
          'Residential program with accommodation',
          'Designed for working professionals in ministry',
          'Open to graduates with any bachelor\'s degree',
          '3-year comprehensive program'
        ]
      },
      {
        title: 'Master of Arts in Biblical Studies (M.A.B.S.)',
        description: 'This 2-year residential program is tailored for all those seeking a formal education in theology to build their knowledge and practice of the Word of God. Those involved in ministry and secular work and who can\'t afford to take a two-year break from those commitments, will benefit greatly from this course. Anyone with any bachelor\'s degree can apply.',
        level: "Master's Degree",
        duration: '2 Years',
        credits: 'Residential Program',
        institution: 'ACA',
        slug: 'mabs-biblical-studies',
        icon: 'BookOpen',
        gradient: 'from-blue-500 to-teal-600',
        features: [
          'Formal education in biblical studies',
          'Residential program with accommodation',
          'Designed for ministry professionals',
          'Open to graduates with any bachelor\'s degree',
          '2-year focused program'
        ]
      },
      {
        title: 'Master of Arts in Christian Studies (M.A.C.S.)',
        description: 'The online M.A. in Christian Studies is a program that is designed for working professionals and ministers who cannot leave their setting to join a residential seminary. The program delivers 19 of its 20 modules via the internet using videos, text and live interactions on a weekly basis. Prerequisites for this program are identical to our other residential Master\'s programs.',
        level: "Master's Degree",
        duration: '5 Years',
        credits: 'Online Program',
        institution: 'ACA',
        slug: 'macs-christian-studies-online',
        icon: 'Monitor',
        gradient: 'from-green-500 to-emerald-600',
        features: [
          'Fully online program',
          'Designed for working professionals',
          '19 of 20 modules delivered online',
          'Weekly video and live interactions',
          'Same prerequisites as residential programs'
        ]
      },
      {
        title: 'Doctor of Ministry (D.Min.)',
        description: 'This is a four to five year non-residential study program for applicants who have graduated with M.Th. or M.Div. degree with a minimum ninety hours with an average B grade and have completed three to five years of pastoral / Christian ministry since graduation.',
        level: "Doctoral Degree",
        duration: '4 to 5 Years',
        credits: 'Non-Residential Program',
        institution: 'ACA',
        slug: 'dmin-doctor-of-ministry',
        icon: 'Award',
        gradient: 'from-yellow-500 to-amber-600',
        features: [
          'Non-residential program',
          'Requires M.Th. or M.Div. degree',
          'Minimum 90 credit hours',
          'Average B grade requirement',
          '3-5 years of ministry experience required'
        ]
      },
      {
        title: 'Doctor of Philosophy (Ph.D.)',
        description: 'This is a four-year, full-time, residential program designed to train and equip future Bible college and seminary professors. Presently, there are two specializations: Theological Studies and New Testament. Applicants should have completed an M.Th. degree with a B+ average and have written a Master\'s level research thesis.',
        level: "Doctoral Degree",
        duration: '4 Years',
        credits: 'Residential Program',
        institution: 'ACA',
        slug: 'phd-philosophy',
        icon: 'ScrollText',
        gradient: 'from-indigo-500 to-purple-600',
        features: [
          'Full-time residential program',
          'Trains future seminary professors',
          'Specializations: Theological Studies & New Testament',
          'Requires M.Th. degree with B+ average',
          'Research thesis required'
        ]
      },
      {
        title: 'Post Graduate Diploma in Biblical Studies (P.G.D.B.S.)',
        description: 'The online PGDBS is a program that is designed for working professionals and ministers who cannot leave their setting to join a residential seminary. The program delivers 8 modules via the internet using videos, text and live interactions on a weekly basis. Prerequisites for this program are identical to our other residential Master\'s programs.',
        level: 'Postgraduate Diploma',
        duration: '2 Years',
        credits: 'Online Program',
        institution: 'ACA',
        slug: 'pgdbs-biblical-studies-online',
        icon: 'Laptop',
        gradient: 'from-teal-500 to-cyan-600',
        features: [
          'Online program for working professionals',
          '8 modules delivered via internet',
          'Weekly video and live interactions',
          'Same prerequisites as master\'s programs',
          'Flexible schedule for ministry professionals'
        ]
      }
    ];

    // Create programs and their features
    for (const programData of programsData) {
      const program = await prisma.program.create({
        data: {
          title: programData.title,
          description: programData.description,
          level: programData.level,
          duration: programData.duration,
          credits: programData.credits,
          institution: programData.institution,
          slug: programData.slug,
          icon: programData.icon,
          gradient: programData.gradient,
          features: {
            create: programData.features.map((feature, index) => ({
              feature,
              order: index + 1
            }))
          }
        }
      });

      console.log(`Created program: ${program.title}`);
    }

    console.log('Successfully seeded seminary programs!');
  } catch (error) {
    console.error('Error seeding seminary programs:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSeminaryPrograms();