import React from "react"
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"

import { addToCart } from "../../../lib/state/slices/cart-slice"

interface CourseDetailsCardProps {
  course: any
  setConfirmationModal: (modal: any) => void
  handleBuyCourse: () => void
}

const ACCOUNT_TYPE = {
  STUDENT: "STUDENT",
  INSTRUCTOR: "INSTRUCTOR",
  ADMIN: "ADMIN",
}

function CourseDetailsCard({
  course,
  setConfirmationModal,
  handleBuyCourse,
}: CourseDetailsCardProps) {
  const { user } = useSelector((state: any) => state.profile)
  const router = useRouter()
  const dispatch = useDispatch()

  const {
    thumbnail: ThumbnailImage,
    price: CurrentPrice,
    id: courseId,
  } = course

  const handleShare = () => {
    if (typeof window !== "undefined") {
      copy(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  const handleAddToCart = () => {
    if (user && user?.lmsAccountType === ACCOUNT_TYPE.INSTRUCTOR) {
      toast.error("You are an Instructor. You can't buy a course.")
      return
    }
    if (user) {
      dispatch(addToCart(course))
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to add To Cart",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => router.push("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const isEnrolled = user && course?.studentsEnrolled?.some((student: any) => student.id === user.id)

  return (
    <div className={`flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5`}>
      {/* Course Image */}
      <img
        src={ThumbnailImage}
        alt={course?.courseName}
        className="max-h-[300px] min-h-[180px] w-full lg:w-[400px] overflow-hidden rounded-2xl object-cover"
      />

      <div className="px-4">
        <div className="space-x-3 pb-4 text-3xl font-semibold">
          Rs. {CurrentPrice}
        </div>
        <div className="flex flex-col gap-4">
          <button
            className="yellowButton px-4 py-2"
            onClick={
              isEnrolled
                ? () => router.push("/dashboard/enrolled-courses")
                : handleBuyCourse
            }
          >
            {isEnrolled ? "Go To Course" : "Buy Now"}
          </button>
          {!isEnrolled && (
            <button onClick={handleAddToCart} className="blackButton px-4 py-2">
              Add to Cart
            </button>
          )}
        </div>
        <div>
          <p className="pb-3 pt-6 text-center text-sm text-richblack-25">
            30-Day Money-Back Guarantee
          </p>
        </div>

        <div>
          <p className={`my-2 text-xl font-semibold `}>
            This Course Includes :
          </p>
          <div className="flex flex-col gap-3 text-sm text-caribbeangreen-100">
            {course?.instructions && JSON.parse(course.instructions as string || "[]").map((item: string, i: number) => (
              <p className={`flex gap-2`} key={i}>
                <BsFillCaretRightFill />
                <span>{item}</span>
              </p>
            ))}
          </div>
        </div>
        <div className="text-center">
          <button
            className="mx-auto flex items-center gap-2 py-6 text-yellow-100 "
            onClick={handleShare}
          >
            <FaShareSquare size={15} /> Share
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailsCard
