import { useEffect, useState } from "react"
import { BsChevronDown } from "react-icons/bs"
import { IoIosArrowBack } from "react-icons/io"
import { useSelector } from "react-redux"
import { useRouter } from "next/router"
import IconBtn from "../../Common/IconBtn"

interface VideoDetailsSidebarProps {
  setReviewModal: (val: boolean) => void
}

export default function VideoDetailsSidebar({ setReviewModal }: VideoDetailsSidebarProps) {
  const [activeStatus, setActiveStatus] = useState("")
  const [videoBarActive, setVideoBarActive] = useState("")
  const router = useRouter()
  const { sectionId, subSectionId, courseId } = router.query

  const {
    courseSectionData,
    courseEntireData,
    totalNoOfLectures,
    completedLectures,
  } = useSelector((state: any) => state.viewCourse)

  useEffect(() => {
    if (!courseSectionData.length) return
    const currentSectionIndx = courseSectionData.findIndex(
      (data: any) => data.id === sectionId
    )
    const currentSubSectionIndx = courseSectionData?.[
      currentSectionIndx
    ]?.subSection.findIndex((data: any) => data.id === subSectionId)
    const activeSubSectionId =
      courseSectionData[currentSectionIndx]?.subSection?.[
        currentSubSectionIndx
      ]?.id
    setActiveStatus(courseSectionData?.[currentSectionIndx]?.id)
    setVideoBarActive(activeSubSectionId)
  }, [courseSectionData, courseEntireData, router.asPath])

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] w-[320px] max-w-[350px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <div className="mx-5 flex flex-col items-start justify-between gap-2 gap-y-4 border-b border-richblack-600 py-5 text-lg font-bold text-richblack-25">
          <div className="flex w-full items-center justify-between ">
            <div
              onClick={() => {
                router.push(`/dashboard/enrolled-courses`)
              }}
              className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-richblack-100 p-1 text-richblack-700 hover:scale-90 cursor-pointer"
              title="back"
            >
              <IoIosArrowBack size={30} />
            </div>
            <IconBtn
              text="Add Review"
              customClasses="ml-auto"
              onclick={() => setReviewModal(true)}
            />
          </div>
          <div className="flex flex-col">
            <p>{courseEntireData?.courseName}</p>
            <p className="text-sm font-semibold text-richblack-500">
              {completedLectures?.length} / {totalNoOfLectures}
            </p>
          </div>
        </div>

        <div className="h-[calc(100vh - 5rem)] overflow-y-auto">
          {courseSectionData.map((section: any, index: number) => (
            <div
              className="mt-2 cursor-pointer text-sm text-richblack-5"
              onClick={() => setActiveStatus(section?.id)}
              key={index}
            >
              {/* CourseSection Header */}
              <div className="flex flex-row justify-between bg-richblack-600 px-5 py-4">
                <div className="w-[70%] font-semibold">
                  {section?.sectionName}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      activeStatus === section?.id ? "rotate-0" : "rotate-180"
                    } transition-all duration-500`}
                  >
                    <BsChevronDown />
                  </span>
                </div>
              </div>

              {/* Sub Sections */}
              {activeStatus === section?.id && (
                <div className="transition-[height] duration-500 ease-in-out">
                  {section.subSection.map((subsection: any, i: number) => (
                    <div
                      className={`flex gap-3 px-5 py-2 ${
                        videoBarActive === subsection.id
                          ? "bg-yellow-200 font-semibold text-richblack-800"
                          : "hover:bg-richblack-900"
                      } `}
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(
                          `/view-course/${courseId}/section/${section.id}/sub-section/${subsection.id}`
                        )
                        setVideoBarActive(subsection.id)
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={completedLectures.includes(subsection.id)}
                        readOnly
                      />
                      {subsection.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
