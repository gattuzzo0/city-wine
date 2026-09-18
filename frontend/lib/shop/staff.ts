export function isStaffEmail(email: string | null | undefined, list: string | undefined): boolean {
  if (!email || !list?.trim()) return false
  const want = email.trim().toLowerCase()
  return list
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(want)
}
