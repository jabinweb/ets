import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSchoolSettings() {
  try {
    console.log('Seeding school settings...');

    // Delete existing school settings to override them
    await prisma.schoolSettings.deleteMany();

    // Create school settings with Asian Christian Academy information
    const schoolSettings = await prisma.schoolSettings.create({
      data: {
        schoolName: 'Asian Christian Academy',
        schoolShortName: 'ACA',
        schoolTagline: 'Excellence in Christian Higher Education',
        schoolDescription: 'Asian Christian Academy (ACA) is a premier theological institution dedicated to equipping leaders for effective ministry and service. Located in Jeemangalam, Bagalur (P.O), Hosur, Krishnagiri (Dist.), Tamil Nadu, ACA offers comprehensive theological education rooted in biblical truth and academic excellence.',
        schoolAddress: 'Jeemangalam, Bagalur (P.O), Hosur, Krishnagiri (Dist.), Tamil Nadu - 635103, India',
        schoolPhone: '04344-255800',
        schoolEmail: 'ets@acaindia.org',
        adminEmail: 'ets@acaindia.org',
        schoolWebsite: 'https://www.acaindia.org',
        currency: 'INR',
        currencySymbol: '₹',
        currencyPosition: 'before',
        timeZone: 'Asia/Kolkata',
        dateFormat: 'dd/MM/yyyy',
        language: 'en',
        academicYearStart: new Date(new Date().getFullYear(), 5, 1), // June 1st of current year
        academicYearEnd: new Date(new Date().getFullYear() + 1, 4, 31), // May 31st of next year
        theme: 'system',
        logoUrl: '/nibs-logo-red.png',
        bannerUrl: null,
        primaryColor: '#981b1e', // Red color from the requirements
        secondaryColor: '#0d103f', // Blue color from the requirements
        accentColor: '#059669'
      }
    });

    console.log(`Successfully created school settings for: ${schoolSettings.schoolName}`);
  } catch (error) {
    console.error('Error seeding school settings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSchoolSettings();