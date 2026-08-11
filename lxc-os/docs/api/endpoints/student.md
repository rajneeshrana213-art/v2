# Student Dashboard API Documentation

This document covers all API endpoints available for the Student Dashboard.

## General
### Get Student Dashboard Data
- **Endpoint**: `GET /api/v1/dashboard/student`
- **Description**: Returns summary data for the student dashboard, including attendance, performance, and upcoming tasks.

---

## Academic
### Assignments
- **View Assignments**: `GET /api/v1/student/assignment/view`
- **Submit Assignment**: `POST /api/v1/student/assignment/submit`
- **Description**: Allows students to view and submit their class assignments.

### Homework
- **View Homework**: `GET /api/v1/student/homework/view`
- **Submit Homework**: `POST /api/v1/student/homework/submit`
- **Description**: Allows students to view and submit their homework.

### Roadmap
- **View Roadmap**: `GET /api/v1/student/roadmap/view`
- **Description**: Returns the learning roadmap for the student.

---

## Engagement
### Leaderboard
- **Monthly Leaderboard**: `GET /api/v1/student/leaderboard/monthly`
- **Class Leaderboard**: `GET /api/v1/student/leaderboard/class`
- **Description**: Returns student rankings based on performance.

---

## Identity
### ID Card
- **Get ID Card Data**: `GET /api/v1/student/id-card`
- **Description**: Returns data required to generate/view student ID card.
