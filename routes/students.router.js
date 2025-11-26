const express = require('express');
const router = express.Router();

const {PrismaClient} = require('../generated/prisma')
const prisma = new PrismaClient();


// ============================================
// GET STUDENT BY ROLL NUMBER
// ============================================

router.get('/:rollNumber', async (req, res) => {
    try {
        const { rollNumber } = req.params;

        // Find student with all enrollments and course details
        const student = await prisma.student.findUnique({
            where: {
                rollNumber: rollNumber
            },
            include: {
                enrollments: {
                    include: {
                        course: true
                    },
                    orderBy: {
                        semester: 'asc'
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: `Student with roll number ${rollNumber} not found`,
                error: 'STUDENT_NOT_FOUND'
            });
        }

        // Format the response for easy AI consumption
        const formattedResponse = {
            success: true,
            data: {
                rollNumber: student.rollNumber,
                name: student.name,
                email: student.email,
                phone: student.phone,
                currentSemester: student.currentSemester,
                program: student.programName,
                department: student.department,
                gpa: student.gpa,
                totalCredits: student.totalCredits,
                status: student.status,
                courses: student.enrollments.map(enrollment => ({
                    courseCode: enrollment.course.courseCode,
                    courseName: enrollment.course.courseName,
                    credits: enrollment.course.credits,
                    semester: enrollment.semester,
                    academicYear: enrollment.academicYear,
                    grade: enrollment.letterGrade || 'In Progress',
                    score: enrollment.totalScore,
                    status: enrollment.status
                }))
            },
            message: `Found student: ${student.name}`
        };

        res.json(formattedResponse);

    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving student information',
            error: error.message
        });
    }
});

// ============================================
// GET STUDENT PERFORMANCE/GRADES
// ============================================
router.get('/:rollNumber/performance', async (req, res) => {
    try {
        const { rollNumber } = req.params;

        const student = await prisma.student.findUnique({
            where: { rollNumber },
            include: {
                enrollments: {
                    include: {
                        course: true
                    },
                    where: {
                        status: 'COMPLETED'
                    },
                    orderBy: {
                        semester: 'asc'
                    }
                }
            }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Calculate semester-wise performance
        const semesterPerformance = {};
        student.enrollments.forEach(enrollment => {
            const semKey = `Semester ${enrollment.semester}`;
            if (!semesterPerformance[semKey]) {
                semesterPerformance[semKey] = [];
            }
            semesterPerformance[semKey].push({
                course: enrollment.course.courseName,
                courseCode: enrollment.course.courseCode,
                grade: enrollment.letterGrade,
                score: enrollment.totalScore,
                gradePoint: enrollment.gradePoint
            });
        });

        // Create a readable performance summary
        const performanceDetails = student.enrollments.map(e => 
            `${e.course.courseName} (${e.course.courseCode}): ${e.letterGrade} - ${e.totalScore}%`
        ).join(', ');

        const response = {
            success: true,
            data: {
                rollNumber: student.rollNumber,
                name: student.name,
                currentSemester: student.currentSemester,
                gpa: student.gpa,
                totalCredits: student.totalCredits,
                completedCourses: student.enrollments.length,
                semesterBreakdown: semesterPerformance,
                performanceDetails: performanceDetails,
                summary: `${student.name} is in semester ${student.currentSemester} with a GPA of ${student.gpa}. They have completed ${student.enrollments.length} courses.`
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching performance:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving performance data',
            error: error.message
        });
    }
});

// ============================================
// GET STUDENT CURRENT SEMESTER COURSES
// ============================================
router.get('/:rollNumber/current-courses', async (req, res) => {
    try {
        const { rollNumber } = req.params;

        // First, get the student to find their current semester
        const student = await prisma.student.findUnique({
            where: { rollNumber }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Then get current semester courses (IN_PROGRESS status)
        const currentCourses = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                status: 'IN_PROGRESS'
            },
            include: {
                course: true
            }
        });

        const response = {
            success: true,
            data: {
                rollNumber: student.rollNumber,
                name: student.name,
                currentSemester: student.currentSemester,
                courses: currentCourses.map(e => ({
                    courseCode: e.course.courseCode,
                    courseName: e.course.courseName,
                    credits: e.course.credits,
                    instructor: e.course.instructor,
                    instructorEmail: e.course.instructorEmail,
                    currentScore: e.totalScore || 'Not graded yet',
                    status: e.status
                })),
                totalCourses: currentCourses.length
            },
            message: `${student.name} is currently enrolled in ${currentCourses.length} courses`
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching current courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving current courses',
            error: error.message
        });
    }
});

// ============================================
// GET STUDENT COURSES BY SEMESTER
// ============================================
router.get('/:rollNumber/semester/:semesterNumber', async (req, res) => {
    try {
        const { rollNumber, semesterNumber } = req.params;
        const semester = parseInt(semesterNumber);

        const student = await prisma.student.findUnique({
            where: { rollNumber }
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: student.id,
                semester: semester
            },
            include: {
                course: true
            }
        });

        const response = {
            success: true,
            data: {
                rollNumber: student.rollNumber,
                name: student.name,
                semester: semester,
                courses: enrollments.map(e => ({
                    courseCode: e.course.courseCode,
                    courseName: e.course.courseName,
                    credits: e.course.credits,
                    grade: e.letterGrade || 'In Progress',
                    score: e.totalScore,
                    status: e.status
                })),
                totalCourses: enrollments.length
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching semester courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving semester courses',
            error: error.message
        });
    }
});


// ============================================
// SEARCH STUDENTS (Optional - useful for AI)
// ============================================
router.post('/search', async (req, res) => {
    try {
        const { query } = req.body;

        const students = await prisma.student.findMany({
            where: {
                OR: [
                    { rollNumber: { contains: query } },
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                rollNumber: true,
                name: true,
                email: true,
                currentSemester: true,
                programName: true,
                gpa: true
            }
        });

        res.json({
            success: true,
            data: students,
            count: students.length
        });

    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching students',
            error: error.message
        });
    }
});

module.exports = router;