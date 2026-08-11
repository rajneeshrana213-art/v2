import React, { useEffect, useState } from "react"
import { TiStarFullOutline, TiStarHalfOutline, TiStarOutline } from "react-icons/ti"

interface RatingStarsProps {
  Review_Count: number
  Star_Size?: number
}

function RatingStars({ Review_Count, Star_Size = 20 }: RatingStarsProps) {
  const [starCount, setStarCount] = useState({
    full: 0,
    half: 0,
    empty: 0,
  })

  useEffect(() => {
    const wholeStars = Math.floor(Review_Count) || 0
    setStarCount({
      full: wholeStars,
      half: Number.isInteger(Review_Count) ? 0 : 1,
      empty: 5 - Math.ceil(Review_Count) || 0,
    })
  }, [Review_Count])

  return (
    <div className="flex gap-1 text-yellow-100">
      {[...new Array(starCount.full)].map((_, i) => {
        return <TiStarFullOutline key={i} size={Star_Size} />
      })}
      {[...new Array(starCount.half)].map((_, i) => {
        return <TiStarHalfOutline key={i} size={Star_Size} />
      })}
      {[...new Array(starCount.empty)].map((_, i) => {
        return <TiStarOutline key={i} size={Star_Size} />
      })}
    </div>
  )
}

export default RatingStars
