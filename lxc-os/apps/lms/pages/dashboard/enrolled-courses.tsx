import DashboardLayout from "../../components/core/Dashboard/DashboardLayout"
import EnrolledCourses from "../../components/core/Dashboard/EnrolledCourses"

export default function EnrolledCoursesPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-11/12 max-w-[1000px] py-10">
        <EnrolledCourses />
      </div>
    </DashboardLayout>
  )
}
