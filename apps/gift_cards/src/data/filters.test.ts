import { makeInstructions } from "./filters"

const now = new Date("2026-10-19T12:00:00.000Z")

function getExpirationOption(value: string) {
  const expiration = makeInstructions(now).find(
    (item) =>
      item.type === "groupedPredicates" && item.urlParamKey === "expiration",
  )
  if (expiration?.type !== "groupedPredicates") {
    throw new Error("Expiration filter not found")
  }
  return expiration.render.props.options.find((o) => o.value === value)
}

describe("makeInstructions", () => {
  test("should filter expired gift cards up to now", () => {
    expect(getExpirationOption("expired")?.sdk).toEqual({
      predicate: "expires_at_lteq",
      value: now.toJSON(),
    })
  })

  test("should filter not expired gift cards with an OR group of no expiration or a future one", () => {
    expect(getExpirationOption("not_expired")?.sdk).toEqual([
      { predicate: "g][0][m", value: "or" },
      { predicate: "g][0][expires_at_null", value: "true" },
      { predicate: "g][0][expires_at_gt", value: now.toJSON() },
    ])
  })
})
