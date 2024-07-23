import { isFalsy } from './isFalsy'

test('Check falsy values', () => {
  expect(isFalsy(null)).toBe(true)
  expect(isFalsy(undefined)).toBe(true)
  expect(isFalsy('')).toBe(true)
  expect(isFalsy(0)).toBe(true)
  expect(isFalsy(false)).toBe(true)

  expect(isFalsy(1)).toBe(false)
  expect(isFalsy('0')).toBe(false)
  expect(isFalsy('  ')).toBe(false)
  expect(isFalsy('hello')).toBe(false)
  expect(isFalsy(true)).toBe(false)
  expect(isFalsy(-1)).toBe(false)
})
