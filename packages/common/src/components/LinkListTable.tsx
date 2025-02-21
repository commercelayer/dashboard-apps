import { Table, Th, Tr } from '@commercelayer/app-elements'
import type { Sku, SkuList } from '@commercelayer/sdk'
import { useLocation } from 'wouter'
import { linksRoutes } from '../data/routes'
import { useLinksList } from '../hooks/useLinksList'
import { LinkListRow } from './LinkListRow'

interface Props {
  resourceId: Sku['id'] | SkuList['id']
  resourceType: 'skus' | 'sku_lists'
}

export const LinkListTable = ({
  resourceId,
  resourceType
}: Props): React.JSX.Element | null => {
  const [, setLocation] = useLocation()

  const {
    links,
    isLoading,
    mutate: mutateList
  } = useLinksList({ resourceId, resourceType })

  return !isLoading && (links == null || links?.length === 0) ? null : (
    <Table
      thead={
        <Tr>
          <Th>Code</Th>
          <Th>Dates</Th>
          <Th>Status</Th>
          <Th> </Th>
        </Tr>
      }
      tbody={
        <>
          {links?.map((link) => (
            <LinkListRow
              link={link}
              onLinkDetailsClick={() => {
                setLocation(
                  linksRoutes.linksDetails.makePath({
                    resourceId,
                    linkId: link.id
                  })
                )
              }}
              onLinkEditClick={() => {
                setLocation(
                  linksRoutes.linksEdit.makePath({
                    resourceId,
                    linkId: link.id
                  })
                )
              }}
              key={link.id}
              mutateList={mutateList}
            />
          ))}
        </>
      }
    />
  )
}
