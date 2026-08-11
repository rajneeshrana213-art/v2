import { useEffect, useRef, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import IconBtn from "../../../Common/IconBtn"

export default function ChangeProfilePicture() {
  const { data: session, update } = useSession()
  const user = session?.user as any

  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewSource, setPreviewSource] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      previewFile(file)
    }
  }

  const previewFile = (file: File) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result as string)
    }
  }

  const handleFileUpload = async () => {
    if (!imageFile) return

    const toastId = toast.loading("Uploading...")
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("displayPicture", imageFile)
      
      const response = await fetch("/api/profile/display-picture", {
        method: "PUT",
        body: formData,
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message)
      }

      toast.success("Display Picture Updated Successfully")
      await update() // Update the session/UI
    } catch (error: any) {
      toast.error(error.message || "Could Not Update Display Picture")
    } finally {
      setLoading(false)
      toast.dismiss(toastId)
    }
  }

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile)
    }
  }, [imageFile])

  return (
    <div className="flex items-center justify-between rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12 text-richblack-5">
      <div className="flex items-center gap-x-4">
        <img
          src={previewSource || user?.image}
          alt={`profile-${user?.firstName}`}
          className="aspect-square w-[78px] rounded-full object-cover"
        />
        <div className="space-y-2">
          <p>Change Profile Picture</p>
          <div className="flex flex-row gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/gif, image/jpeg"
            />
            <button
              onClick={handleClick}
              disabled={loading}
              className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50"
            >
              Select
            </button>
            <IconBtn
              text={loading ? "Uploading..." : "Upload"}
              onclick={handleFileUpload}
            >
              {!loading && (
                <FiUpload className="text-lg text-richblack-900" />
              )}
            </IconBtn>
          </div>
        </div>
      </div>
    </div>
  )
}
