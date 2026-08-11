import React from "react"

interface IconBtnProps {
  text: string
  onclick?: () => void
  children?: React.ReactNode
  disabled?: boolean
  outline?: boolean
  customClasses?: string
  type?: "button" | "submit" | "reset"
}

export default function IconBtn({
  text,
  onclick,
  children,
  disabled,
  outline = false,
  customClasses = "",
  type = "button",
}: IconBtnProps) {
  return (
    <button
      disabled={disabled}
      onClick={onclick}
      className={`flex items-center ${
        outline ? "border border-yellow-50 bg-transparent text-yellow-50" : "bg-yellow-50 text-richblack-900"
      } cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold ${customClasses}`}
      type={type}
    >
      {children ? (
        <>
          <span>{text}</span>
          {children}
        </>
      ) : (
        text
      )}
    </button>
  )
}
