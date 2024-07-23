import { formatDate } from '@commercelayer/app-elements'

/**
 * Get separate formatted date and time starting from a requested datetime string and an optional timezone.
 * @param dateTime - A string containing a parsable datetime.
 * @param timezone - A string containing a specific timezone. When not passed it will be used 'UTC', as it is the default value defined in `app-elements`.
 * @returns an object containing "date" and "time" props.
 */
export function formatDateAndTime(
  dateTime: string,
  timezone?: string
): {
  date: string
  time: string
} {
  const formattedDate = formatDate({
    isoDate: dateTime,
    timezone,
    format: 'date'
  })
  const formattedTime = formatDate({
    isoDate: dateTime,
    timezone,
    format: 'timeWithSeconds'
  })
  return {
    date: formattedDate,
    time: formattedTime
  }
}
