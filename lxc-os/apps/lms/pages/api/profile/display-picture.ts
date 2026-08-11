import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import prisma from "../../../lib/prisma"
import { uploadImageToCloudinary } from "../../../lib/image-uploader"
import formidable from "formidable"

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, message: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ success: false, message: "Unauthorized" })
  }

  const form = formidable({})
  
  try {
    const [fields, files] = await form.parse(req)
    const displayPicture = files.displayPicture?.[0]

    if (!displayPicture) {
      return res.status(400).json({ success: false, message: "No image file provided" })
    }

    const image = await uploadImageToCloudinary(
      displayPicture.filepath,
      process.env.FOLDER_NAME || "StudyHub"
    )

    const updatedUser = await prisma.user.update({
      where: { email: session.user?.email as string },
      data: { image: image.secure_url },
    })

    return res.status(200).json({
      success: true,
      message: "Display picture updated successfully",
      data: updatedUser,
    })
  } catch (error: any) {
    console.error("Display picture upload error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
