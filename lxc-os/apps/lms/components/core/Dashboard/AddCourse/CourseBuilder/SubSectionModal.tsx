import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import { setCourse } from "../../../../../lib/state/slices/course-slice"
import IconBtn from "../../../../Common/IconBtn"
import Upload from "../Upload"

interface SubSectionModalProps {
  modalData: any
  setModalData: (data: any) => void
  add?: boolean
  view?: boolean
  edit?: boolean
}

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}: SubSectionModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm()

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const { course } = useSelector((state: any) => state.course)

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title)
      setValue("lectureDesc", modalData.description)
      setValue("lectureVideo", modalData.videoUrl)
    }
  }, [view, edit, modalData, setValue])

  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    ) {
      return true
    }
    return false
  }

  const handleEditSubsection = async () => {
    const currentValues = getValues()
    const formData = new FormData()
    formData.append("sectionId", modalData.sectionId)
    formData.append("subSectionId", modalData.id)
    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle)
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc)
    }
    if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo)
    }
    
    setLoading(true)
    const toastId = toast.loading("Updating Lecture...")
    try {
      const response = await fetch("/api/course/subsection/update", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        toast.success("Lecture updated successfully")
        dispatch(setCourse(result.data))
        setModalData(null)
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Could Not Update Lecture")
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  const onSubmit = async (data: any) => {
    if (view) return

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
      } else {
        handleEditSubsection()
      }
      return
    }

    const formData = new FormData()
    formData.append("sectionId", modalData)
    formData.append("title", data.lectureTitle)
    formData.append("description", data.lectureDesc)
    formData.append("video", data.lectureVideo)
    
    setLoading(true)
    const toastId = toast.loading("Adding Lecture...")
    try {
      const response = await fetch("/api/course/subsection/create", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      if (result.success) {
        toast.success("Lecture added successfully")
        dispatch(setCourse(result.data))
        setModalData(null)
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Could Not Add Lecture")
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
      <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800 text-white">
        <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
          <p className="text-xl font-semibold text-richblack-5">
            {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
          </p>
          <button onClick={() => (!loading ? setModalData(null) : {})}>
            <RxCross2 className="text-2xl text-richblack-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 px-8 py-10">
          <Upload
            name="lectureVideo"
            label="Lecture Video"
            register={register}
            setValue={setValue}
            errors={errors}
            video={true}
            viewData={view ? modalData.videoUrl : null}
            editData={edit ? modalData.videoUrl : null}
          />
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
              Lecture Title {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <input
              disabled={view || loading}
              id="lectureTitle"
              placeholder="Enter Lecture Title"
              {...register("lectureTitle", { required: true })}
              className="form-style w-full bg-richblack-700 p-3 rounded-md outline-none"
            />
            {errors.lectureTitle && <span className="text-xs text-pink-200">Lecture title is required</span>}
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
              Lecture Description {!view && <sup className="text-pink-200">*</sup>}
            </label>
            <textarea
              disabled={view || loading}
              id="lectureDesc"
              placeholder="Enter Lecture Description"
              {...register("lectureDesc", { required: true })}
              className="form-style resize-x-none min-h-[130px] w-full bg-richblack-700 p-3 rounded-md outline-none"
            />
            {errors.lectureDesc && <span className="text-xs text-pink-200">Lecture Description is required</span>}
          </div>
          {!view && (
            <div className="flex justify-end">
              <IconBtn
                disabled={loading}
                text={loading ? "Loading.." : edit ? "Save Changes" : "Save"}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
