import * as Icons from "react-icons/vsc"
import { useDispatch } from "react-redux"
import { useRouter } from "next/router"
import Link from "next/link"
import { resetCourseState } from "../../../lib/state/slices/course-slice"

interface SidebarLinkProps {
  link: {
    name: string
    path: string
  }
  iconName: string
}

export default function SidebarLink({ link, iconName }: SidebarLinkProps) {
  const Icon = (Icons as any)[iconName]
  const router = useRouter()
  const dispatch = useDispatch()

  const isActive = (route: string) => {
    return router.asPath === route
  }

  return (
    <Link
      href={link.path}
      onClick={() => dispatch(resetCourseState())}
      className={`relative px-8 py-2 text-sm font-medium ${
        isActive(link.path)
          ? "bg-yellow-800 text-yellow-50"
          : "bg-opacity-0 text-richblack-300"
      } transition-all duration-200`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${
          isActive(link.path) ? "opacity-100" : "opacity-0"
        }`}
      ></span>
      <div className="flex items-center gap-x-2">
        {Icon && <Icon className="text-lg" />}
        <span>{link.name}</span>
      </div>
    </Link>
  )
}
