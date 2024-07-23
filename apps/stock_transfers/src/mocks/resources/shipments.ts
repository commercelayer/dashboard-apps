import type { Shipment } from '@commercelayer/sdk'
import { makeResource } from '../resource'
import { makeShippingMethod } from './shipping_methods'

export const makeShipment = (): Shipment => {
  return {
    ...makeResource('shipments'),
    number: '#19346523/S/001',
    status: 'upcoming',
    shipping_method: makeShippingMethod()
  }
}
