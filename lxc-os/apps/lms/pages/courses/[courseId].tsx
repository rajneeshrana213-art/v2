import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import ReactMarkdown from "react-markdown"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"

import ConfirmationModal from "../../components/Common/ConfirmationModal"
import Footer from "../../components/Common/Footer"
import RatingStars from "../../components/Common/RatingStars"
import CourseAccordionBar from "../../components/core/Course/CourseAccordionBar"
import CourseDetailsCard from "../../components/core/Course/CourseDetailsCard"
import Navbar from "../../components/Common/Navbar"
import { formatDate } from "../../lib/date-formatter"
import GetAvgRating from "../../lib/avg-rating"
import { resetCart } from "../../lib/state/slices/cart-slice"

export default function CourseDetails() {
  const { user } = useSelector((state: any) => state.profile)
  const { paymentLoading } = useSelector((state: any) => state.course)
  const dispatch = useDispatch()
  const router = useRouter()
  const { courseId } = router.query

  const [response, setResponse] = useState<any>(null)
  const [confirmationModal, setConfirmationModal] = useState<any>(null)
  const [avgReviewCount, setAvgReviewCount] = useState(0)
  const [isActive, setIsActive] = useState<string[]>([])
  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!courseId) return
    const fetchDetails = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/course/details?courseId=${courseId}`)
        const data = await res.json()
        setResponse(data)
      } catch (error) {
        console.error("Could not fetch Course Details", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [courseId])

  useEffect(() => {
    if (response?.data?.courseDetails) {
      const count = GetAvgRating(response.data.courseDetails.ratingAndReviews)
      setAvgReviewCount(count)

      let lectures = 0
      response.data.courseDetails.courseContent?.forEach((sec: any) => {
        lectures += sec.subSection?.length || 0
      })
      setTotalNoOfLectures(lectures)
    }
  }, [response])

  const handleActive = (id: string) => {
    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e !== id)
    )
  }

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = src
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleBuyCourse = async () => {
    if (!user) {
      setConfirmationModal({
        text1: "You are not logged in!",
        text2: "Please login to Purchase Course.",
        btn1Text: "Login",
        btn2Text: "Cancel",
        btn1Handler: () => router.push("/login"),
        btn2Handler: () => setConfirmationModal(null),
      })
      return
    }

    const toastId = toast.loading("Initiating Payment...")
    try {
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js")
      if (!res) {
        toast.error("Razorpay SDK failed to load.")
        return
      }

      const captureResponse = await fetch("/api/payment/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: [courseId] }),
      })
      const captureData = await captureResponse.json()
      if (!captureData.success) throw new Error(captureData.message)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        currency: captureData.data.currency,
        amount: `${captureData.data.amount}`,
        order_id: captureData.data.id,
        name: "LearnXChain",
        description: "Thank you for purchasing the course",
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        handler: async function (paymentResponse: any) {
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...paymentResponse, courses: [courseId] }),
          })
          const verifyData = await verifyResponse.json()
          if (verifyData.success) {
            toast.success("Payment Successful!")
            dispatch(resetCart())
            router.push("/dashboard/enrolled-courses")
          } else {
            toast.error("Payment Verification Failed")
          }
        },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.open()
    } catch (error: any) {
      console.error("Payment Error:", error)
      toast.error(error.message || "Could not complete payment")
    } finally {
      toast.dismiss(toastId)
    }
  }

  if (loading || paymentLoading || !response) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="spinner"></div>
      </div>
    )
  }

  const {
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
  } = response.data?.courseDetails

  return (
    <div className="bg-richblack-900 min-h-screen">
      <Navbar />
      <div className={`relative w-full bg-richblack-800`}>
        {/* Hero CourseSection */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative ">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
            <div className="relative block max-h-[30rem] lg:hidden">
              <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
              <img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full"
              />
            </div>
            <div className={`z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5`}>
              <h1 className="text-4xl font-bold text-richblack-5 sm:text-[42px]">
                {courseName}
              </h1>
              <p className={`text-richblack-200`}>{courseDescription}</p>
              <div className="text-md flex flex-wrap items-center gap-2">
                <span className="text-yellow-25">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
                <span>{`(${ratingAndReviews?.length || 0} reviews)`}</span>
                <span>{`${studentsEnrolled?.length || 0} students enrolled`}</span>
              </div>
              <p>Created By {`${instructor.firstName} ${instructor.lastName}`}</p>
              <div className="flex flex-wrap gap-5 text-lg">
                <p className="flex items-center gap-2">
                  <BiInfoCircle /> Created at {formatDate(createdAt)}
                </p>
                <p className="flex items-center gap-2">
                  <HiOutlineGlobeAlt /> English
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden">
              <p className="space-x-3 pb-4 text-3xl font-semibold text-richblack-5">
                Rs. {price}
              </p>
              <button className="yellowButton px-4 py-2" onClick={handleBuyCourse}>
                Buy Now
              </button>
              <button className="blackButton px-4 py-2">Add to Cart</button>
            </div>
          </div>
          {/* Courses Card */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute lg:block">
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          <div className="my-8 border border-richblack-600 p-8">
            <p className="text-3xl font-semibold">What you'll learn</p>
            <div className="mt-5">
              <ReactMarkdown>{whatYouWillLearn}</ReactMarkdown>
            </div>
          </div>

          <div className="max-w-[830px] ">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold">Course Content</p>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2">
                  <span>{courseContent?.length} section(s)</span>
                  <span>{totalNoOfLectures} lecture(s)</span>
                  <span>{response.data?.totalDuration} total length</span>
                </div>
                <button className="text-yellow-25" onClick={() => setIsActive([])}>
                  Collapse all sections
                </button>
              </div>
            </div>

            <div className="py-4">
              {courseContent?.map((course: any, index: number) => (
                <CourseAccordionBar
                  course={course}
                  key={index}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            <div className="mb-12 py-4">
              <p className="text-[28px] font-semibold">Author</p>
              <div className="flex items-center gap-4 py-4">
                <img
                  src={instructor.image || `https://api.dicebear.com/5.x/initials/svg?seed=${instructor.firstName} ${instructor.lastName}`}
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="text-lg">{`${instructor.firstName} ${instructor.lastName}`}</p>
              </div>
              <p className="text-richblack-50">{instructor?.additionalDetails?.about}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </div>
  )
}
