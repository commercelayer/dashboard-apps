import { ZodError } from 'zod'

import {
  zodEnforceBoolean,
  zodEnforcePositiveInt,
  zodEnforcePositiveFloat,
  zodEnforceDateString,
  zodCaseInsensitiveNativeEnum,
  zodEnforceInt
} from './zodUtils'
import {
  zodEnforceNonNegativeInt,
  zodEnforceFloat
} from '#components/InputParser/schemas/zodUtils'

describe('check zodEnforceBoolean', () => {
  test('should parse true string text as boolean `true`', () => {
    expect(zodEnforceBoolean({ optional: true }).parse('true')).toBe(true)
  })

  test('should parse false string text as boolean `false`', () => {
    expect(zodEnforceBoolean({ optional: true }).parse('false')).toBe(false)
  })

  test('should allow undefined', () => {
    expect(zodEnforceBoolean({ optional: true }).parse(undefined)).toBe(
      undefined
    )
  })

  test('should parse empty string as undefined', () => {
    expect(zodEnforceBoolean({ optional: true }).parse('')).toBe(undefined)
  })

  test('should return ZodError when is not optional and empty string is passed', () => {
    try {
      zodEnforceBoolean({}).parse('')
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError)
      }
    }
  })
})

describe('check zodEnforcePositiveInt', () => {
  test('should allow int ', () => {
    expect(zodEnforcePositiveInt.parse(13)).toBe(13)
  })

  test('should parse string number ', () => {
    expect(zodEnforcePositiveInt.parse('13')).toBe(13)
  })

  test('should reject negative ', () => {
    expect(zodEnforcePositiveInt.safeParse(0).success).toBe(false)
    expect(zodEnforcePositiveInt.safeParse(-4).success).toBe(false)
    expect(zodEnforcePositiveInt.safeParse('-7').success).toBe(false)
  })

  test('should reject string float ', () => {
    expect(zodEnforcePositiveInt.safeParse('13.5').success).toBe(false)
  })
})

describe('check zodEnforceInt', () => {
  test('should allow positive and negative values', () => {
    expect(zodEnforceInt.parse(13)).toBe(13)
    expect(zodEnforceInt.parse(0)).toBe(0)
    expect(zodEnforceInt.parse('-13')).toBe(-13)
  })
})

describe('check zodEnforceNonNegativeInt', () => {
  test('should allow non negative int ', () => {
    expect(zodEnforceNonNegativeInt.parse(13)).toBe(13)
    expect(zodEnforceNonNegativeInt.parse(0)).toBe(0)
  })

  test('should parse string number ', () => {
    expect(zodEnforceNonNegativeInt.parse('0')).toBe(0)
  })

  test('should reject negative', () => {
    expect(zodEnforceNonNegativeInt.safeParse(-4).success).toBe(false)
    expect(zodEnforceNonNegativeInt.safeParse('-7').success).toBe(false)
  })
})

describe('check zodEnforceFloat', () => {
  test('should allow positive and negative float values', () => {
    expect(zodEnforceFloat.parse(13.5)).toBe(13.5)
    expect(zodEnforceFloat.parse(0.0)).toBe(0)
    expect(zodEnforceFloat.parse('-13.5')).toBe(-13.5)
  })
})

describe('check zodEnforcePositiveFloat', () => {
  test('should allow int', () => {
    expect(zodEnforcePositiveFloat.parse(13)).toBe(13)
  })

  test('should allow float', () => {
    expect(zodEnforcePositiveFloat.parse(13.99)).toBe(13.99)
  })

  test('should parse string number', () => {
    expect(zodEnforcePositiveFloat.parse('13')).toBe(13)
  })

  test('should allow string float', () => {
    expect(zodEnforcePositiveFloat.parse('13.5')).toBe(13.5)
  })

  test('should reject negative', () => {
    expect(zodEnforcePositiveFloat.safeParse(0).success).toBe(false)
    expect(zodEnforcePositiveFloat.safeParse(-4).success).toBe(false)
    expect(zodEnforcePositiveFloat.safeParse('-7.54').success).toBe(false)
  })
})

describe('check zodEnforceDateString', () => {
  test('should accept full ISO string', () => {
    expect(zodEnforceDateString.parse('2022-07-22T11:15:04.388Z')).toBe(
      '2022-07-22T11:15:04.388Z'
    )
  })

  test('should accept partial date string', () => {
    expect(zodEnforceDateString.parse('2022-07-22')).toBe(
      '2022-07-22T00:00:00.000Z'
    )
  })

  test('should return ZodError when wrong value is passed', () => {
    try {
      zodEnforceDateString.parse('hello123')
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError)
      }
    }
  })
})

describe('check zodCaseInsensitiveNativeEnum', () => {
  test('should allow int', () => {
    enum MyCustomEnum {
      'large' = 'xl',
      'medium' = 'm',
      'small' = 's'
    }
    expect(zodCaseInsensitiveNativeEnum(MyCustomEnum).parse('M')).toBe('m')
    expect(zodCaseInsensitiveNativeEnum(MyCustomEnum).parse('xl')).toBe('xl')
    expect(
      zodCaseInsensitiveNativeEnum(MyCustomEnum).parse(MyCustomEnum.small)
    ).toBe('s')
  })
})
