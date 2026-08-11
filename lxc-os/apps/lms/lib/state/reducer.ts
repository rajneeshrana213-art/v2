import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "./slices/auth-slice"
import cartReducer from "./slices/cart-slice"
import courseReducer from "./slices/course-slice"
import profileReducer from "./slices/profile-slice"
import viewCourseReducer from "./slices/view-course-slice"

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  course: courseReducer,
  cart: cartReducer,
  viewCourse: viewCourseReducer,
})

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer
