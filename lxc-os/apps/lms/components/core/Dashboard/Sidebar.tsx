import { useState } from "react"
import { VscSignOut } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { signOut, useSession } from "next-auth/react"

import { sidebarLinks } from "../../../data/dashboard-links"
import SidebarLink from "./SidebarLink"

export default function Sidebar() {
  const { data: session, status } = useSession()
  const user = session?.user as any
  
  if (status === "loading") {
    return (
      <div className="grid h-[calc(100vh-3.5rem)] min-w-[220px] items-center border-r-[1px] border-r-richblack-700 bg-richblack-800">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-w-[220px] flex-col border-r-[1px] border-r-richblack-700 bg-richblack-800 py-10">
      <div className="flex flex-col">
        {sidebarLinks.map((link) => {
          if (link.type && user?.role !== link.type) return null
          return (
            <SidebarLink key={link.id} link={link} iconName={link.icon} />
          )
        })}
      </div>
      <div className="mx-auto mt-6 mb-6 h-[1px] w-10/12 bg-richblack-700" />
      <div className="flex flex-col">
        <SidebarLink
          link={{ name: "Settings", path: "/dashboard/settings" }}
          iconName="VscSettingsGear"
        />
        <button
          onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                  signOut({ callbackUrl: "/" })
              }
          }}
          className="px-8 py-2 text-sm font-medium text-richblack-300 hover:text-richblack-25 transition-all"
        >
          <div className="flex items-center gap-x-2">
            <VscSignOut className="text-lg" />
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  )
}
