const express = require('express');
const router = express.Router();

const {PrismaClient} = require('../generated/prisma')
const prisma = new PrismaClient();


// ============================================
// GET ALL STUDENTS WITH FULL DETAILS
// ============================================

router.get('/', async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                enrollments: {
                    include: {
                        course: true
                    },
                    orderBy: {
                        semester: 'asc'
                    }
                }
            },
            orderBy: {
                rollNumber: 'asc'
            }
        });

        // Format the data for easy AI consumption
        const formattedStudents = students.map(student => {
            // Calculate semester-wise performance
            const semesterPerformance = {};
            const completedCourses = student.enrollments.filter(e => e.status === 'COMPLETED');
            
            completedCourses.forEach(enrollment => {
                const semKey = `Semester ${enrollment.semester}`;
                if (!semesterPerformance[semKey]) {
                    semesterPerformance[semKey] = [];
                }
                semesterPerformance[semKey].push({
                    courseCode: enrollment.course.courseCode,
                    courseName: enrollment.course.courseName,
                    grade: enrollment.letterGrade,
                    score: enrollment.totalScore,
                    gradePoint: enrollment.gradePoint
                });
            });

            // Current courses (in progress)
            const currentCourses = student.enrollments
                .filter(e => e.status === 'IN_PROGRESS')
                .map(e => ({
                    courseCode: e.course.courseCode,
                    courseName: e.course.courseName,
                    credits: e.course.credits,
                    instructor: e.course.instructor,
                    instructorEmail: e.course.instructorEmail,
                    semester: e.semester,
                    currentScore: e.totalScore || 'Not graded yet'
                }));

            // All courses
            const allCourses = student.enrollments.map(e => ({
                courseCode: e.course.courseCode,
                courseName: e.course.courseName,
                credits: e.course.credits,
                semester: e.semester,
                academicYear: e.academicYear,
                grade: e.letterGrade || 'In Progress',
                score: e.totalScore,
                status: e.status,
                instructor: e.course.instructor
            }));

            return {
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
                
                // Performance summary
                performance: {
                    completedCoursesCount: completedCourses.length,
                    semesterBreakdown: semesterPerformance,
                    summary: `${student.name} is in semester ${student.currentSemester} with a GPA of ${student.gpa}. They have completed ${completedCourses.length} courses.`
                },
                
                // Current enrollment
                currentCourses: currentCourses,
                
                // Complete course history
                allCourses: allCourses
            };
        });

        res.json({
            success: true,
            data: formattedStudents,
            count: formattedStudents.length,
            message: `Retrieved ${formattedStudents.length} students with complete information`
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving student information',
            error: error.message
        });
    }
});

// POST version (same logic)
router.post('/', async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                enrollments: {
                    include: {
                        course: true
                    },
                    orderBy: {
                        semester: 'asc'
                    }
                }
            },
            orderBy: {
                rollNumber: 'asc'
            }
        });

        const formattedStudents = students.map(student => {
            const semesterPerformance = {};
            const completedCourses = student.enrollments.filter(e => e.status === 'COMPLETED');
            
            completedCourses.forEach(enrollment => {
                const semKey = `Semester ${enrollment.semester}`;
                if (!semesterPerformance[semKey]) {
                    semesterPerformance[semKey] = [];
                }
                semesterPerformance[semKey].push({
                    courseCode: enrollment.course.courseCode,
                    courseName: enrollment.course.courseName,
                    grade: enrollment.letterGrade,
                    score: enrollment.totalScore,
                    gradePoint: enrollment.gradePoint
                });
            });

            const currentCourses = student.enrollments
                .filter(e => e.status === 'IN_PROGRESS')
                .map(e => ({
                    courseCode: e.course.courseCode,
                    courseName: e.course.courseName,
                    credits: e.course.credits,
                    instructor: e.course.instructor,
                    instructorEmail: e.course.instructorEmail,
                    semester: e.semester,
                    currentScore: e.totalScore || 'Not graded yet'
                }));

            const allCourses = student.enrollments.map(e => ({
                courseCode: e.course.courseCode,
                courseName: e.course.courseName,
                credits: e.course.credits,
                semester: e.semester,
                academicYear: e.academicYear,
                grade: e.letterGrade || 'In Progress',
                score: e.totalScore,
                status: e.status,
                instructor: e.course.instructor
            }));

            return {
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
                performance: {
                    completedCoursesCount: completedCourses.length,
                    semesterBreakdown: semesterPerformance,
                    summary: `${student.name} is in semester ${student.currentSemester} with a GPA of ${student.gpa}. They have completed ${completedCourses.length} courses.`
                },
                currentCourses: currentCourses,
                allCourses: allCourses
            };
        });

        res.json({
            success: true,
            data: formattedStudents,
            count: formattedStudents.length,
            message: `Retrieved ${formattedStudents.length} students with complete information`
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving student information',
            error: error.message
        });
    }
});

module.exports = router;