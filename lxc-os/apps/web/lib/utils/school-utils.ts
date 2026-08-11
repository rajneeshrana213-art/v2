/**
 * Generates initials from a school name.
 * Example: "Sanskar Public School" -> "SPS"
 */
export function getSchoolInitials(schoolName: string): string {
  if (!schoolName) return "SCH";
  return schoolName
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 5); // Limit to 5 characters just in case
}
