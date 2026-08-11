export const formattedDate = (dateString: string | Date | undefined) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  const dateParts = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const period = hours >= 12 ? "PM" : "AM"
  const timeParts = `${hours % 12 || 12}:${minutes} ${period}`
  return `${dateParts} | ${timeParts}`
}

export const formatDate = formattedDate
