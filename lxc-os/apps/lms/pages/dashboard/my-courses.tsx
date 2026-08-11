import { useEffect, useState } from "react"
import { VscAdd } from "react-icons/vsc"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"
import IconBtn from "../../components/Common/IconBtn"
import CoursesTable from "../../components/core/Dashboard/InstructorCourses/CoursesTable"
import DashboardLayout from "../../components/core/Dashboard/DashboardLayout"

export default function MyCourses() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/course/instructor")
        const result = await response.json()
        if (result.success) {
          setCourses(result.data)
        }
      } catch (error) {
        console.error("Fetch instructor courses error:", error)
        toast.error("Could not fetch courses")
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-y-10 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-medium text-richblack-5">My Courses</h1>
          <IconBtn
            text="Add Course"
            onclick={() => router.push("/dashboard/add-course")}
          >
            <VscAdd />
          </IconBtn>
        </div>
        {loading ? (
          <div className="grid min-h-[calc(100vh-30rem)] place-items-center">
            <div className="spinner"></div>
          </div>
        ) : (
          <CoursesTable courses={courses} setCourses={setCourses} />
        )}
      </div>
    </DashboardLayout>
  )
}
