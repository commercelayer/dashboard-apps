import {
  priceTierFrequencyFormSchema,
  priceTierVolumeFormSchema,
} from "./schema"

const validVolumeTier = {
  name: "Tier 1",
  currency_code: "EUR",
  price: 10,
  type: "volume",
  up_to: 5,
}

function issuesOf(schema: typeof priceTierVolumeFormSchema, value: unknown) {
  return schema
    .safeParse(value)
    .error?.issues.map(({ path, message }) => ({ path, message }))
}

describe("priceTierVolumeFormSchema", () => {
  test("should accept a complete tier", () => {
    expect(issuesOf(priceTierVolumeFormSchema, validVolumeTier)).toBeUndefined()
  })

  test("should ask for a valid price when it is missing or not a number", () => {
    for (const price of [undefined, null, "abc", Number.NaN]) {
      expect(
        issuesOf(priceTierVolumeFormSchema, { ...validVolumeTier, price }),
      ).toEqual([{ path: ["price"], message: "Please enter a valid price" }])
    }
  })

  test("should keep the price message for type errors only", () => {
    const issues = issuesOf(priceTierVolumeFormSchema, {
      ...validVolumeTier,
      price: -1,
    })
    expect(issues).toHaveLength(1)
    expect(issues?.[0]?.path).toEqual(["price"])
    expect(issues?.[0]?.message).not.toBe("Please enter a valid price")
  })

  test("should treat an emptied up to as no limit", () => {
    expect(
      priceTierVolumeFormSchema.parse({ ...validVolumeTier, up_to: Number.NaN })
        .up_to,
    ).toBeNull()
  })
})

describe("priceTierFrequencyFormSchema", () => {
  test("should require the days of a custom frequency", () => {
    expect(
      priceTierFrequencyFormSchema
        .safeParse({ ...validVolumeTier, type: "frequency", up_to: "custom" })
        .error?.issues.map(({ path, message }) => ({ path, message })),
    ).toEqual([{ path: ["up_to_days"], message: "Required" }])
  })
})
