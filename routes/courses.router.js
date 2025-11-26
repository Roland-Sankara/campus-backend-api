const express = require('express');
const router = express.Router();

const {PrismaClient} = require('../generated/prisma')
const prisma = new PrismaClient();

// ============================================
// GET ALL COURSES
// ============================================
router.get('/', async (req, res) => {
    try {
        const { department, credits } = req.query;

        // Build filter object
        const where = {};
        if (department) {
            where.department = department;
        }
        if (credits) {
            where.credits = parseInt(credits);
        }

        const courses = await prisma.course.findMany({
            where,
            orderBy: {
                courseCode: 'asc'
            }
        });

        res.json({
            success: true,
            data: courses,
            count: courses.length,
            message: `Found ${courses.length} courses`
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

// ============================================
// GET COURSE BY CODE
// ============================================
router.get('/:courseCode', async (req, res) => {
    try {
        const { courseCode } = req.params;

        const course = await prisma.course.findUnique({
            where: {
                courseCode: courseCode.toUpperCase()
            }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Course ${courseCode} not found`,
                error: 'COURSE_NOT_FOUND'
            });
        }

        res.json({
            success: true,
            data: course,
            message: `Found course: ${course.courseName}`
        });

    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving course',
            error: error.message
        });
    }
});

// ============================================
// GET COURSE DETAILS WITH ENROLLMENT COUNT
// ============================================
router.get('/:courseCode/details', async (req, res) => {
    try {
        const { courseCode } = req.params;

        const course = await prisma.course.findUnique({
            where: {
                courseCode: courseCode.toUpperCase()
            },
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
            }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Count enrollments by status
        const enrollmentStats = {
            total: course.enrollments.length,
            inProgress: course.enrollments.filter(e => e.status === 'IN_PROGRESS').length,
            completed: course.enrollments.filter(e => e.status === 'COMPLETED').length
        };

        const response = {
            success: true,
            data: {
                courseCode: course.courseCode,
                courseName: course.courseName,
                credits: course.credits,
                department: course.department,
                description: course.description,
                instructor: course.instructor,
                instructorEmail: course.instructorEmail,
                enrollmentStats,
                currentStudents: course.enrollments
                    .filter(e => e.status === 'IN_PROGRESS')
                    .map(e => ({
                        rollNumber: e.student.rollNumber,
                        name: e.student.name,
                        semester: e.semester
                    }))
            }
        };

        res.json(response);

    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving course details',
            error: error.message
        });
    }
});

// ============================================
// GET COURSES BY DEPARTMENT
// ============================================
router.get('/department/:departmentName', async (req, res) => {
    try {
        const { departmentName } = req.params;

        const courses = await prisma.course.findMany({
            where: {
                department: {
                    equals: departmentName,
                    mode: 'insensitive'
                }
            },
            orderBy: {
                courseCode: 'asc'
            }
        });

        res.json({
            success: true,
            data: {
                department: departmentName,
                courses: courses,
                count: courses.length
            },
            message: `Found ${courses.length} courses in ${departmentName} department`
        });

    } catch (error) {
        console.error('Error fetching department courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving department courses',
            error: error.message
        });
    }
});

// ============================================
// GET COURSE INSTRUCTOR INFO
// ============================================
router.get('/:courseCode/instructor', async (req, res) => {
    try {
        const { courseCode } = req.params;

        const course = await prisma.course.findUnique({
            where: {
                courseCode: courseCode.toUpperCase()
            },
            select: {
                courseCode: true,
                courseName: true,
                instructor: true,
                instructorEmail: true,
                department: true
            }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.json({
            success: true,
            data: course,
            message: `${course.courseName} is taught by ${course.instructor || 'TBA'}`
        });

    } catch (error) {
        console.error('Error fetching instructor info:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving instructor information',
            error: error.message
        });
    }
});

// ============================================
// SEARCH COURSES
// ============================================
router.post('/search', async (req, res) => {
    try {
        const { query } = req.body;

        const courses = await prisma.course.findMany({
            where: {
                OR: [
                    { courseCode: { contains: query, mode: 'insensitive' } },
                    { courseName: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            }
        });

        res.json({
            success: true,
            data: courses,
            count: courses.length,
            message: `Found ${courses.length} courses matching "${query}"`
        });

    } catch (error) {
        console.error('Error searching courses:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching courses',
            error: error.message
        });
    }
});

// ============================================
// GET AVAILABLE DEPARTMENTS (Helper endpoint)
// ============================================
router.get('/meta/departments', async (req, res) => {
    try {
        const departments = await prisma.course.findMany({
            distinct: ['department'],
            select: {
                department: true
            }
        });

        const departmentList = departments.map(d => d.department);

        res.json({
            success: true,
            data: departmentList,
            count: departmentList.length
        });

    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving departments',
            error: error.message
        });
    }
});

module.exports = router;