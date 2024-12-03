import { makeCustomer } from '#mocks'
import {
  ResourceListItem,
  useAppLinking,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  resource?: Customer
}

function ListItemCustomerComponent({
  resource = makeCustomer()
}: Props): JSX.Element {
  const { navigateTo } = useAppLinking()

  return (
    <ResourceListItem
      resource={resource}
      {...navigateTo({
        app: 'customers',
        resourceId: resource.id
      })}
    />
  )
}

export const ListItemCustomer = withSkeletonTemplate(ListItemCustomerComponent)
