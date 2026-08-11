import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"

import { resetCourseState, setStep } from "../../../../../lib/state/slices/course-slice"
import { COURSE_STATUS } from "../../../../../lib/constants"
import IconBtn from "../../../../Common/IconBtn"

export default function PublishCourse() {
  const { register, handleSubmit, setValue, getValues } = useForm()
  const dispatch = useDispatch()
  const router = useRouter()
  const { course } = useSelector((state: any) => state.course)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course?.status === COURSE_STATUS.PUBLISHED) {
      setValue("public", true)
    }
  }, [course, setValue])

  const goBack = () => {
    dispatch(setStep(2))
  }

  const goToCourses = () => {
    dispatch(resetCourseState())
    router.push("/dashboard/my-courses")
  }

  const handleCoursePublish = async () => {
    // Check if form has been updated
    const isPublished = getValues("public")
    if (
      (course?.status === COURSE_STATUS.PUBLISHED && isPublished === true) ||
      (course?.status === COURSE_STATUS.DRAFT && isPublished === false)
    ) {
      goToCourses()
      return
    }

    const formData = new FormData()
    formData.append("courseId", course.id)
    const courseStatus = isPublished ? COURSE_STATUS.PUBLISHED : COURSE_STATUS.DRAFT
    formData.append("status", courseStatus)

    setLoading(true)
    const toastId = toast.loading("Updating Course Status...")
    try {
      const response = await fetch("/api/course/update", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()

      if (result.success) {
        toast.success("Course status updated")
        goToCourses()
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Could Not Update Course")
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  const onSubmit = (data: any) => {
    handleCoursePublish()
  }

  return (
    <div className="rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 text-white">
      <p className="text-2xl font-semibold text-richblack-5">Publish Settings</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Checkbox */}
        <div className="my-6 mb-8">
          <label htmlFor="public" className="inline-flex items-center text-lg cursor-pointer">
            <input
              type="checkbox"
              id="public"
              {...register("public")}
              className="h-4 w-4 rounded bg-richblack-500 text-richblack-400 focus:ring-2 focus:ring-richblack-5"
            />
            <span className="ml-2 text-richblack-400">Make this course as public</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="ml-auto flex max-w-max items-center gap-x-4">
          <button
            disabled={loading}
            type="button"
            onClick={goBack}
            className="flex items-center gap-x-2 rounded-md bg-richblack-300 py-2 px-5 font-semibold text-richblack-900"
          >
            Back
          </button>
          <IconBtn disabled={loading} text="Save Changes" />
        </div>
      </form>
    </div>
  )
}
