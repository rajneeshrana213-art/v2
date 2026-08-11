import React, { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { BigPlayButton, Player } from "video-react"
import "video-react/dist/video-react.css"
import { toast } from "react-hot-toast"

import { updateCompletedLectures } from "../../../lib/state/slices/view-course-slice"
import IconBtn from "../../Common/IconBtn"

export default function VideoDetails() {
  const router = useRouter()
  const { courseId, sectionId, subSectionId } = router.query
  const playerRef = useRef<any>(null)
  const dispatch = useDispatch()
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state: any) => state.viewCourse)

  const [videoData, setVideoData] = useState<any>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!courseSectionData.length) return
    if (!courseId && !sectionId && !subSectionId) {
      router.push(`/dashboard/enrolled-courses`)
    } else {
      const filteredData = courseSectionData.filter(
        (section: any) => section.id === sectionId
      )
      const filteredVideoData = filteredData?.[0]?.subSection.filter(
        (data: any) => data.id === subSectionId
      )
      setVideoData(filteredVideoData?.[0])
      setVideoEnded(false)
    }
  }, [courseSectionData, courseEntireData, router.asPath])

  const isFirstVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data: any) => data.id === sectionId
    )
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection.findIndex((data: any) => data.id === subSectionId)

    return currentSectionIndx === 0 && currentSubSectionIndx === 0
  }

  const isLastVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data: any) => data.id === sectionId
    )
    const noOfSubsections =
      courseSectionData[currentSectionIndx]?.subSection.length

    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection.findIndex((data: any) => data.id === subSectionId)

    return (
      currentSectionIndx === courseSectionData.length - 1 &&
      currentSubSectionIndx === noOfSubsections - 1
    )
  }

  const goToNextVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data: any) => data.id === sectionId
    )
    const noOfSubsections =
      courseSectionData[currentSectionIndx]?.subSection.length
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection.findIndex((data: any) => data.id === subSectionId)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx + 1
        ].id
      router.push(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`
      )
    } else {
      const nextSectionId = courseSectionData[currentSectionIndx + 1].id
      const nextSubSectionId =
        courseSectionData[currentSectionIndx + 1].subSection[0].id
      router.push(
        `/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`
      )
    }
  }

  const goToPrevVideo = () => {
    const currentSectionIndx = courseSectionData.findIndex(
      (data: any) => data.id === sectionId
    )
    const currentSubSectionIndx = courseSectionData[
      currentSectionIndx
    ]?.subSection.findIndex((data: any) => data.id === subSectionId)

    if (currentSubSectionIndx !== 0) {
      const prevSubSectionId =
        courseSectionData[currentSectionIndx].subSection[
          currentSubSectionIndx - 1
        ].id
      router.push(
        `/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`
      )
    } else {
      const prevSectionId = courseSectionData[currentSectionIndx - 1].id
      const prevSubSectionLength =
        courseSectionData[currentSectionIndx - 1].subSection.length
      const prevSubSectionId =
        courseSectionData[currentSectionIndx - 1].subSection[
          prevSubSectionLength - 1
        ].id
      router.push(
        `/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`
      )
    }
  }

  const handleLectureCompletion = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/course/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, subsectionId: subSectionId }),
      })
      const result = await response.json()
      if (result.success) {
        dispatch(updateCompletedLectures(subSectionId as string))
        toast.success("Lecture Completed")
      }
    } catch (error) {
      console.error("Lecture completion error:", error)
      toast.error("Could not update progress")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 text-white">
      {!videoData ? (
        <img
          src={courseEntireData?.thumbnail}
          alt="Preview"
          className="h-full w-full rounded-md object-cover"
        />
      ) : (
        <Player
          ref={playerRef}
          aspectRatio="16:9"
          playsInline
          onEnded={() => setVideoEnded(true)}
          src={videoData?.videoUrl}
        >
          <BigPlayButton position="center" />
          {videoEnded && (
            <div
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
              }}
              className="absolute inset-0 z-[100] grid h-full place-content-center font-inter"
            >
              {!completedLectures.includes(subSectionId) && (
                <IconBtn
                  disabled={loading}
                  onclick={() => handleLectureCompletion()}
                  text={!loading ? "Mark As Completed" : "Loading..."}
                  customClasses="text-xl max-w-max px-4 mx-auto"
                />
              )}
              <IconBtn
                disabled={loading}
                onclick={() => {
                  if (playerRef?.current) {
                    playerRef?.current?.seek(0)
                    setVideoEnded(false)
                    playerRef?.current?.play()
                  }
                }}
                text="Rewatch"
                customClasses="text-xl max-w-max px-4 mx-auto mt-2"
              />
              <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
                {!isFirstVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToPrevVideo}
                    className="blackButton"
                  >
                    Prev
                  </button>
                )}
                {!isLastVideo() && (
                  <button
                    disabled={loading}
                    onClick={goToNextVideo}
                    className="blackButton"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </Player>
      )}

      <h1 className="mt-4 text-3xl font-semibold">{videoData?.title}</h1>
      <p className="pt-2 pb-6">{videoData?.description}</p>
    </div>
  )
}
