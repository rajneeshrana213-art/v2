import React, { useEffect, useState } from "react"
import Link from "next/link"
import ReactStars from "react-rating-stars-component"
import { FaStar } from "react-icons/fa"

interface CourseCardProps {
  course: any
  Height: string
}

export default function CourseCard({ course, Height }: CourseCardProps) {
  const [avgReviewCount, setAvgReviewCount] = useState(0)

  useEffect(() => {
    if (course.ratingAndReviews?.length > 0) {
      const count = course.ratingAndReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0)
      setAvgReviewCount(count / course.ratingAndReviews.length)
    }
  }, [course])

  return (
    <Link href={`/courses/${course.id}`}>
      <div className="">
        <div className="rounded-lg">
          <img
            src={course?.thumbnail}
            alt="course thumbnail"
            className={`${Height} w-full rounded-xl object-cover`}
          />
        </div>
        <div className="flex flex-col gap-2 px-1 py-3 text-white">
          <p className="text-xl font-medium">{course?.courseName}</p>
          <p className="text-sm text-richblack-300">
            {course?.instructor?.firstName} {course?.instructor?.lastName}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-yellow-5">{avgReviewCount || 0}</span>
            <ReactStars
              count={5}
              value={avgReviewCount}
              size={20}
              edit={false}
              activeColor="#ffd700"
              emptyIcon={<FaStar />}
              fullIcon={<FaStar />}
            />
            <span className="text-richblack-400">
              {course?.ratingAndReviews?.length} Ratings
            </span>
          </div>
          <p className="text-xl text-richblack-5">₹ {course?.price}</p>
        </div>
      </div>
    </Link>
  )
}
