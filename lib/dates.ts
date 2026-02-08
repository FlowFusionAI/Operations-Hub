/**
 * Date utilities for Operations Hub.
 * Shared across template preview (Phase 2) and onboarding materialization (Phase 3).
 */

/**
 * Adds a number of days to a date, optionally skipping weekends.
 *
 * When `skipWeekends` is true, only business days (Mon–Fri) are counted.
 * When false, all calendar days are counted.
 *
 * @param startDate - The starting date
 * @param days - Number of days to add (must be >= 0)
 * @param skipWeekends - Whether to skip Saturday and Sunday
 * @returns A new Date with the computed due date
 */
export function addBusinessDays(
  startDate: Date,
  days: number,
  skipWeekends: boolean
): Date {
  const result = new Date(startDate)

  if (days === 0) return result

  if (!skipWeekends) {
    result.setDate(result.getDate() + days)
    return result
  }

  let remaining = days
  while (remaining > 0) {
    result.setDate(result.getDate() + 1)
    const dayOfWeek = result.getDay()
    // Skip Saturday (6) and Sunday (0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      remaining--
    }
  }

  return result
}
