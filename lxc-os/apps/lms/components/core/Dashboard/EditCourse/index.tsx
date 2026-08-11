import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"

import {
  getFullDetailsOfCourse,
} from "../../../../services/operations/courseDetailsAPI"
import { setCourse, setEditCourse } from "../../../../lib/state/slices/course-slice"
import RenderSteps from "../AddCourse/RenderSteps"
import { RootState } from "../../../../lib/state/reducer"

export default function EditCourse() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { id: courseId } = router.query
  const { course } = useSelector((state: RootState) => state.course)
  const [loading, setLoading] = useState(false)
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    ;(async () => {
      if (courseId && token) {
          setLoading(true)
          const result = await getFullDetailsOfCourse(courseId as string, token)
          if (result) {
            dispatch(setEditCourse(true))
            dispatch(setCourse(result))
          }
          setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token, dispatch])

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">
        Edit Course
      </h1>
      <div className="mx-auto max-w-[600px]">
        {course ? (
          <RenderSteps />
        ) : (
          <p className="mt-14 text-center text-3xl font-semibold text-richblack-100">
            Course not found
          </p>
        )}
      </div>
    </div>
  )
}
