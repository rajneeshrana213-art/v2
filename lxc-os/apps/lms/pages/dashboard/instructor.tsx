import DashboardLayout from "../../components/core/Dashboard/DashboardLayout"
import Instructor from "../../components/core/Dashboard/Instructor"

export default function InstructorDashboardPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto w-11/12 max-w-[1000px] py-10">
        <Instructor />
      </div>
    </DashboardLayout>
  )
}
