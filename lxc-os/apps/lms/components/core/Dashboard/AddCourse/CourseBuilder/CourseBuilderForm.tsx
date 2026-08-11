import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import { setCourse, setEditCourse, setStep } from "../../../../../lib/state/slices/course-slice"
import IconBtn from "../../../../Common/IconBtn"
import NestedView from "./NestedView"

export default function CourseBuilderForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const { course } = useSelector((state: any) => state.course)
  const [loading, setLoading] = useState(false)
  const [editSectionName, setEditSectionName] = useState<string | null>(null)
  const dispatch = useDispatch()

  const onSubmit = async (data: any) => {
    setLoading(true)
    const toastId = toast.loading(editSectionName ? "Updating CourseSection..." : "Creating CourseSection...")
    try {
      const url = editSectionName ? "/api/course/section/update" : "/api/course/section/create"
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course.id,
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success(editSectionName ? "CourseSection Updated" : "CourseSection Created")
        dispatch(setCourse(result.data))
        setEditSectionName(null)
        setValue("sectionName", "")
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Could Not Update CourseSection")
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  const cancelEdit = () => {
    setEditSectionName(null)
    setValue("sectionName", "")
  }

  const handleChangeEditSectionName = (sectionId: string, sectionName: string) => {
    if (editSectionName === sectionId) {
      cancelEdit()
      return
    }
    setEditSectionName(sectionId)
    setValue("sectionName", sectionName)
  }

  const goToNext = () => {
    if (course.courseContent.length === 0) {
      toast.error("Please add atleast one section")
      return
    }
    if (course.courseContent.some((section: any) => (section.subSection?.length || 0) === 0)) {
      toast.error("Please add atleast one lecture in each section")
      return
    }
    dispatch(setStep(3))
  }

  const goBack = () => {
    dispatch(setStep(1))
    dispatch(setEditCourse(true))
  }

  return (
    <div className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 text-white">
      <p className="text-2xl font-semibold text-richblack-5">Course Builder</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm text-richblack-5" htmlFor="sectionName">
            CourseSection Name <sup className="text-pink-200">*</sup>
          </label>
          <input
            id="sectionName"
            disabled={loading}
            placeholder="Add a section to build your course"
            {...register("sectionName", { required: true })}
            className="form-style w-full bg-richblack-700 p-3 rounded-md outline-none"
          />
          {errors.sectionName && <span className="text-xs text-pink-200">CourseSection name is required</span>}
        </div>
        <div className="flex items-end gap-x-4">
          <IconBtn
            type="submit"
            disabled={loading}
            text={editSectionName ? "Edit CourseSection Name" : "Create CourseSection"}
            outline={true}
          >
            <IoAddCircleOutline size={20} className="text-yellow-50" />
          </IconBtn>
          {editSectionName && (
            <button type="button" onClick={cancelEdit} className="text-sm text-richblack-300 underline">
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      {course.courseContent?.length > 0 && (
        <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
      )}
      <div className="flex justify-end gap-x-3">
        <button onClick={goBack} className="flex items-center gap-x-2 rounded-md bg-richblack-300 py-2 px-5 font-semibold text-richblack-900">
          Back
        </button>
        <IconBtn disabled={loading} text="Next" onclick={goToNext}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </div>
  )
}
