import {
  Badge,
  HookedInput,
  Spacer,
  Stack,
  StackCell,
} from "@commercelayer/app-elements"
import { z } from "zod"
import { PromotionSkuListSelector } from "../components/PromotionSkuListSelector"
import type { PromotionConfig } from "../config"
import { genericPromotionOptions } from "./promotions"

export default {
  external_promotions: {
    type: "external_promotions",
    slug: "external",
    icon: "linkSimple",
    titleList: "External promotion",
    description:
      "Integrate any kind of promotional engine as an external promotion.",
    titleNew: "external promotion",
    formType: genericPromotionOptions.merge(
      z.object({
        promotion_url: z.string().url(),
        external_includes: z
          .string()
          .nullish()
          .refine(
            (value) => {
              if (value == null || value.trim() === "") {
                return true
              }
              return parseIncludes(value).every(isValidResourceName)
            },
            {
              message:
                "Please provide a comma-separated list of valid resource names.",
            },
          ),
        sku_list: z.string().nullish(),
      }),
    ),
    Fields: () => (
      <>
        <Spacer top="6">
          <HookedInput
            name="promotion_url"
            label="External service URL *"
            hint={{
              text: (
                <>
                  Insert your service endpoint and follow the{" "}
                  <a href="https://docs.commercelayer.io/core/external-resources/external-promotions">
                    external promotions guide
                  </a>{" "}
                  for setup.
                </>
              ),
            }}
          />
        </Spacer>
        <Spacer top="6">
          <HookedInput
            name="external_includes"
            label="External includes"
            hint={{
              text: (
                <>
                  Comma-separated resource names for the request payload. Leave
                  empty for defaults.{" "}
                  {/** biome-ignore lint/a11y/noAmbiguousAnchorText: The link text "Learn more" is clear in the context of the surrounding text. */}
                  <a
                    href="https://docs.commercelayer.io/core/external-resources#custom-include-list"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Learn more
                  </a>
                </>
              ),
            }}
          />
        </Spacer>
      </>
    ),
    Options: ({ promotion }) => {
      return (
        <>
          <PromotionSkuListSelector
            optional
            promotion={promotion}
            hint="Apply the promotion only to the SKUs within the selected SKU list."
          />
        </>
      )
    },
    StatusDescription: () => <>External</>,
    DetailsSectionInfo: ({ promotion }) => (
      <Stack size="small">
        <StackCell label="External service URL">
          {promotion.promotion_url}
        </StackCell>
        {promotion.external_includes != null &&
          promotion.external_includes.length > 0 && (
            <StackCell label="Includes">
              {/* inline badges follow the cell's text alignment, so they sit on
                  the right when the cell is the trailing one of the row and on
                  the left once the cells are stacked */}
              <div style={{ margin: "-0.25rem", marginTop: "0.25rem" }}>
                {promotion.external_includes.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    style={{ margin: "0.25rem" }}
                  >
                    {item.trim()}
                  </Badge>
                ))}
              </div>
            </StackCell>
          )}
      </Stack>
    ),
  },
} satisfies Pick<PromotionConfig, "external_promotions">

export function parseIncludes(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ]
}

/**
 * Valid resource names may contain lowercase letters, underscores, and dots only.
 * Examples:
 * - valid: `orders`, `shipments_items`, `customer.addresses`
 * - invalid: `Order`, `line-items`, `sku list`, `items/sku`
 */
export function isValidResourceName(item: string): boolean {
  return /^[a-z_.]+$/.test(item)
}
