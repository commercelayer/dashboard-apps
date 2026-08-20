import {
  isMockedId,
  isTaggableResource,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
} from "@commercelayer/app-elements"
import type { ListableResource } from "@commercelayer/sdk"

export interface ResourceInfoBlocksProps {
  /** The resource the page is about. Its type and id drive everything below. */
  resource: ListableResource
  /** Title for the editing overlays, usually the page title. */
  title: string
  /** Called after an inline edit, to refetch the resource. */
  onUpdated: () => Promise<void>
  /** When set, tags become clickable — usually to filter the list by that tag. */
  onTagClick?: (tagId: string) => void
  /** Classes for the wrapper, e.g. `print:hidden`. */
  className?: string
}

/**
 * Details, Tags and Metadata, in that order, as every details page shows them.
 *
 * Three things it takes care of, each of which every page used to repeat:
 *
 * - **Tags only where they exist.** A stock item or an import cannot be tagged, so
 *   the block is left out rather than rendering an empty section.
 * - **The mocked-id guard.** While the page is a skeleton the resource is a mock, and
 *   Tags and Metadata would fetch against an id that does not exist.
 * - **The spacing between the blocks**, which is why a resource without tags still
 *   looks right — no gap left where the block would have been.
 *
 * How the blocks themselves render is not decided here: each adapts to the surface it
 * is on (see `useSurfaceVariant`), so the same call works in a page, in a drawer and
 * in the sidebar.
 */
export function ResourceInfoBlocks({
  resource,
  title,
  onUpdated,
  onTagClick,
  className,
}: ResourceInfoBlocksProps): React.JSX.Element {
  const resourceType = resource.type
  // a mock resource has no server-side counterpart to fetch tags or metadata for
  const canFetchRelated = !isMockedId(resource.id)

  return (
    // Details last, as the designs have it: the id, reference and timestamps are the
    // least useful of the three, so tags and metadata come first.
    <div className={className}>
      {canFetchRelated && isTaggableResource(resourceType) && (
        <ResourceTags
          resourceType={resourceType}
          resourceId={resource.id}
          overlay={{ title }}
          onTagClick={onTagClick}
        />
      )}
      {canFetchRelated && (
        <div
          className={
            "mt-14" +
            (isTaggableResource(resourceType) ? " lg:mt-10" : undefined)
          }
        >
          <ResourceMetadata
            resourceType={resourceType}
            resourceId={resource.id}
            overlay={{ title }}
          />
        </div>
      )}
      <div className={"mt-14" + (canFetchRelated ? " lg:mt-10" : undefined)}>
        <ResourceDetails resource={resource} onUpdated={onUpdated} />
      </div>
    </div>
  )
}
