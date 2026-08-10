import {
  A,
  Button,
  EmptyState,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { FC } from "react"
import { useLocation } from "wouter"
import { appRoutes } from "#data/routes"

interface Props {
  scope?: "history" | "userFiltered"
}

export const ListEmptyStatePrice: FC<Props> = ({ scope }) => {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  if (scope === "history" && canUser("create", "prices")) {
    return (
      <EmptyState
        title="No Prices yet!"
        description="Create your first Price"
        action={
          <Button
            variant="primary"
            onClick={() => {
              setLocation(appRoutes.priceNew.makePath({}))
            }}
          >
            New Price
          </Button>
        }
      />
    )
  }

  if (scope === "userFiltered") {
    return <Text weight="semibold">No results found. Try a new search</Text>
  }

  return (
    <EmptyState
      title="No Prices yet!"
      description={
        <div>
          <p>Add a price with the API, or use the CLI.</p>
          <A
            target="_blank"
            href="https://docs.commercelayer.io/core/v/api-reference/prices"
            rel="noreferrer"
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
