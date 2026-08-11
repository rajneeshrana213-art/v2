import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import { useSelector } from "react-redux"

interface ChipInputProps {
  label: string
  name: string
  placeholder: string
  register: any
  errors: any
  setValue: any
  getValues: any
}

export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}: ChipInputProps) {
  const { editCourse, course } = useSelector((state: any) => state.course)
  const [chips, setChips] = useState<string[]>([])

  useEffect(() => {
    if (editCourse && course?.tag) {
      setChips(Array.isArray(course.tag) ? course.tag : JSON.parse(course.tag))
    }
    register(name, { required: true, validate: (value: string[]) => value.length > 0 })
  }, [register, name, editCourse, course])

  useEffect(() => {
    setValue(name, chips)
  }, [chips, setValue, name])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      const chipValue = (event.target as HTMLInputElement).value.trim()
      if (chipValue && !chips.includes(chipValue)) {
        setChips([...chips, chipValue])
        ;(event.target as HTMLInputElement).value = ""
      }
    }
  }

  const handleDeleteChip = (chipIndex: number) => {
    setChips(chips.filter((_, index) => index !== chipIndex))
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex w-full flex-wrap gap-y-2">
        {chips.map((chip, index) => (
          <div
            key={index}
            className="m-1 flex items-center rounded-full bg-yellow-400 px-2 py-1 text-sm text-richblack-5"
          >
            {chip}
            <button
              type="button"
              className="ml-2 focus:outline-none"
              onClick={() => handleDeleteChip(index)}
            >
              <MdClose className="text-sm" />
            </button>
          </div>
        ))}
        <input
          id={name}
          type="text"
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="form-style w-full bg-richblack-700 p-3 rounded-md outline-none text-white"
        />
      </div>
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}
