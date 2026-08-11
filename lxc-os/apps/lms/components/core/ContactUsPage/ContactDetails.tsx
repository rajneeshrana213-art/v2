import React from "react"
import * as BiIcons from "react-icons/bi"
import * as HiIcons from "react-icons/hi2"
import * as IoIcons from "react-icons/io5"

interface ContactDetail {
  icon: string;
  heading: string;
  description: string;
  details: string;
}

const contactDetails: ContactDetail[] = [
  {
    icon: "HiChatBubbleLeftRight",
    heading: "Chat on us",
    description: "Our friendly team is here to help.",
    details: "info@learnxchain.com", // Updated brand name
  },
  {
    icon: "BiWorld",
    heading: "Visit us",
    description: "Come and say hello at our office HQ.",
    details:
      "Akshya Nagar 1st Block 1st Cross, Rammurthy nagar, Bangalore-560016",
  },
  {
    icon: "IoCall",
    heading: "Call us",
    description: "Mon - Fri From 8am to 5pm",
    details: "+123 456 7869",
  },
]

const ContactDetails: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 rounded-xl bg-richblack-800 p-4 lg:p-6">
      {contactDetails.map((ele, i) => {
        // Dynamic icon resolution
        const Icon = (HiIcons as any)[ele.icon] || (BiIcons as any)[ele.icon] || (IoIcons as any)[ele.icon] || HiIcons.HiChatBubbleLeftRight
        
        return (
          <div
            className="flex flex-col gap-[2px] p-3 text-sm text-richblack-200"
            key={i}
          >
            <div className="flex flex-row items-center gap-3">
              <Icon size={25} />
              <h1 className="text-lg font-semibold text-richblack-5">
                {ele?.heading}
              </h1>
            </div>
            <p className="font-medium">{ele?.description}</p>
            <p className="font-semibold text-richblack-50">{ele?.details}</p>
          </div>
        )
      })}
    </div>
  )
}

export default ContactDetails
