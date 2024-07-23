import { makeCustomer } from '#mocks'
import {
  ResourceListItem,
  navigateTo,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  resource?: Customer
}

function ListItemCustomerComponent({
  resource = makeCustomer()
}: Props): JSX.Element {
  const [, setLocation] = useLocation()

  return (
    <ResourceListItem
      resource={resource}
      {...navigateTo({
        setLocation,
        destination: {
          app: 'customers',
          resourceId: resource.id
        }
      })}
    />
  )
}

export const ListItemCustomer = withSkeletonTemplate(ListItemCustomerComponent)
