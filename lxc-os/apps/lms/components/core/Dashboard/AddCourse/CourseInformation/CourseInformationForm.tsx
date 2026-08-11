import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { HiOutlineCurrencyRupee } from "react-icons/hi"
import { MdNavigateNext } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import { setCourse, setStep } from "../../../../../lib/state/slices/course-slice"
import { COURSE_STATUS } from "../../../../../lib/constants"
import IconBtn from "../../../../Common/IconBtn"
import Upload from "../Upload"
import ChipInput from "./ChipInput"
import RequirementsField from "./RequirementsField"

export default function CourseInformationForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { user } = useSelector((state: any) => state.profile) // Placeholder for session info
  const { course, editCourse } = useSelector((state: any) => state.course)
  const [loading, setLoading] = useState(false)
  const [courseCategories, setCourseCategories] = useState([])

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/category")
        const data = await response.json()
        if (data.success) {
          setCourseCategories(data.data)
        }
      } catch (error) {
        console.error("Could not fetch categories", error)
      }
      setLoading(false)
    }

    if (editCourse && course) {
      setValue("courseTitle", course.courseName)
      setValue("courseShortDesc", course.courseDescription)
      setValue("coursePrice", course.price)
      setValue("courseTags", course.tag)
      setValue("courseBenefits", course.whatYouWillLearn)
      setValue("courseCategory", course.categoryId)
      setValue("courseRequirements", course.instructions)
      setValue("courseImage", course.thumbnail)
    }
    getCategories()
  }, [editCourse, course, setValue])

  const onSubmit = async (data: any) => {
    const formData = new FormData()
    formData.append("courseName", data.courseTitle)
    formData.append("courseDescription", data.courseShortDesc)
    formData.append("price", data.coursePrice)
    formData.append("tag", JSON.stringify(data.courseTags))
    formData.append("whatYouWillLearn", data.courseBenefits)
    formData.append("category", data.courseCategory)
    formData.append("status", COURSE_STATUS.DRAFT)
    formData.append("instructions", JSON.stringify(data.courseRequirements))
    formData.append("thumbnailImage", data.courseImage)
    
    setLoading(true)
    const toastId = toast.loading("Saving Course Details...")
    try {
      const response = await fetch("/api/course/create", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()

      if (result.success) {
        toast.success("Course Information Saved")
        dispatch(setStep(2))
        dispatch(setCourse(result.data))
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Could Not Save Course Information")
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6 text-white"
    >
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseTitle">
          Course Title <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="courseTitle"
          placeholder="Enter Course Title"
          {...register("courseTitle", { required: true })}
          className="form-style w-full bg-richblack-700 p-3 rounded-md outline-none"
        />
        {errors.courseTitle && <span className="text-xs text-pink-200">Course title is required</span>}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseShortDesc">
          Course Description <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseShortDesc"
          placeholder="Enter Description"
          {...register("courseShortDesc", { required: true })}
          className="form-style min-h-[130px] w-full bg-richblack-700 p-3 rounded-md outline-none"
        />
        {errors.courseShortDesc && <span className="text-xs text-pink-200">Description is required</span>}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="coursePrice">
          Course Price <sup className="text-pink-200">*</sup>
        </label>
        <div className="relative">
          <input
            id="coursePrice"
            placeholder="Enter Course Price"
            {...register("coursePrice", { required: true, valueAsNumber: true })}
            className="form-style w-full bg-richblack-700 p-3 pl-12 rounded-md outline-none"
          />
          <HiOutlineCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl text-richblack-400" />
        </div>
        {errors.coursePrice && <span className="text-xs text-pink-200">Price is required</span>}
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseCategory">
          Course CourseCategory <sup className="text-pink-200">*</sup>
        </label>
        <select
          {...register("courseCategory", { required: true })}
          defaultValue=""
          id="courseCategory"
          className="form-style w-full bg-richblack-700 p-3 rounded-md outline-none"
        >
          <option value="" disabled>Choose a CourseCategory</option>
          {courseCategories.map((category: any, index) => (
            <option key={index} value={category.id}>{category.name}</option>
          ))}
        </select>
        {errors.courseCategory && <span className="text-xs text-pink-200">CourseCategory is required</span>}
      </div>

      <ChipInput
        label="Tags"
        name="courseTags"
        placeholder="Enter Tags and press Enter"
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
      />

      <Upload
        name="courseImage"
        label="Course Thumbnail"
        register={register}
        setValue={setValue}
        errors={errors}
        editData={editCourse ? course?.thumbnail : null}
      />

      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseBenefits">
          Benefits of the course <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseBenefits"
          placeholder="Enter benefits"
          {...register("courseBenefits", { required: true })}
          className="form-style min-h-[130px] w-full bg-richblack-700 p-3 rounded-md outline-none"
        />
        {errors.courseBenefits && <span className="text-xs text-pink-200">Benefits are required</span>}
      </div>

      <RequirementsField
        name="courseRequirements"
        label="Requirements/Instructions"
        register={register}
        setValue={setValue}
        errors={errors}
        getValues={getValues}
      />

      <div className="flex justify-end gap-x-2">
        {editCourse && (
          <button
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            className="flex items-center gap-x-2 rounded-md bg-richblack-300 py-2 px-5 font-semibold text-richblack-900"
          >
            Continue Without Saving
          </button>
        )}
        <IconBtn disabled={loading} text={!editCourse ? "Next" : "Save Changes"}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  )
}
