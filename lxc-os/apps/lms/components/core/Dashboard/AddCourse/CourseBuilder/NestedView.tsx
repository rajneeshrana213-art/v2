import { useState } from "react"
import { AiFillCaretDown } from "react-icons/ai"
import { FaPlus } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import { RiDeleteBin6Line } from "react-icons/ri"
import { RxDropdownMenu } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"

import { setCourse } from "../../../../../lib/state/slices/course-slice"
import ConfirmationModal from "../../../../Common/ConfirmationModal"
import SubSectionModal from "./SubSectionModal"

interface NestedViewProps {
  handleChangeEditSectionName: (sectionId: string, sectionName: string) => void
}

export default function NestedView({ handleChangeEditSectionName }: NestedViewProps) {
  const { course } = useSelector((state: any) => state.course)
  const dispatch = useDispatch()
  
  const [addSubSection, setAddSubsection] = useState<string | null>(null)
  const [viewSubSection, setViewSubSection] = useState<any>(null)
  const [editSubSection, setEditSubSection] = useState<any>(null)
  const [confirmationModal, setConfirmationModal] = useState<any>(null)

  const handleDeleleSection = async (sectionId: string) => {
    const toastId = toast.loading("Deleting CourseSection...")
    try {
      const response = await fetch("/api/course/section/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, courseId: course.id }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success("CourseSection Deleted")
        dispatch(setCourse(result.data))
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Could Not Delete CourseSection")
    } finally {
      toast.dismiss(toastId)
      setConfirmationModal(null)
    }
  }

  const handleDeleteSubSection = async (subSectionId: string, sectionId: string) => {
    const toastId = toast.loading("Deleting Lecture...")
    try {
      const response = await fetch("/api/course/subsection/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subSectionId, sectionId }),
      })
      const result = await response.json()
      if (result.success) {
        toast.success("Lecture Deleted")
        dispatch(setCourse(result.data))
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast.error(error.message || "Could Not Delete Lecture")
    } finally {
      toast.dismiss(toastId)
      setConfirmationModal(null)
    }
  }

  return (
    <>
      <div className="rounded-lg bg-richblack-700 p-6 px-8 text-white">
        {course?.courseContent?.map((section: any) => (
          <details key={section.id} open>
            <summary className="flex cursor-pointer items-center justify-between border-b-2 border-b-richblack-600 py-2">
              <div className="flex items-center gap-x-3">
                <RxDropdownMenu className="text-2xl text-richblack-50" />
                <p className="font-semibold text-richblack-50">{section.sectionName}</p>
              </div>
              <div className="flex items-center gap-x-3">
                <button onClick={() => handleChangeEditSectionName(section.id, section.sectionName)}>
                  <MdEdit className="text-xl text-richblack-300" />
                </button>
                <button
                  onClick={() =>
                    setConfirmationModal({
                      text1: "Delete this CourseSection?",
                      text2: "All the lectures in this section will be deleted",
                      btn1Text: "Delete",
                      btn2Text: "Cancel",
                      btn1Handler: () => handleDeleleSection(section.id),
                      btn2Handler: () => setConfirmationModal(null),
                    })
                  }
                >
                  <RiDeleteBin6Line className="text-xl text-richblack-300" />
                </button>
                <span className="font-medium text-richblack-300">|</span>
                <AiFillCaretDown className="text-xl text-richblack-300" />
              </div>
            </summary>
            <div className="px-6 pb-4">
              {section.subSection?.map((data: any) => (
                <div
                  key={data.id}
                  onClick={() => setViewSubSection(data)}
                  className="flex cursor-pointer items-center justify-between gap-x-3 border-b-2 border-b-richblack-600 py-2"
                >
                  <div className="flex items-center gap-x-3 py-2">
                    <RxDropdownMenu className="text-2xl text-richblack-50" />
                    <p className="font-semibold text-richblack-50">{data.title}</p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-x-3">
                    <button onClick={() => setEditSubSection({ ...data, sectionId: section.id })}>
                      <MdEdit className="text-xl text-richblack-300" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmationModal({
                          text1: "Delete this Sub-CourseSection?",
                          text2: "This lecture will be deleted",
                          btn1Text: "Delete",
                          btn2Text: "Cancel",
                          btn1Handler: () => handleDeleteSubSection(data.id, section.id),
                          btn2Handler: () => setConfirmationModal(null),
                        })
                      }
                    >
                      <RiDeleteBin6Line className="text-xl text-richblack-300" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setAddSubsection(section.id)}
                className="mt-3 flex items-center gap-x-1 text-yellow-50"
              >
                <FaPlus className="text-lg" />
                <p>Add Lecture</p>
              </button>
            </div>
          </details>
        ))}
      </div>

      {addSubSection && (
        <SubSectionModal modalData={addSubSection} setModalData={setAddSubsection} add={true} />
      )}
      {viewSubSection && (
        <SubSectionModal modalData={viewSubSection} setModalData={setViewSubSection} view={true} />
      )}
      {editSubSection && (
        <SubSectionModal modalData={editSubSection} setModalData={setEditSubSection} edit={true} />
      )}
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}
