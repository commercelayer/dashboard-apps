/**
 * Checks against all falsy values such as null, empty string or 0.
 * @param value - can be anything
 * @returns true if value is falsy
 * Examples:
 * isFalsy('') // true
 * isFalsy(0) // true
 * isFalsy(1) //false
 * isFalsy('0') // false
 * isFalsy(null) // true
 */
export function isFalsy(value: any): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
  return Boolean(value) === false
}
