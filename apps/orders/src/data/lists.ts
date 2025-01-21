import { t } from '@commercelayer/app-elements'
import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'

export type ListType =
  | 'awaitingApproval'
  | 'editing'
  | 'paymentToCapture'
  | 'fulfillmentInProgress'
  | 'archived'
  | 'pending'
  | 'history'

export const presets: Record<ListType, FormFullValues> = {
  awaitingApproval: {
    status_in: ['placed'],
    payment_status_in: ['authorized', 'free', 'paid'],
    archived: 'hide',
    viewTitle: t('apps.orders.tasks.awaiting_approval')
  },
  editing: {
    status_in: ['editing'],
    payment_status_in: [],
    archived: 'hide',
    viewTitle: t('apps.orders.tasks.editing')
  },
  paymentToCapture: {
    status_in: ['approved'],
    payment_status_in: ['authorized'],
    archived: 'hide',
    viewTitle: t('apps.orders.tasks.payment_to_capture')
  },
  fulfillmentInProgress: {
    status_in: ['approved'],
    fulfillment_status_in: ['in_progress'],
    archived: 'hide',
    viewTitle: t('apps.orders.tasks.fulfillment_in_progress')
  },
  history: {
    archived: 'hide',
    viewTitle: t('apps.orders.tasks.history')
  },
  pending: {
    status_in: ['pending'],
    archived: 'show',
    viewTitle: t('apps.orders.tasks.carts')
  },
  archived: {
    archived: 'only',
    viewTitle: t('apps.orders.tasks.archived')
  }
}
