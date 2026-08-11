// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: "https://edhublive.onrender.com/api/v1/auth/sendotp",
  SIGNUP_API: "https://edhublive.onrender.com/api/v1/auth/signup",
  LOGIN_API: "https://edhublive.onrender.com/api/v1/auth/login",
  RESETPASSTOKEN_API: "https://edhublive.onrender.com/api/v1/auth/reset-password-token",
  RESETPASSWORD_API: "https://edhublive.onrender.com/api/v1/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: "https://edhublive.onrender.com/api/v1/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: "https://edhublive.onrender.com/api/v1/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: "https://edhublive.onrender.com/api/v1/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: "https://edhublive.onrender.com/api/v1/payment/capturePayment",
  COURSE_VERIFY_API: "https://edhublive.onrender.com/api/v1/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: "https://edhublive.onrender.com/api/v1/payment/sendPaymentSuccessEmail",
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: "https://edhublive.onrender.com/api/v1/course/getAllCourses",
  COURSE_DETAILS_API: "https://edhublive.onrender.com/api/v1/course/getCourseDetails",
  EDIT_COURSE_API: "https://edhublive.onrender.com/api/v1/course/editCourse",
  COURSE_CATEGORIES_API: "https://edhublive.onrender.com/api/v1/course/showAllCategories",
  CREATE_COURSE_API: "https://edhublive.onrender.com/api/v1/course/createCourse",
  CREATE_SECTION_API: "https://edhublive.onrender.com/api/v1/course/addSection",
  CREATE_SUBSECTION_API: "https://edhublive.onrender.com/api/v1/course/addSubSection",
  UPDATE_SECTION_API: "https://edhublive.onrender.com/api/v1/course/updateSection",
  UPDATE_SUBSECTION_API: "https://edhublive.onrender.com/api/v1/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: "https://edhublive.onrender.com/api/v1/course/getInstructorCourses",
  DELETE_SECTION_API: "https://edhublive.onrender.com/api/v1/course/deleteSection",
  DELETE_SUBSECTION_API: "https://edhublive.onrender.com/api/v1/course/deleteSubSection",
  DELETE_COURSE_API: "https://edhublive.onrender.com/api/v1/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED: "https://edhublive.onrender.com/api/v1/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: "https://edhublive.onrender.com/api/v1/course/updateCourseProgress",
  CREATE_RATING_API: "https://edhublive.onrender.com/api/v1/course/createRating",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: "https://edhublive.onrender.com/api/v1/course/getReviews",
}

// CATEGORIES API
export const categories = {
  CATEGORIES_API: "https://edhublive.onrender.com/api/v1/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: "https://edhublive.onrender.com/api/v1/course/getCategoryPageDetails",
}

// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: "https://edhublive.onrender.com/api/v1/reach/contact",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: "https://edhublive.onrender.com/api/v1/profile/updateDisplayPicture",
  UPDATE_PROFILE_API: "https://edhublive.onrender.com/api/v1/profile/updateProfile",
  CHANGE_PASSWORD_API: "https://edhublive.onrender.com/api/v1/auth/changepassword",
  DELETE_PROFILE_API: "https://edhublive.onrender.com/api/v1/profile/deleteProfile",
}
