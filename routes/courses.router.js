const express = require('express');
const router = express.Router();

const {PrismaClient} = require('../generated/prisma')
const prisma = new PrismaClient();


// ============================================
// GET ALL COURSES WITH FULL DETAILS
// ============================================
router.get('/', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                enrollments: {
                    include: {
                        student: {
                            select: {
                                rollNumber: true,
                                name: true,
                                currentSemester: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                courseCode: 'asc'
            }
        });

        // Format courses with enrollment info
        const formattedCourses = courses.map(course => ({
            courseCode: course.courseCode,
            courseName: course.courseName,
            credits: course.credits,
            department: course.department,
            description: course.description,
            instructor: course.instructor,
            instructorEmail: course.instructorEmail,
            
            // Enrollment statistics
            enrollmentStats: {
                totalEnrolled: course.enrollments.length,
                inProgress: course.enrollments.filter(e => e.status === 'IN_PROGRESS').length,
                completed: course.enrollments.filter(e => e.status === 'COMPLETED').length
            },
            
            // Current students enrolled
            currentStudents: course.enrollments
                .filter(e => e.status === 'IN_PROGRESS')
                .map(e => ({
                    rollNumber: e.student.rollNumber,
                    name: e.student.name,
                    semester: e.semester
                }))
        }));

        res.json({
            success: true,
            data: formattedCourses,
            count: formattedCourses.length,
            message: `Retrieved ${formattedCourses.length} courses with complete information`
        });

    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving courses',
            error: error.message
        });
    }
});

// POST version (same logic)
router.post('/', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                enrollments: {
                    include: {
                        student: {
                            select: {
                                rollNumber: true,
                                name: true,
                                currentSemester: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                courseCode: 'asc'
            }
        });

        const formattedCourses = courses.map(course => ({
            courseCode: course.courseCode,
            courseName: course.courseName,
            credits: course.credits,
            department: course.department,
            description: course.description,
            instructor: course.instructor,
            instructorEmail: course.instructorEmail,
            enrollmentStats: {
                totalEnrolled: course.enrollments.length,
                inProgress: course.enrollments.filter(e => e.status === 'IN_PROGRESS').length,
                completed: course.enrollments.filter(e => e.status === 'COMPLETED').length
            },
            currentStudents: course.enrollments
                .filter(e => e.status === 'IN_PROGRESS')
                .map(e => ({
                    rollNumber: e.student.rollNumber,
                    name: e.student.name,
                    semester: e.semester
                }))
        }));

        res.json({
            success: true,
            data: formattedCourses,
            count: formattedCourses.length,
            message: `Retrieved ${formattedCourses.length} courses with complete information`
        });

    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving courses',
            error: error.message
        });
    }
});

module.exports = router;