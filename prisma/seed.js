const { PrismaClient }  = require("../generated/prisma")

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...')

  // Create Courses
  const cs101 = await prisma.course.create({
    data: {
      courseCode: 'CS101',
      courseName: 'Introduction to Computer Science',
      credits: 3,
      department: 'ICT',
      instructor: 'Dr. Sarah Johnson',
      instructorEmail: 'sjohnson@isbat.ac.ug',
      description: 'Fundamentals of computer science and programming',
    },
  })

  const cs201 = await prisma.course.create({
    data: {
      courseCode: 'CS201',
      courseName: 'Data Structures',
      credits: 4,
      department: 'ICT',
      instructor: 'Prof. Michael Opolot',
      instructorEmail: 'mopolot@isbat.ac.ug',
      description: 'Advanced data structures and algorithms',
    },
  })

  const cs301 = await prisma.course.create({
    data: {
      courseCode: 'CS301',
      courseName: 'Web Development',
      credits: 3,
      department: 'ICT',
      instructor: 'Dr. Male Rogers',
      instructorEmail: 'mrodgers@isbat.ac.ug',
      description: 'Modern web development with React and Node.js',
    },
  })

  const bus101 = await prisma.course.create({
    data: {
      courseCode: 'BUS101',
      courseName: 'Business Administration',
      credits: 3,
      department: 'Business',
      instructor: 'Prof. Mbabazi Mbabazize',
      instructorEmail: 'mbabazi@isbat.ac.ug',
      description: 'Introduction to business principles',
    },
  })

  // Create Students
  const jude = await prisma.student.create({
    data: {
      rollNumber: '1234',
      name: 'Otim Jude',
      email: 'jude.otim@student.isbat.ac.ug',
      phone: '+256700123456',
      currentSemester: 3,
      programName: 'Bachelor of Computer Science',
      department: 'ICT',
      gpa: 3.5,
      totalCredits: 30,
      status: 'ACTIVE',
    },
  })

  const frank = await prisma.student.create({
    data: {
      rollNumber: '1235',
      name: 'Muhindo Frank',
      email: 'frank.muhindo@student.isbat.ac.ug',
      phone: '+256700123457',
      currentSemester: 2,
      programName: 'Bachelor of Business Administration',
      department: 'Business',
      gpa: 3.8,
      totalCredits: 21,
      status: 'ACTIVE',
    },
  })

  const delight = await prisma.student.create({
    data: {
      rollNumber: '1236',
      name: 'Delight Aheebwa',
      email: 'delight.aheebwa@student.isbat.ac.ug',
      phone: '+256700123458',
      currentSemester: 4,
      programName: 'Bachelor of Computer Science',
      department: 'ICT',
      gpa: 4.2,
      totalCredits: 42,
      status: 'ACTIVE',
    },
  })

  // Create Enrollments for jude (Roll 1234)
  await prisma.enrollment.create({
    data: {
      studentId: jude.id,
      courseId: cs101.id,
      semester: 1,
      academicYear: '2023/2024',
      assignmentScore: 18,
      midtermScore: 27,
      finalScore: 45,
      totalScore: 90,
      letterGrade: 'A',
      gradePoint: 4.0,
      status: 'COMPLETED',
    },
  })

  await prisma.enrollment.create({
    data: {
      studentId: jude.id,
      courseId: cs201.id,
      semester: 2,
      academicYear: '2023/2024',
      assignmentScore: 16,
      midtermScore: 24,
      finalScore: 38,
      totalScore: 78,
      letterGrade: 'B+',
      gradePoint: 3.5,
      status: 'COMPLETED',
    },
  })

  await prisma.enrollment.create({
    data: {
      studentId: jude.id,
      courseId: cs301.id,
      semester: 3,
      academicYear: '2024/2025',
      assignmentScore: 17,
      midtermScore: 26,
      finalScore: 40,
      totalScore: 83,
      letterGrade: 'A-',
      gradePoint: 3.7,
      status: 'IN_PROGRESS',
    },
  })

  // Create Enrollments for frank (Roll 1235)
  await prisma.enrollment.create({
    data: {
      studentId: frank.id,
      courseId: cs101.id,
      semester: 1,
      academicYear: '2024/2025',
      assignmentScore: 19,
      midtermScore: 28,
      finalScore: 48,
      totalScore: 95,
      letterGrade: 'A+',
      gradePoint: 4.0,
      status: 'COMPLETED',
    },
  })

  await prisma.enrollment.create({
    data: {
      studentId: frank.id,
      courseId: bus101.id,
      semester: 1,
      academicYear: '2024/2025',
      assignmentScore: 18,
      midtermScore: 27,
      finalScore: 45,
      totalScore: 90,
      letterGrade: 'A',
      gradePoint: 4.0,
      status: 'COMPLETED',
    },
  })

  await prisma.enrollment.create({
    data: {
      studentId: frank.id,
      courseId: cs201.id,
      semester: 2,
      academicYear: '2024/2025',
      assignmentScore: 17,
      midtermScore: 25,
      finalScore: 42,
      totalScore: 84,
      letterGrade: 'A',
      gradePoint: 4.0,
      status: 'IN_PROGRESS',
    },
  })

  // Create Enrollments for delight (Roll 1236)
  await prisma.enrollment.create({
    data: {
      studentId: delight.id,
      courseId: cs301.id,
      semester: 3,
      academicYear: '2023/2024',
      assignmentScore: 15,
      midtermScore: 22,
      finalScore: 38,
      totalScore: 75,
      letterGrade: 'B',
      gradePoint: 3.0,
      status: 'COMPLETED',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('\nCreated:')
  console.log('   - 4 courses')
  console.log('   - 3 students')
  console.log('   - 8 enrollments')
  console.log('\nTry these roll numbers:')
  console.log('   - 1234 (Jude Otim)')
  console.log('   - 1235 (Frank Muhindo)')
  console.log('   - 1236 (Delight Aheebwa)')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })