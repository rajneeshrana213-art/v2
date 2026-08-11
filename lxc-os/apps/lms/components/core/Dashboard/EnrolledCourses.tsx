import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"

interface EnrolledCoursesProps {
  // Add props if needed
}

export default function EnrolledCourses() {
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<any[] | null>(null)

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const response = await fetch("/api/course/enrolled")
        const result = await response.json()
        if (result.success) {
          // Filtering published courses (MERN logic)
          const published = result.data.filter((course: any) => course.status !== "Draft")
          setEnrolledCourses(published)
        } else {
          throw new Error(result.message)
        }
      } catch (error: any) {
        console.error("Fetch enrolled courses error:", error)
        toast.error("Could not fetch enrolled courses")
      }
    }
    fetchEnrolledCourses()
  }, [])

  return (
    <div className="text-white">
      <div className="text-3xl font-medium text-richblack-50">Enrolled Courses</div>
      {!enrolledCourses ? (
        <div className="grid min-h-[calc(100vh-10rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      ) : !enrolledCourses.length ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet.
        </p>
      ) : (
        <div className="my-8 text-richblack-5">
          {/* Headings */}
          <div className="flex rounded-t-lg bg-richblack-500 ">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3">Duration</p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>
          {/* Course List */}
          {enrolledCourses.map((course, i, arr) => (
            <div
              className={`flex items-center border border-richblack-700 ${
                i === arr.length - 1 ? "rounded-b-lg" : "rounded-none"
              }`}
              key={course.id}
            >
              <div
                className="flex w-[45%] cursor-pointer items-center gap-4 px-5 py-3"
                onClick={() => {
                  if (course.courseContent?.[0]?.subSection?.[0]?.id) {
                    router.push(
                      `/view-course/${course.id}/section/${course.courseContent[0].id}/sub-section/${course.courseContent[0].subSection[0].id}`
                    )
                  }
                }}
              >
                <img
                  src={course.thumbnail}
                  alt="course_img"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course.courseName}</p>
                  <p className="text-xs text-richblack-300">
                    {course.courseDescription.length > 50
                      ? `${course.courseDescription.slice(0, 50)}...`
                      : course.courseDescription}
                  </p>
                </div>
              </div>
              <div className="w-1/4 px-2 py-3">{course.totalDuration}</div>
              <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                <p>Progress: {course.progressPercentage || 0}%</p>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                  bgColor="#FFD60A"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
