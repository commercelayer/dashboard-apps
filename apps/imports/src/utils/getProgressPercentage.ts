/* eslint-disable @typescript-eslint/naming-convention */
import { type Import } from '@commercelayer/sdk'

/**
 * Extract, if available, the progress percentage from the import job object.
 * @param job - The `import` object returned from the API or SDK {@link https://docs.commercelayer.io/core/v/api-reference/imports/object}
 * @returns an object containing `value` to match the numeric value and `formatted` which represent the string with percent sign
 */
export function getProgressPercentage(job: Import): {
  value: number
  formatted: string
} {
  const { processed_count, inputs_size } = job
  if (
    processed_count != null &&
    processed_count > 0 &&
    inputs_size != null &&
    inputs_size > 0
  ) {
    const value = Math.floor((processed_count * 100) / inputs_size)
    return value > 100
      ? {
          value: 100,
          formatted: '100%'
        }
      : {
          value,
          formatted: `${value}%`
        }
  }

  return {
    value: 0,
    formatted: '0%'
  }
}
