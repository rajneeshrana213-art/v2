# EdUniHub
**AN ED-TECH PLATFORM**

Created by: Rajneesh Rana

## Project Description
EdUniHub is a fully functional ed-tech platform that enables users to create, consume, and rate educational content. The platform is built using the MERN stack, which includes ReactJS, NodeJS, MongoDB, and ExpressJS.

### Key Features:
- A seamless and interactive learning experience for students.
- A platform for instructors to showcase their expertise and connect with learners globally.

### Table of Contents:
1. System Architecture
2. Front-end
3. Back-end
4. API Design
5. Deployment
6. Testing
7. Future Enhancements

---

## 1. System Architecture
The platform consists of three main components:
- **Front-end:** Built using ReactJS.
- **Back-end:** Powered by NodeJS and ExpressJS.
- **Database:** MongoDB for storing course content and user data.

Here is a high-level diagram illustrating the architecture:

*Add architecture diagram here* (Provide the diagram image)

---

## 2. Front-end
The front end is designed using **Figma** and built with **ReactJS**, with the following pages for students and instructors:

### For Students:
- **Homepage:** Brief introduction with course list.
- **Course List:** Display of available courses.
- **Wishlist:** List of courses the student has added.
- **Cart Checkout:** Complete course purchase.
- **Course Content:** Includes videos and related materials.
- **User Details:** Student's account information.
- **User Edit Details:** Update student's account details.

### For Instructors:
- **Dashboard:** Overview of the instructor's courses and ratings.
- **Insights:** Detailed course metrics.
- **Course Management Pages:** Create, update, and delete courses.
- **View and Edit Profile Details:** Manage account information.

Frameworks and libraries used: **ReactJS**, **CSS**, **Tailwind**, **Redux**.

---

## 3. Back-end
The platform uses a **monolithic architecture** with Node.js and Express.js. MongoDB is used as the database.

### Features:
1. **User authentication and authorization**: Includes OTP verification and forgot password functionality.
2. **Course management**: CRUD operations for courses.
3. **Payment integration**: Razorpay integration for payments.
4. **Cloud-based media management**: Uses Cloudinary for storing and managing media.

Tools and frameworks: **Node.js**, **MongoDB**, **Express.js**, **JWT**, **Bcrypt**, **Mongoose**.

### Data Models:
- **Student Schema**
- **Instructor Schema**
- **Course Schema**

---

## 4. API Design
The API follows the **REST** architecture and uses JSON for data exchange.

### Sample API Endpoints:
- `POST /api/auth/signup`: Create a new user account.
- `POST /api/auth/login`: Log in and generate JWT token.
- `POST /api/auth/verify-otp`: Verify the OTP.
- `GET /api/courses`: Get all available courses.
- `POST /api/courses`: Create a new course.

---

## 5. Deployment
- **Front-end**: Deployed on Vercel.
- **Back-end**: Hosted on Render or Railway.
- **Database**: Hosted on MongoDB Atlas.
- **Media files**: Hosted on Cloudinary.

The hosting environment ensures scalability, security, and reliability.

---

## 6. Testing
Testing is conducted using various types of testing frameworks and tools.

---

## 7. Future Enhancements
### Potential future improvements:
1. **Gamification features**: Badges, points, leaderboards.
2. **Personalized learning paths**: Customized for each student.
3. **Social learning features**: Group discussions, peer feedback.
4. **Mobile app**: More convenient access via mobile.
5. **Machine learning-powered recommendations**: Personalized course recommendations.
6. **VR/AR integration**: Enhance learning experiences.

---

## Conclusion
EdUniHub is a versatile ed-tech platform using the MERN stack, with features like course creation, user authentication, and media management. The platform is designed for scalability and user engagement, and there are numerous opportunities for future enhancements.
