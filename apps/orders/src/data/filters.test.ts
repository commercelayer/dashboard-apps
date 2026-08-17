import {
  type HideableFilter,
  makeInstructions,
  parseTextSearchValue,
} from "#data/filters"
import { orderTabs } from "#data/lists"

describe("parseTextSearchValue", () => {
  test("Should handle empty or undefined values ", () => {
    expect(parseTextSearchValue(undefined)).toBeUndefined()
    expect(parseTextSearchValue("")).toBeUndefined()
    expect(parseTextSearchValue(true)).toBeUndefined()
    expect(parseTextSearchValue({})).toBeUndefined()
    expect(parseTextSearchValue("   ")).toBeUndefined()
  })

  test("Should wrap regular text in asterisks ", () => {
    expect(parseTextSearchValue("foobar")).toBe("*foobar*")
  })

  test("Should wrap sentences in asterisks ", () => {
    expect(parseTextSearchValue("Ringo Starr")).toBe("*Ringo Starr*")
  })

  test("Should wrap regular text in double quotes and asterisks if contains dots", () => {
    expect(parseTextSearchValue("foo.bar.foobar")).toBe('*"foo.bar.foobar"*')
  })

  test("Should wrap full email in double quotes and asterisks", () => {
    expect(parseTextSearchValue("elyssa85@yahoo.com")).toBe(
      '*"elyssa85@yahoo.com"*',
    )
  })

  test("Should only wrap email in double quotes and the entire sentence in asterisks", () => {
    expect(parseTextSearchValue("elyssa85@yahoo.com text")).toBe(
      '*"elyssa85@yahoo.com" text*',
    )
    expect(parseTextSearchValue("text elyssa85@yahoo.com text")).toBe(
      '*text "elyssa85@yahoo.com" text*',
    )
    expect(parseTextSearchValue("text elyssa85@yahoo.com ")).toBe(
      '*text "elyssa85@yahoo.com"*',
    )
  })

  test("Should wrap multiple email addresses in a sentence", () => {
    expect(
      parseTextSearchValue(
        "hello world elyssa85@yahoo.com lorem ipsum elyssa85@yahoo.com",
      ),
    ).toBe(
      '*hello world "elyssa85@yahoo.com" lorem ipsum "elyssa85@yahoo.com"*',
    )
  })

  test("Should not wrap in double quote broken email addresses", () => {
    expect(parseTextSearchValue("elyssa85@gmail@yahoo.com")).toBe(
      "*elyssa85@gmail@yahoo.com*",
    )
  })

  test("Should wrap full email with dots in double quotes", () => {
    expect(parseTextSearchValue("elyssa.85@yahoo.com")).toBe(
      '*"elyssa.85@yahoo.com"*',
    )

    expect(parseTextSearchValue("elyssa.85@yahoo.co.uk")).toBe(
      '*"elyssa.85@yahoo.co.uk"*',
    )

    expect(parseTextSearchValue("elyssa.85@yahoo.it")).toBe(
      '*"elyssa.85@yahoo.it"*',
    )
  })

  test("Should remove @ symbol when wrapping in double quotes partial email without domain", () => {
    expect(parseTextSearchValue("elyssa.85@")).toBe('*"elyssa.85"*')
  })

  test("Should not wrap partial email with partial domain in double quotes", () => {
    expect(parseTextSearchValue("john@yahoo")).toBe("*john@yahoo*")
  })

  test("Should not wrap text when already contains double quotes or asterisk", () => {
    expect(parseTextSearchValue('*"foobar"*')).toBe('*"foobar"*')
    expect(parseTextSearchValue("*foobar")).toBe("*foobar")
    expect(parseTextSearchValue("foobar*")).toBe("foobar*")
    expect(parseTextSearchValue('"foobar"')).toBe('"foobar"')
  })
})

describe("makeInstructions", () => {
  const hiddenFlagOf = (
    predicate: string,
    hiddenFilters: HideableFilter[] = [],
  ): boolean | undefined =>
    makeInstructions({ hiddenFilters }).find(
      (item) => "predicate" in item.sdk && item.sdk.predicate === predicate,
    )?.hidden

  test("hides only the filters it is asked to", () => {
    expect(hiddenFlagOf("status_in", ["status_in"])).toBe(true)
    expect(hiddenFlagOf("fulfillment_status_in", ["status_in"])).toBe(false)
    // untouched: it carries no `hidden` flag of its own
    expect(hiddenFlagOf("payment_status_in", ["status_in"])).not.toBe(true)
  })

  test("shows both hideable filters when the tab pins neither", () => {
    expect(hiddenFlagOf("status_in")).toBe(false)
    expect(hiddenFlagOf("fulfillment_status_in")).toBe(false)
  })

  // `archived` is hidden for its own reasons, which `hiddenFilters` must not touch
  test("leaves the filters hidden for other reasons hidden", () => {
    expect(hiddenFlagOf("archived", ["status_in"])).toBe(true)
  })
})

describe("orderTabs", () => {
  // a tab that pins a filter has to hide it, or the drawer offers the user a way
  // to contradict the tab they are on
  test.each([
    ["Placed", "status_in"],
    ["Approved", "status_in"],
    ["In progress", "fulfillment_status_in"],
    ["Fulfilled", "fulfillment_status_in"],
  ])("%s pins %s and hides it from the drawer", (label, predicate) => {
    const tab = orderTabs.find((candidate) => candidate.label === label)
    expect(tab?.formValues[predicate]).toBeDefined()
    expect(tab?.hiddenFilters).toEqual([predicate])
  })

  test("every tab filters on a predicate the instructions declare", () => {
    const declared = makeInstructions({}).flatMap((item) =>
      "predicate" in item.sdk ? [item.sdk.predicate] : [],
    )
    const used = orderTabs
      .filter((tab) => tab.instructions !== "carts")
      .flatMap((tab) =>
        Object.keys(tab.formValues).filter((key) => key !== "viewTitle"),
      )

    expect(used.filter((predicate) => !declared.includes(predicate))).toEqual(
      [],
    )
  })
})
