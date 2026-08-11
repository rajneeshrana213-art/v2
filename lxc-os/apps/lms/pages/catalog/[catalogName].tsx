import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Footer from "../../components/Common/Footer"
import Course_Card from "../../components/core/Catalog/Course_Card"
import Course_Slider from "../../components/core/Catalog/Course_Slider"
import Navbar from "../../components/Common/Navbar"

export default function Catalog() {
  const router = useRouter()
  const { catalogName } = router.query
  const [active, setActive] = useState(1)
  const [catalogPageData, setCatalogPageData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!catalogName) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Get All Categories to find the ID
        const categoriesRes = await fetch("/api/category")
        const categoriesData = await categoriesRes.json()
        const category = categoriesData.data?.find(
          (ct: any) => ct.name.split(" ").join("-").toLowerCase() === catalogName
        )

        if (category) {
          // 2. Get Catalog Page Data
          const detailsRes = await fetch("/api/category/details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categoryId: category.id }),
          })
          const detailsData = await detailsRes.json()
          setCatalogPageData(detailsData.data)
        }
      } catch (error) {
        console.error("Error fetching catalog data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [catalogName])

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-screen place-items-center bg-richblack-900">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="bg-richblack-900 min-h-screen">
      <Navbar />
      
      {/* Hero CourseSection */}
      <div className=" box-content bg-richblack-800 px-4">
        <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent ">
          <p className="text-sm text-richblack-300">
            {`Home / Catalog / `}
            <span className="text-yellow-25">
              {catalogPageData?.selectedCategory?.name}
            </span>
          </p>
          <p className="text-3xl text-richblack-5">
            {catalogPageData?.selectedCategory?.name}
          </p>
          <p className="max-w-[870px] text-richblack-200">
            {catalogPageData?.selectedCategory?.description}
          </p>
        </div>
      </div>

      {/* CourseSection 1 */}
      <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
        <div className="text-2xl font-bold text-white mb-4">Courses to get you started</div>
        <div className="my-4 flex border-b border-b-richblack-600 text-sm">
          <p
            className={`px-4 py-2 ${
              active === 1
                ? "border-b border-b-yellow-25 text-yellow-25"
                : "text-richblack-50"
            } cursor-pointer`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </p>
          <p
            className={`px-4 py-2 ${
              active === 2
                ? "border-b border-b-yellow-25 text-yellow-25"
                : "text-richblack-50"
            } cursor-pointer`}
            onClick={() => setActive(2)}
          >
            New
          </p>
        </div>
        <div>
          <Course_Slider
            Courses={catalogPageData?.selectedCategory?.courses}
          />
        </div>
      </div>

      {/* CourseSection 2 */}
      {catalogPageData?.differentCategory && (
        <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
          <div className="text-2xl font-bold text-white mb-4">
            Top courses in {catalogPageData?.differentCategory?.name}
          </div>
          <div className="py-8">
            <Course_Slider
              Courses={catalogPageData?.differentCategory?.courses}
            />
          </div>
        </div>
      )}

      {/* CourseSection 3 */}
      <div className=" mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
        <div className="text-2xl font-bold text-white mb-4">Frequently Bought</div>
        <div className="py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {catalogPageData?.mostSellingCourses
              ?.slice(0, 4)
              .map((course: any, i: number) => (
                <Course_Card course={course} key={i} Height={"h-[400px]"} />
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
