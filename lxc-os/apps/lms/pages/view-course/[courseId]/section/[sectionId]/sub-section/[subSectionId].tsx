import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import CourseReviewModal from "../../../../../../components/core/ViewCourse/CourseReviewModal"
import VideoDetailsSidebar from "../../../../../../components/core/ViewCourse/VideoDetailsSidebar"
import VideoDetails from "../../../../../../components/core/ViewCourse/VideoDetails"
import DashboardLayout from "../../../../../../components/core/Dashboard/DashboardLayout"
import {
  setCompletedLectures,
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
} from "../../../../../../lib/state/slices/view-course-slice"

export default function ViewCoursePage() {
  const router = useRouter()
  const { courseId } = router.query
  const dispatch = useDispatch()
  const [reviewModal, setReviewModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId) return

    const fetchCourseData = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/course/details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        })
        const result = await response.json()
        if (result.success) {
          const courseData = result.data
          dispatch(setCourseSectionData(courseData.courseDetails.courseContent))
          dispatch(setEntireCourseData(courseData.courseDetails))
          dispatch(setCompletedLectures(courseData.completedVideos))
          
          let lectures = 0
          courseData?.courseDetails?.courseContent?.forEach((sec: any) => {
            lectures += sec.subSection.length
          })
          dispatch(setTotalNoOfLectures(lectures))
        }
      } catch (error) {
        console.error("Fetch course details error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, dispatch])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[calc(100vh-10rem)] place-items-center">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="relative flex min-h-[calc(100vh-3.5rem)]">
        <VideoDetailsSidebar setReviewModal={setReviewModal} />
        <div className="h-[calc(100vh-3.5rem)] flex-1 overflow-auto">
          <div className="mx-6 py-10">
            <VideoDetails />
          </div>
        </div>
      </div>
      {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
    </DashboardLayout>
  )
}
