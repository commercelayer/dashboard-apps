import { useCoreSdkProvider } from '@commercelayer/app-elements'
import type { Link, Order } from '@commercelayer/sdk'
import { addMonths } from 'date-fns/addMonths'
import { useEffect, useState } from 'react'

interface Props {
  /** The order id. */
  orderId: Order['id']
  /**
   * The client id of a sales channel API credential used to create the link the first time.
   * If missing it won't be possible to generate a new link the first time.
   **/
  clientId?: string
  /** The given scope. */
  scope?: string
}

/**
 * Get or create a checkout link related to a given order.
 * @param orderId - The order id.
 * @param clientId - The client id of a sales channel API credential used to create the link the first time.
 * @param scope - The given scope.
 * @returns a list of resolved `Links`.
 */

export function useGetCheckoutLink({ orderId, clientId, scope }: Props): {
  link?: Link
  isLoading: boolean
} {
  const { sdkClient } = useCoreSdkProvider()

  const [link, setLink] = useState<Link>()
  const [canCreateLink, setCanCreateLink] = useState<boolean>(false)

  useEffect(() => {
    if (link == null) {
      void sdkClient.orders.links(orderId).then((links) => {
        if (links != null && links.length > 0) {
          setLink(links[0])
        } else {
          setCanCreateLink(true)
        }
      })
    }
  }, [link])

  useEffect(() => {
    if (canCreateLink && clientId != null && scope != null) {
      void sdkClient.links
        .create({
          name: `Checkout link for ${orderId}`,
          client_id: clientId,
          scope,
          starts_at: new Date().toJSON(),
          expires_at: addMonths(new Date(), 1).toJSON(),
          item: {
            type: 'orders',
            id: orderId
          }
        })
        .then((createdLink) => {
          setCanCreateLink(false)
          setLink(createdLink)
        })
    }
  }, [canCreateLink, clientId, scope])

  return { link, isLoading: link == null }
}
