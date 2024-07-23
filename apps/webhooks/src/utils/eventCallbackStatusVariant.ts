import type { EventCallback } from '@commercelayer/sdk'

export function eventCallbackStatusVariant(
  eventCallback: EventCallback | undefined
): 'success' | 'danger' {
  return eventCallback != null && eventCallback?.response_code !== '200'
    ? 'danger'
    : 'success'
}
