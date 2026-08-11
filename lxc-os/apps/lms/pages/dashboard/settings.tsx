import ChangeProfilePicture from "../../components/core/Dashboard/Settings/ChangeProfilePicture"
import DeleteAccount from "../../components/core/Dashboard/Settings/DeleteAccount"
import EditProfile from "../../components/core/Dashboard/Settings/EditProfile"
import UpdatePassword from "../../components/core/Dashboard/Settings/UpdatePassword"
import DashboardLayout from "../../components/core/Dashboard/DashboardLayout"

export default function Settings() {
  return (
    <DashboardLayout>
      <h1 className="mb-14 text-3xl font-medium text-richblack-5">
        Edit Profile
      </h1>
      
      {/* Change Profile Picture */}
      <ChangeProfilePicture />
      
      {/* Profile Info */}
      <EditProfile />
      
      {/* Password Update */}
      <UpdatePassword />
      
      {/* Delete Account */}
      <DeleteAccount />
    </DashboardLayout>
  )
}
