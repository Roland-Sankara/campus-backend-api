// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// STUDENT MANAGEMENT
// ============================================

model Student {
  id          String    @id @default(uuid())
  rollNumber  String    @unique @map("roll_number")
  studentName String    @map("student_name")
  email       String    @unique
  phone       String?
  dateOfBirth DateTime? @map("date_of_birth")
  gender      Gender?
  nationality String?   @default("Ugandan")

  // Academic Info
  currentSemester Int           @default(1) @map("current_semester")
  academicYear    String        @map("academic_year")
  enrollmentDate  DateTime      @default(now()) @map("enrollment_date")
  graduationDate  DateTime?     @map("graduation_date")
  status          StudentStatus @default(ACTIVE)

  // Program Information
  programId String  @map("program_id")
  program   Program @relation(fields: [programId], references: [id])

  departmentId String     @map("department_id")
  department   Department @relation(fields: [departmentId], references: [id])

  // Performance
  cumulativeGPA Float? @default(0.0) @map("cumulative_gpa")
  totalCredits  Int    @default(0) @map("total_credits")

  // Address
  address String?
  city    String? @default("Kampala")
  country String? @default("Uganda")

  // Emergency Contact
  emergencyContactName  String? @map("emergency_contact_name")
  emergencyContactPhone String? @map("emergency_contact_phone")

  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  enrollments Enrollment[]
  grades      Grade[]
  attendance  Attendance[]
  fees        FeePayment[]

  @@index([rollNumber])
  @@index([email])
  @@index([programId])
  @@index([departmentId])
  @@map("students")
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum StudentStatus {
  ACTIVE
  SUSPENDED
  GRADUATED
  WITHDRAWN
  ON_LEAVE
}

// ============================================
// ACADEMIC STRUCTURE
// ============================================

model Department {
  id          String  @id @default(uuid())
  code        String  @unique
  name        String
  description String?
  headOfDept  String? @map("head_of_dept")
  email       String?
  phone       String?
  building    String?

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  programs Program[]
  courses  Course[]
  students Student[]
  faculty  Faculty[]

  @@map("departments")
}

model Program {
  id           String     @id @default(uuid())
  code         String     @unique
  name         String
  degree       DegreeType
  duration     Int // Duration in semesters
  totalCredits Int        @map("total_credits")
  description  String?

  departmentId String     @map("department_id")
  department   Department @relation(fields: [departmentId], references: [id])

  admissionRequirements String? @map("admission_requirements")
  tuitionFee            Float?  @map("tuition_fee")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  students Student[]
  courses  Course[]

  @@index([departmentId])
  @@map("programs")
}

enum DegreeType {
  CERTIFICATE
  DIPLOMA
  BACHELOR
  MASTER
  PHD
}

// ============================================
// COURSES
// ============================================

model Course {
  id          String     @id @default(uuid())
  courseCode  String     @unique @map("course_code")
  courseName  String     @map("course_name")
  description String?
  credits     Int        @default(3)
  level       Int // 100, 200, 300, 400 etc
  courseType  CourseType @default(CORE) @map("course_type")

  // Department/Program
  departmentId String     @map("department_id")
  department   Department @relation(fields: [departmentId], references: [id])

  programId String?  @map("program_id")
  program   Program? @relation(fields: [programId], references: [id])

  // Prerequisites
  prerequisites String? // Comma-separated course codes

  // Semester availability
  offeredSemesters String @default("1,2") @map("offered_semesters") // Which semesters course is offered

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  sections    CourseSection[]
  enrollments Enrollment[]
  grades      Grade[]

  @@index([courseCode])
  @@index([departmentId])
  @@index([programId])
  @@map("courses")
}

enum CourseType {
  CORE // Required courses
  ELECTIVE // Optional courses
  GENERAL // General education
  PREREQUISITE // Prerequisite courses
}

model CourseSection {
  id            String @id @default(uuid())
  sectionNumber String @map("section_number")

  courseId String @map("course_id")
  course   Course @relation(fields: [courseId], references: [id])

  facultyId String  @map("faculty_id")
  faculty   Faculty @relation(fields: [facultyId], references: [id])

  // Schedule
  semester      Int
  academicYear  String  @map("academic_year")
  schedule      String? // e.g., "Mon/Wed 10:00-11:30"
  room          String?
  maxCapacity   Int?    @map("max_capacity")
  enrolledCount Int     @default(0) @map("enrolled_count")

  // Status
  status SectionStatus @default(OPEN)

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  enrollments Enrollment[]
  attendance  Attendance[]

  @@unique([courseId, sectionNumber, semester, academicYear])
  @@index([courseId])
  @@index([facultyId])
  @@index([semester, academicYear])
  @@map("course_sections")
}

enum SectionStatus {
  OPEN
  CLOSED
  CANCELLED
  COMPLETED
}

// ============================================
// ENROLLMENTS & GRADES
// ============================================

model Enrollment {
  id String @id @default(uuid())

  studentId String  @map("student_id")
  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  courseId String @map("course_id")
  course   Course @relation(fields: [courseId], references: [id])

  sectionId String        @map("section_id")
  section   CourseSection @relation(fields: [sectionId], references: [id])

  // Enrollment Details
  semester       Int
  academicYear   String           @map("academic_year")
  enrollmentDate DateTime         @default(now()) @map("enrollment_date")
  status         EnrollmentStatus @default(ENROLLED)

  // Drop/Withdrawal
  dropDate   DateTime? @map("drop_date")
  dropReason String?   @map("drop_reason")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  grade Grade?

  @@unique([studentId, courseId, semester, academicYear])
  @@index([studentId])
  @@index([courseId])
  @@index([sectionId])
  @@index([semester, academicYear])
  @@map("enrollments")
}

enum EnrollmentStatus {
  ENROLLED
  DROPPED
  COMPLETED
  FAILED
  WITHDRAWN
  IN_PROGRESS
}

model Grade {
  id String @id @default(uuid())

  studentId String  @map("student_id")
  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  courseId String @map("course_id")
  course   Course @relation(fields: [courseId], references: [id])

  enrollmentId String     @unique @map("enrollment_id")
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)

  // Grades breakdown
  assignmentScore Float? @map("assignment_score") // Out of 20
  midtermScore    Float? @map("midterm_score") // Out of 30
  finalExamScore  Float? @map("final_exam_score") // Out of 50

  // Final grade
  totalScore  Float?  @map("total_score") // Out of 100
  letterGrade String? @map("letter_grade") // A+, A, B+, etc
  gradePoint  Float?  @map("grade_point") // 4.0 scale

  // Semester info
  semester     Int
  academicYear String @map("academic_year")

  // Remarks
  remarks  String?
  gradedBy String?   @map("graded_by")
  gradedAt DateTime? @map("graded_at")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([studentId, courseId, semester, academicYear])
  @@index([studentId])
  @@index([courseId])
  @@index([semester, academicYear])
  @@map("grades")
}

