import {
  isResourceWithRelationship,
  webhookRelationships,
} from "#data/relationships"
import { getRelationshipsByResourceType } from "./relationships"

describe("getRelationshipsByResourceType", () => {
  test("Should retrieve a list of relationships", () => {
    expect(getRelationshipsByResourceType("bundles")).toMatchObject([
      "sku_list",
      "sku_list_items",
    ])
  })

  test("Should retrieve a list of relationships for all ResourceWithRelationship types", () => {
    Object.keys(webhookRelationships).forEach((resourceType) => {
      if (!isResourceWithRelationship(resourceType)) {
        return false
      }

      expect(getRelationshipsByResourceType(resourceType)).toMatchObject(
        webhookRelationships[resourceType],
      )
    })
  })
})
