import type {
  TokenProviderExtras,
  ToolbarItem,
} from "@commercelayer/app-elements"
import type { ListableResourceType } from "@commercelayer/sdk"

export const getResourceModalButton = (
  resourceType: ListableResourceType,
  resourceId: string,
  extras?: TokenProviderExtras,
): ToolbarItem => {
  return {
    icon: "code",
    size: "small",
    variant: "secondary",
    onClick: () => {
      extras?.openResourceModal?.({
        resourceType,
        resourceId,
      })
    },
  }
}