// ============================================
// ATTENDANCE
// ============================================

model Attendance {
  id String @id @default(uuid())

  studentId String  @map("student_id")
  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  sectionId String        @map("section_id")
  section   CourseSection @relation(fields: [sectionId], references: [id])

  // Attendance details
  date    DateTime
  status  AttendanceStatus
  remarks String?

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([studentId, sectionId, date])
  @@index([studentId])
  @@index([sectionId])
  @@index([date])
  @@map("attendance")
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

// ============================================
// FACULTY
// ============================================

model Faculty {
  id         String  @id @default(uuid())
  employeeId String  @unique @map("employee_id")
  firstName  String  @map("first_name")
  lastName   String  @map("last_name")
  email      String  @unique
  phone      String?

  // Academic credentials
  title          String? // Dr., Prof., etc
  qualification  String? // PhD, MSc, etc
  specialization String?

  departmentId String     @map("department_id")
  department   Department @relation(fields: [departmentId], references: [id])

  // Employment
  position       String? // Lecturer, Professor, etc
  employmentType String?   @map("employment_type") // Full-time, Part-time
  hireDate       DateTime? @map("hire_date")

  officeLocation String? @map("office_location")
  officeHours    String? @map("office_hours")

  isActive Boolean @default(true) @map("is_active")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  sections CourseSection[]

  @@index([employeeId])
  @@index([departmentId])
  @@map("faculty")
}

// ============================================
// FEES & PAYMENTS
// ============================================

model FeePayment {
  id String @id @default(uuid())

  studentId String  @map("student_id")
  student   Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  // Payment details
  semester     Int
  academicYear String @map("academic_year")

  amountDue  Float @map("amount_due")
  amountPaid Float @map("amount_paid")
  balance    Float @default(0)

  paymentDate   DateTime      @map("payment_date")
  paymentMethod PaymentMethod @map("payment_method")
  transactionId String?       @unique @map("transaction_id")

  status PaymentStatus @default(PENDING)

  remarks String?

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([studentId])
  @@index([semester, academicYear])
  @@index([status])
  @@map("fee_payments")
}

enum PaymentMethod {
  CASH
  MOBILE_MONEY
  BANK_TRANSFER
  CREDIT_CARD
  CHEQUE
}

enum PaymentStatus {
  PENDING
  PAID
  PARTIAL
  OVERDUE
  REFUNDED
}

// ============================================
// ADDITIONAL SUPPORT TABLES
// ============================================

model Announcement {
  id       String               @id @default(uuid())
  title    String
  content  String
  category AnnouncementCategory
  priority Priority             @default(NORMAL)

  // Target audience
  targetType  String  @map("target_type") // ALL, DEPARTMENT, PROGRAM, SEMESTER
  targetValue String? @map("target_value") // Specific dept/program/semester

  publishDate DateTime  @default(now()) @map("publish_date")
  expiryDate  DateTime? @map("expiry_date")

  isActive Boolean @default(true) @map("is_active")

  createdBy String   @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@index([publishDate])
  @@map("announcements")
}

enum AnnouncementCategory {
  ACADEMIC
  ADMINISTRATIVE
  EVENT
  EXAM
  FEE
  GENERAL
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

model ExamSchedule {
  id String @id @default(uuid())

  courseId String @map("course_id")

  examType  ExamType @map("exam_type")
  examDate  DateTime @map("exam_date")
  startTime String   @map("start_time")
  duration  Int // in minutes

  venue        String
  semester     Int
  academicYear String @map("academic_year")

  instructions String?

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([courseId])
  @@index([examDate])
  @@index([semester, academicYear])
  @@map("exam_schedules")
}

enum ExamType {
  MIDTERM
  FINAL
  QUIZ
  PRACTICAL
}

model ChatLog {
  id String @id @default(uuid())

  studentId  String? @map("student_id")
  rollNumber String? @map("roll_number")

  // Conversation details
  query    String
  response String
  intent   String? // What the user was asking about

  // Metadata
  sessionId String? @map("session_id")
  channel   String  @default("voice") // voice, web, phone

  // Function calls made
  functionsCalled String? @map("functions_called") // JSON array of function calls

  // Satisfaction
  wasHelpful Boolean? @map("was_helpful")
  feedback   String?

  timestamp DateTime @default(now())

  @@index([studentId])
  @@index([rollNumber])
  @@index([timestamp])
  @@map("chat_logs")
}
