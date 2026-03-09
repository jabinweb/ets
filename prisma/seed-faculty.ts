import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFaculty() {
  try {
    console.log('Seeding faculty members...');

    // Check if faculty already exist to avoid duplicates
    const existingFaculty = await prisma.user.findMany({
      where: {
        role: 'TEACHER'
      },
      select: {
        email: true
      }
    });

    const existingEmails = existingFaculty.map(user => user.email);

    // Define the faculty data based on the provided information
    const facultyData = [
      {
        name: 'Prof. Saji Abraham',
        email: 'saji.abraham@acaindia.org',
        qualification: 'Professor of Bible Exposition',
        specialization: 'Bible Exposition, Biblical Studies',
        experience: 20,
        bio: 'Prof. Saji Abraham is a Professor in Biblical Studies department at ETS and he is also pastoring at Hosur & Grace Bible Church for more than 20 years. He is married to Elsa Saji and is blessed with two children Timya and Tanya.',
        dateOfJoining: new Date('1993-01-01'),
        education: [
          { degree: 'BTh', institution: 'Grace Bible College and Seminary', year: 1993 },
          { degree: 'MA', institution: 'Annamalai University', year: 1998 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 1996 }
        ]
      },
      {
        name: 'Dr. Alias K. Eldhose',
        email: 'alias.eldhose@acaindia.org',
        qualification: 'Professor of Theological Studies, Academic Dean',
        specialization: 'New Testament, Theological Studies',
        experience: 20,
        bio: 'Dr. Alias K. Eldhose (Eldy) taught at Grace Bible College for two years (1996-1998) and served in North Indian Mission Field until 2003. Completed leadership training with Child Evangelism Fellowship in Langenbruck, Basel, Switzerland (2004-05) before joining CEF of Britain as the Director of YouthChallenge®. From 2009 until the fall of 2016, Eldy served as the Teaching Assistant in the New Testament Department at DTS. Eldy also served as the Marriage Ministry Coordinator for eighteen months at Northwest Bible Church. He is married to Mercy Eldhose with two children Nathaniel and Jonathan.',
        dateOfJoining: new Date('2017-01-01'), // Assuming joined after completing PhD
        education: [
          { degree: 'BTh', institution: 'Grace Bible College and Seminary', year: 1996 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2000 },
          { degree: 'PhD', institution: 'Dallas Theological Seminary', year: 2017 }
        ]
      },
      {
        name: 'Dr. Benjamin George',
        email: 'benjamin.george@acaindia.org',
        qualification: 'Professor of Pastoral Studies',
        specialization: 'Pastoral Studies',
        experience: 15,
        bio: 'Prof. Benjamin George taught at ACA for 3 years before moving to Surkhet, Nepal in 2014. Later he moved to Dubai for a pastoral internship at the Redeemer Church of Dubai in 2015. Currently he serves at ETS. He is married to Miriam and they have 3 children Lydia, Asher and Jude.',
        dateOfJoining: new Date('2021-01-01'), // Joined after DMin completion
        education: [
          { degree: 'BS', institution: 'Texas A&M University', year: 2001 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2011 },
          { degree: 'DMin', institution: 'Evangelical Theological Seminary', year: 2021 }
        ]
      },
      {
        name: 'Dr. Joy M George',
        email: 'joy.george@acaindia.org',
        qualification: 'Professor of Bible Exposition, Chancellor',
        specialization: 'Bible Exposition',
        experience: 40,
        bio: 'Dr. Joy is the most senior teaching faculty at ETS. He has taught most of the courses offered in our curriculum, but his area of expertise is in Bible Exposition. He is married to Leela George and they have three children Stephen, Benjamin and Christine.',
        dateOfJoining: new Date('1976-01-01'), // Started teaching after ThM
        education: [
          { degree: 'BS', institution: 'Kerala University', year: 1970 },
          { degree: 'ThM', institution: 'Dallas Theological Seminary', year: 1976 },
          { degree: 'PhD', institution: 'Dallas Theological Seminary', year: 1984 }
        ]
      },
      {
        name: 'Dr. Stephen George',
        email: 'stephen.george@acaindia.org',
        qualification: 'President, Asian Christian Academy',
        specialization: 'Online Theological Education',
        experience: 15,
        bio: 'Dr. S. J George is a professor at ETS. His doctoral work focused on non-native speakers of English as adult learners and online theological education. This work has led to the development of the online M.A in Christian Studies at ETS. Prior to his theological education, he worked for Air Liquide as a Chemical Engineer. He is married to Rachel George and they have two children Ashish and Anjali.',
        dateOfJoining: new Date('2017-01-01'), // After completing PhD
        education: [
          { degree: 'BS', institution: 'Texas A&M University', year: 2000 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2007 },
          { degree: 'MA', institution: 'The University of Texas at Arlington', year: 2010 },
          { degree: 'PhD', institution: 'University of North Texas', year: 2017 }
        ]
      },
      {
        name: 'Prof. Joy John',
        email: 'joy.john@acaindia.org',
        qualification: 'Professor of Theological Studies, Director of Strategic Engagement and Relations',
        specialization: 'Theological Studies, Christian Education',
        experience: 30,
        bio: 'Prof. Joy John is a professor in the department of Theological Studies and selected courses in Christian Education. He is one of the elders in Hosur Brethren Assembly, a resource person for children\'s ministry, a guest lecturer at graduate level colleges, and prolific speaker at conferences and seminars. His articles have appeared in Christian journals and popular magazines. He has also number of Malayalam Christian songs to his credit. He is married to Juni Joy and they are blessed with three boys, Jonathan, Jabez and Jairus.',
        dateOfJoining: new Date('1991-01-01'), // After MTh
        education: [
          { degree: 'BTh', institution: 'South India Baptist Bible College', year: 1988 },
          { degree: 'BD', institution: 'South India Baptist Bible College', year: 1989 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 1991 }
        ]
      },
      {
        name: 'Prof. Noby T. K',
        email: 'noby.k@acaindia.org',
        qualification: 'Professor of Old Testament, Dean of Students',
        specialization: 'Old Testament Studies, Bible Exposition',
        experience: 20,
        bio: 'Prof. Noby T. K is a Professor of Old Testament Studies and Bible Exposition. He is also the Pastor of the Campus Bible Church at ACA. Before coming to ETS, Noby taught English and the Bible in Christian Mission Schools in North-East India for three years and also taught at Faith Baptist Bible College and Seminary, Cochin, Kerala for five years. He is married to Rinku and they have two children Stephen and Stephy.',
        dateOfJoining: new Date('2001-01-01'), // After MTh
        education: [
          { degree: 'BTh', institution: 'Trivandrum Bible College', year: 1993 },
          { degree: 'BD', institution: 'South India Baptist Bible College and Seminary', year: 1997 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2001 }
        ]
      },
      {
        name: 'Dr. Mathukutty P. M',
        email: 'mathukutty.pm@acaindia.org',
        qualification: 'Professor of Bible Exposition, Librarian',
        specialization: 'Bible Exposition',
        experience: 25,
        bio: 'Dr. Mathukutty P. M is the Librarian & Professor at ETS since 1995. He is a Visiting faculty to the Brethren Bible Institute, Pathanamthita and Stewards Bible College, Chennai. Currently academic committee member and Vice Principal of Rehoboth Theological Institute, Thrissur. He is an Elder for the last 21 years at Zion Brethren Fellowship, Bangalore. He is also the Convenor of the Joint Library Committee (JLC), Bangalore. Dr. Mathukutty is married to Shani Matthew and they are blessed with two children Samuel and Sara.',
        dateOfJoining: new Date('1995-01-01'), // Started in 1995
        education: [
          { degree: 'BA', institution: 'Mangalore University', year: 1991 },
          { degree: 'BBS', institution: 'India Theological Seminary', year: 1991 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 1995 },
          { degree: 'MA (Christian Studies)', institution: 'Madras University', year: 2011 },
          { degree: 'BLisc', institution: 'Alagappa University', year: 2012 },
          { degree: 'DMin', institution: 'Evangelical Theological Seminary', year: 2015 }
        ]
      },
      {
        name: 'Dr. Hanson Manova',
        email: 'hanson.manova@acaindia.org',
        qualification: 'Professor of Pastoral Studies',
        specialization: 'Pastoral Studies',
        experience: 15,
        bio: 'Dr. Hanson Manova is a Professor of Pastoral Studies at ETS. He served as a co-pastor at Hosur Bible Church from 2006 - 2019 and is currently serving as a co-pastor at Tamil Baptist Church, Namakkal. Dr. Hanson has translated the following books into Tamil: Creation to Christ, An Exposition of Acts, An Exposition of Romans, Supernatural (Michael Heiser), Timothy Leadership Training Lessons series, and A Overview of the Books of the Bible. He is married to Jocelyn Marylyn Jose and they are blessed with two children Amy and Hudson.',
        dateOfJoining: new Date('2016-01-01'), // After DMin completion
        education: [
          { degree: 'BTh', institution: 'South India Baptist Bible College', year: 2002 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2005 },
          { degree: 'BA (English)', institution: 'Annamalai University', year: 2014 },
          { degree: 'DMin', institution: 'Evangelical Theological Seminary', year: 2016 },
          { degree: 'M.Sc in Psychology', institution: 'Jain University', year: 2022 }
        ]
      },
      {
        name: 'Dr. Hruaikima Reang',
        email: 'hruaikima.reang@acaindia.org',
        qualification: 'Asst. Professor of New Testament',
        specialization: 'New Testament',
        experience: 5,
        bio: 'Dr. Hruaikima Reang comes from Tripura and is an Asst. Professor of New Testament at ETS. He taught at North East India Baptist Bible College and Seminary in Silchar, Assam for a year. He was a Teaching Assistant in Biblical Languages at ETS for five years during his doctoral program.',
        dateOfJoining: new Date('2023-01-01'), // After PhD completion
        education: [
          { degree: 'BTh', institution: 'North East India Baptist Bible College and Seminary', year: 2013 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2017 },
          { degree: 'PhD', institution: 'Evangelical Theological Seminary', year: 2023 }
        ]
      },
      {
        name: 'Dr. Mathew K. Samuel',
        email: 'mathew.samuel@acaindia.org',
        qualification: 'Professor of Theological Studies, Registrar & Director of Online Education',
        specialization: 'Theological Studies',
        experience: 15,
        bio: 'Prof. Mathew K. Samuel is a professor of Theological Studies at ETS and currently one of the elders at Ebenezer Brethren Assembly. He is married to Reba Lilly Gaius.',
        dateOfJoining: new Date('2022-01-01'), // After PhD completion
        education: [
          { degree: 'BTh', institution: 'Berean Baptist Bible College and Seminary', year: 2002 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2005 },
          { degree: 'PhD', institution: 'Evangelical Theological Seminary', year: 2022 }
        ]
      },
      {
        name: 'Dr. Kevin Storer',
        email: 'kevin.storer@acaindia.org',
        qualification: 'Research Method Consultant, Director of PhD Studies',
        specialization: 'Research Methods, Liberal Arts',
        experience: 15,
        bio: 'Dr. Kevin Storer holds a PhD in the department of Liberal Arts from Duquesne University (2012), and a PhD from the University of Manchester (focus on Søren Kierkegaard) (2019). Kevin has taught in the department of liberal arts at Duquesne University, Seton Hill University and St. Vincent College, and has also worked as a Presbyterian coordinator of education in Pennsylvania, USA. He is married to Sarah Storer.',
        dateOfJoining: new Date('2019-01-01'), // After second PhD
        education: [
          { degree: 'MA', institution: 'University of Dallas', year: 2006 },
          { degree: 'PhD', institution: 'Duquesne University', year: 2012 },
          { degree: 'PhD', institution: 'University of Manchester', year: 2019 }
        ]
      },
      {
        name: 'Dr. Saji P. Thomas',
        email: 'saji.thomas@acaindia.org',
        qualification: 'Professor of Bible Exposition, Director of DMin Studies',
        specialization: 'Bible Exposition, Pastoral Studies',
        experience: 30,
        bio: 'Dr. Saji P. Thomas has been teaching ministry-students and sharing pastoral or other church related responsibilities in Bangalore since 1990. He teaches Bible exposition and pastoral track courses at ETS and is the pastor at Faith Life Baptist Church, Bangalore. He is married to Jessy Ann and they have three children Jerusha, Shaphan and Navith.',
        dateOfJoining: new Date('2012-01-01'), // After DMin completion
        education: [
          { degree: 'BTh', institution: 'Berean Baptist Bible College', year: 1986 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 1990 },
          { degree: 'STM', institution: 'Northwest Baptist Seminary (Graduate School of Ministry at Corban University)', year: 1998 },
          { degree: 'DMin', institution: 'Evangelical Theological Seminary', year: 2012 }
        ]
      },
      {
        name: 'Dr. Balu Savarikannu',
        email: 'balu.savari@acaindia.org',
        qualification: 'Professor of Biblical Studies (Old Testament)',
        specialization: 'Old Testament, Biblical Hebrew, Biblical Exegesis',
        experience: 15,
        bio: 'Dr Balu Savarikannu is a Professor of Biblical Studies (Old Testament) at ETS-ACA Hosur. He taught Old Testament in seminaries in India, South-East Asia, and Africa. He also served as the principal of COTR Theological Seminary in Andhra Pradesh during 2020-2025. His PhD dissertation focused on multiple speaking voices and dialogue in the Book of Lamentations. He has published a few articles on Biblical laments and his book on Lamentations is forthcoming. He loves teaching Biblical Hebrew, Biblical Exegesis, Prophets, Poetic Books, and Biblical Leadership. Prior to his theological education, he was a missionary-teacher in North-Bihar. He is married to Margaret Balu, and they have two children Sashwath and Samarth.',
        dateOfJoining: new Date('2019-01-01'), // After PhD completion
        education: [
          { degree: 'B.Th.', institution: 'Bethel Bible Institute (BBI), Danishpet', year: 2006 },
          { degree: 'M.A. (Advanced-OT)', institution: 'South Asia Institute of Advanced Christian Studies (SAIACS), Bengaluru', year: 2009 },
          { degree: 'M.Th. (OT)', institution: 'South Asia Institute of Advanced Christian Studies (SAIACS), Bengaluru', year: 2012 },
          { degree: 'Ph.D. (Biblical Studies - OT)', institution: 'Asia Graduate School of Theology–Biblical Seminary of the Philippines (AGST-BSOP)', year: 2019 }
        ]
      },
      {
        name: 'Dr. Thawng Ceu Hnin',
        email: 'thawng.hnin@acaindia.org',
        qualification: 'Professor of Biblical Studies (New Testament)',
        specialization: 'New Testament, Greek Grammar, Pauline Studies',
        experience: 10,
        bio: 'Dr. Thawng Ceu Hnin is a Professor of Biblical Studies (New Testament) at ETS-ACA, Hosur. Before joining ETS, he taught New Testament subjects at Hindustan Bible Institute and College, Chennai for nine years—seven years as faculty and two years as Academic Dean.Dr. Thawng has published over 20 scholarly articles both nationally and internationally in the field of New Testament Studies. His current research focuses on Paul and the theme of mystery. He is also editing a forthcoming book. His Ph.D. dissertation focuses on the syntax of the improper Greek prepositions of the Septuagint Greek and the New Testament. He is passionate about teaching Basic and Intermediate Greek Grammar, Greek Prepositions, Pauline Studies, Johannine Writings, and Apocalyptic Literature.',
        dateOfJoining: new Date('2022-01-01'), // After PhD completion
        education: [
          { degree: 'B.Th.', institution: 'Christ For the Nations Bible College, Kohima', year: 2011 },
          { degree: 'M.Div.', institution: 'Christian Academy for Advanced Theological Studies, Nagercoil', year: 2013 },
          { degree: 'M.Th. (New Testament)', institution: 'Hindustan Bible Institute and College, Chennai', year: 2016 },
          { degree: 'Ph.D. (New Testament Studies)', institution: 'Hindustan Bible Institute and College, Chennai', year: 2022 }
        ]
      }
    ];

    // Create faculty members that don't already exist
    for (const faculty of facultyData) {
      if (!existingEmails.includes(faculty.email)) {
        const createdFaculty = await prisma.user.create({
          data: {
            name: faculty.name,
            email: faculty.email,
            role: 'TEACHER',
            qualification: faculty.qualification,
            specialization: faculty.specialization,
            experience: faculty.experience,
            bio: faculty.bio,
            dateOfJoining: faculty.dateOfJoining,
            education: faculty.education ? JSON.stringify(faculty.education) : undefined
          }
        });

        console.log(`Created faculty: ${createdFaculty.name}`);
      } else {
        console.log(`Skipped existing faculty: ${faculty.name}`);
      }
    }

    // Handle DMin Faculty separately as they seem to be guest faculty
    const dminFacultyData = [
      {
        name: 'Dr. Saji P. Thomas',
        email: 'saji.thomas.dmin@acaindia.org',
        qualification: 'DMin Faculty, Director',
        specialization: 'Doctor of Ministry',
        experience: 30,
        bio: 'DMin Faculty Director',
        dateOfJoining: new Date('2012-01-01'),
        education: []
      },
      {
        name: 'Dr. David Fletcher',
        email: 'david.fletcher@acaindia.org',
        qualification: 'DMin Faculty, Founding Director',
        specialization: 'Doctor of Ministry',
        experience: 20,
        bio: 'DMin Founding Director',
        dateOfJoining: new Date('2000-01-01'),
        education: []
      },
      {
        name: 'Dr. S. J George',
        email: 'stephen.george.dmin@acaindia.org',
        qualification: 'DMin Faculty, Professor',
        specialization: 'Doctor of Ministry',
        experience: 15,
        bio: 'DMin Professor',
        dateOfJoining: new Date('2017-01-01'),
        education: [
          { degree: 'BS', institution: 'Texas A&M University', year: 2000 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2007 },
          { degree: 'MA', institution: 'The University of Texas at Arlington', year: 2010 },
          { degree: 'PhD', institution: 'University of North Texas', year: 2017 }
        ]
      },
      {
        name: 'Dr. Hanson Manova',
        email: 'hanson.manova.dmin@acaindia.org',
        qualification: 'DMin Faculty, Professor',
        specialization: 'Doctor of Ministry',
        experience: 15,
        bio: 'DMin Professor',
        dateOfJoining: new Date('2016-01-01'),
        education: [
          { degree: 'BTh', institution: 'South India Baptist Bible College', year: 2002 },
          { degree: 'MTh', institution: 'Evangelical Theological Seminary', year: 2005 },
          { degree: 'DMin', institution: 'Evangelical Theological Seminary', year: 2016 }
        ]
      },
      {
        name: 'Dr. Nathan Baxter',
        email: 'nathan.baxter@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 20,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('2005-01-01'),
        education: []
      },
      {
        name: 'Dr. Darrell Bock',
        email: 'darrell.bock@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 30,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('2000-01-01'),
        education: []
      },
      {
        name: 'Dr. Gene Getz',
        email: 'gene.getz@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 35,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('1995-01-01'),
        education: []
      },
      {
        name: 'Dr. Wayne Grudem',
        email: 'wayne.grudem@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 35,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('1995-01-01'),
        education: []
      },
      {
        name: 'Dr. Abe Kuruvilla',
        email: 'abe.kuruvilla@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 25,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('2000-01-01'),
        education: []
      },
      {
        name: 'Dr. Bill Lawrence',
        email: 'bill.lawrence@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 30,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('2000-01-01'),
        education: []
      },
      {
        name: 'Dr. Carlos Pinto',
        email: 'carlos.pinto@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 20,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('2005-01-01'),
        education: []
      },
      {
        name: 'Dr. Tie King',
        email: 'tie.king@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 20,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('2005-01-01'),
        education: []
      },
      {
        name: 'Dr. Dan Wallace',
        email: 'dan.wallace@acaindia.org',
        qualification: 'DMin Faculty, Guest Faculty',
        specialization: 'Doctor of Ministry',
        experience: 30,
        bio: 'DMin Guest Faculty',
        dateOfJoining: new Date('2000-01-01'),
        education: []
      }
    ];

    // Create DMin faculty
    for (const faculty of dminFacultyData) {
      if (!existingEmails.includes(faculty.email)) {
        const createdFaculty = await prisma.user.create({
          data: {
            name: faculty.name,
            email: faculty.email,
            role: 'TEACHER',
            qualification: faculty.qualification,
            specialization: faculty.specialization,
            experience: faculty.experience,
            bio: faculty.bio,
            dateOfJoining: faculty.dateOfJoining,
            education: faculty.education ? JSON.stringify(faculty.education) : undefined
          }
        });

        console.log(`Created DMin faculty: ${createdFaculty.name}`);
      } else {
        console.log(`Skipped existing DMin faculty: ${faculty.name}`);
      }
    }

    console.log('Successfully seeded faculty members!');
  } catch (error) {
    console.error('Error seeding faculty:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedFaculty();
