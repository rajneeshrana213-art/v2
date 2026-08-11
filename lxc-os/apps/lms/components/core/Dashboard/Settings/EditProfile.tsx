import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"
import IconBtn from "../../../Common/IconBtn"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { data: session, update } = useSession()
  const user = session?.user as any
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
      defaultValues: {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          dateOfBirth: user?.profile?.dateOfBirth || "",
          gender: user?.profile?.gender || "Male",
          contactNumber: user?.profile?.contactNumber || "",
          about: user?.profile?.about || "",
      }
  })

  const submitProfileForm = async (formData: any) => {
    const toastId = toast.loading("Updating profile...")
    try {
        const response = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        })
        const data = await response.json()

        if (!data.success) {
            throw new Error(data.message)
        }
        
        toast.success("Profile Updated Successfully")
        // Update the session to reflect changes
        await update()
    } catch (error: any) {
        toast.error(error.message || "Could Not Update Profile")
    } finally {
        toast.dismiss(toastId)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitProfileForm)}>
      <div className="my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12 text-white">
        <h2 className="text-lg font-semibold text-richblack-5">Profile Information</h2>
        
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="firstName" className="text-sm text-richblack-5">First Name</label>
            <input
              type="text"
              id="firstName"
              placeholder="Enter first name"
              className="bg-richblack-700 p-3 rounded-md outline-none"
              {...register("firstName", { required: true })}
            />
            {errors.firstName && <span className="text-xs text-yellow-100">Please enter your first name.</span>}
          </div>
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="lastName" className="text-sm text-richblack-5">Last Name</label>
            <input
              type="text"
              id="lastName"
              placeholder="Enter last name"
              className="bg-richblack-700 p-3 rounded-md outline-none"
              {...register("lastName", { required: true })}
            />
            {errors.lastName && <span className="text-xs text-yellow-100">Please enter your last name.</span>}
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="dateOfBirth" className="text-sm text-richblack-5">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              className="bg-richblack-700 p-3 rounded-md outline-none"
              {...register("dateOfBirth", {
                required: { value: true, message: "Please enter your Date of Birth." },
                max: { value: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()), message: "Date of Birth cannot be in the future." },
              })}
            />
            {errors.dateOfBirth && <span className="text-xs text-yellow-100">{errors.dateOfBirth.message as string}</span>}
          </div>
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="gender" className="text-sm text-richblack-5">Gender</label>
            <select
              id="gender"
              className="bg-richblack-700 p-3 rounded-md outline-none"
              {...register("gender", { required: true })}
            >
              {genders.map((ele, i) => (
                <option key={i} value={ele}>{ele}</option>
              ))}
            </select>
            {errors.gender && <span className="text-xs text-yellow-100">Please select your gender.</span>}
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="contactNumber" className="text-sm text-richblack-5">Contact Number</label>
            <input
              type="tel"
              id="contactNumber"
              placeholder="Enter Contact Number"
              className="bg-richblack-700 p-3 rounded-md outline-none"
              {...register("contactNumber", {
                required: { value: true, message: "Please enter your Contact Number." },
                maxLength: { value: 12, message: "Invalid Contact Number" },
                minLength: { value: 10, message: "Invalid Contact Number" },
              })}
            />
            {errors.contactNumber && <span className="text-xs text-yellow-100">{errors.contactNumber.message as string}</span>}
          </div>
          <div className="flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="about" className="text-sm text-richblack-5">About</label>
            <input
              type="text"
              id="about"
              placeholder="Enter Bio Details"
              className="bg-richblack-700 p-3 rounded-md outline-none"
              {...register("about", { required: true })}
            />
            {errors.about && <span className="text-xs text-yellow-100">Please enter your bio.</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/dashboard/my-profile")}
          className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50 hover:bg-richblack-600 transition-all"
        >
          Cancel
        </button>
        <IconBtn type="submit" text="Save" />
      </div>
    </form>
  )
}
