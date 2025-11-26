# CAMPUS Management System API

## Base URL
```
http://localhost:5008/api
```

## Overview
This API provides endpoints for accessing student information, courses, enrollments, and performance data for Campus Student Management System. Designed to integrate with AI voice agents for automated student support.

---

## Student Endpoints

| Method | Endpoint | Description | Parameters | Use Case |
|--------|----------|-------------|------------|----------|
| `GET` | `/api/students` | Get all students | None | List all students in system |
| `GET` | `/api/students/:rollNumber` | Get student by roll number | `rollNumber` (path) | "My roll number is 1234" |
| `GET` | `/api/students/:rollNumber/performance` | Get student performance & grades | `rollNumber` (path) | "What's my performance?" |
| `GET` | `/api/students/:rollNumber/current-courses` | Get current semester courses | `rollNumber` (path) | "What courses am I taking?" |
| `GET` | `/api/students/:rollNumber/semester/:semesterNumber` | Get courses by semester | `rollNumber` (path)<br>`semesterNumber` (path) | "What did I take in semester 1?" |
| `POST` | `/api/students/search` | Search students | `query` (body) | Find student by name/email |

---

## Course Endpoints

| Method | Endpoint | Description | Parameters | Use Case |
|--------|----------|-------------|------------|----------|
| `GET` | `/api/courses` | Get all courses | `department` (query, optional)<br>`credits` (query, optional) | "What courses are available?" |
| `GET` | `/api/courses/:courseCode` | Get course by code | `courseCode` (path) | "Tell me about CS101" |
| `GET` | `/api/courses/:courseCode/details` | Get course with enrollment stats | `courseCode` (path) | "Who teaches CS201?" |
| `GET` | `/api/courses/department/:departmentName` | Get courses by department | `departmentName` (path) | "What ICT courses are there?" |
| `GET` | `/api/courses/:courseCode/instructor` | Get course instructor info | `courseCode` (path) | "Who is the CS301 instructor?" |
| `POST` | `/api/courses/search` | Search courses | `query` (body) | Find course by name/description |
| `GET` | `/api/courses/meta/departments` | Get all departments | None | List available departments |

---

## Request & Response Examples

### Example 1: Get Student Info
**Request:**
```http
GET /api/students/1234
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rollNumber": "1234",
    "name": "John Doe",
    "email": "john.doe@student.isbat.ac.ug",
    "phone": "+256700123456",
    "currentSemester": 3,
    "program": "Bachelor of Computer Science",
    "department": "ICT",
    "gpa": 3.5,
    "totalCredits": 30,
    "status": "ACTIVE",
    "courses": [
      {
        "courseCode": "CS101",
        "courseName": "Introduction to Computer Science",
        "credits": 3,
        "semester": 1,
        "academicYear": "2023/2024",
        "grade": "A",
        "score": 90,
        "status": "COMPLETED"
      }
    ]
  },
  "message": "Found student: John Doe"
}
```

---

### Example 2: Get Student Performance
**Request:**
```http
GET /api/students/1234/performance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rollNumber": "1234",
    "name": "John Doe",
    "currentSemester": 3,
    "gpa": 3.5,
    "totalCredits": 30,
    "completedCourses": 3,
    "semesterBreakdown": {
      "Semester 1": [
        {
          "course": "Introduction to Computer Science",
          "courseCode": "CS101",
          "grade": "A",
          "score": 90,
          "gradePoint": 4.0
        }
      ]
    },
    "performanceDetails": "Introduction to Computer Science (CS101): A - 90%",
    "summary": "John Doe is in semester 3 with a GPA of 3.5. They have completed 3 courses."
  }
}
```

---

### Example 3: Get Course Details
**Request:**
```http
GET /api/courses/CS101
```

**Response:**
```json
{
  "success": true,
  "data": {
    "courseCode": "CS101",
    "courseName": "Introduction to Computer Science",
    "credits": 3,
    "department": "ICT",
    "description": "Fundamentals of computer science and programming",
    "instructor": "Dr. Sarah Johnson",
    "instructorEmail": "sjohnson@isbat.ac.ug"
  },
  "message": "Found course: Introduction to Computer Science"
}
```

---

### Example 4: Search Students
**Request:**
```http
POST /api/students/search
Content-Type: application/json

{
  "query": "John"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rollNumber": "1234",
      "name": "John Doe",
      "email": "john.doe@student.isbat.ac.ug",
      "currentSemester": 3,
      "programName": "Bachelor of Computer Science",
      "gpa": 3.5
    }
  ],
  "count": 1
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Descriptive message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE or detailed error message"
}
```

---

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success - Request completed successfully |
| `404` | Not Found - Student/Course not found |
| `500` | Internal Server Error - Database or server error |

---

## Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `STUDENT_NOT_FOUND` | Student with provided roll number doesn't exist | Verify roll number is correct |
| `COURSE_NOT_FOUND` | Course with provided code doesn't exist | Check course code spelling |
| Database connection error | Unable to connect to database | Check database connection settings |

---

## Voice AI Agent Integration

### Recommended Functions for AI Agent

| Function Name | Endpoint | When to Use |
|---------------|----------|-------------|
| `get_student_info` | `GET /api/students/{rollNumber}` | User provides roll number |
| `get_student_performance` | `GET /api/students/{rollNumber}/performance` | User asks about grades/performance |
| `get_current_courses` | `GET /api/students/{rollNumber}/current-courses` | User asks what courses they're taking |
| `get_course_info` | `GET /api/courses/{courseCode}` | User asks about a specific course |
| `get_course_instructor` | `GET /api/courses/{courseCode}/instructor` | User asks who teaches a course |

---

## Sample Voice Agent Function Configuration

### Function: Get Student Info
```json
{
  "name": "get_student_info",
  "description": "Retrieves complete student information including enrolled courses when given a roll number",
  "parameters": {
    "type": "object",
    "properties": {
      "roll_number": {
        "type": "string",
        "description": "The student's roll number (e.g., '1234')"
      }
    },
    "required": ["roll_number"]
  },
  "url": "https://your-api-url.com/api/students/{roll_number}",
  "method": "GET"
}
```

### Function: Get Student Performance
```json
{
  "name": "get_student_performance",
  "description": "Get detailed academic performance including grades and GPA",
  "parameters": {
    "type": "object",
    "properties": {
      "roll_number": {
        "type": "string",
        "description": "The student's roll number"
      }
    },
    "required": ["roll_number"]
  },
  "url": "https://your-api-url.com/api/students/{roll_number}/performance",
  "method": "GET"
}
```

---

## Quick Test Commands

### Using cURL
```bash
# Get student info
curl http://localhost:5008/api/students/1234

# Get student performance
curl http://localhost:5008/api/students/1234/performance

# Get current courses
curl http://localhost:5008/api/students/1234/current-courses

# Get all courses
curl http://localhost:5008/api/courses

# Get course by code
curl http://localhost:5008/api/courses/CS101

# Search students
curl -X POST http://localhost:5008/api/students/search \
  -H "Content-Type: application/json" \
  -d '{"query":"John"}'
```