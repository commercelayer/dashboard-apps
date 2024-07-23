import type { Shipment } from '@commercelayer/sdk'
import { makeResource } from '../resource'
import { makeShippingMethod } from './shipping_methods'

export const makeShipment = (): Shipment => {
  return {
    ...makeResource('shipments'),
    number: '#19346523/S/001',
    status: 'upcoming',
    shipping_method: makeShippingMethod(),
    rates: [
      {
        id: 'rate_dccd6ae64efc4cbda262d292218c195a',
        carrier: 'DHLExpress',
        service: 'Domestic Express',
        carrier_account_id: 'ca_198fff28d1534b3ba3788fa221b39514',
        currency: 'EUR',
        rate: 16.25,
        formatted_rate: '€16,25',
        delivery_date: '2023-07-12T00:00:00Z',
        formatted_delivery_date: 'Jul 12, 2023 12:00 AM',
        delivery_days: 1,
        est_delivery_days: 1,
        shipment_id: 'shp_733ca570a45c4527867d4eb8072e764d',
        mode: 'test'
      },
      {
        id: 'rate_7540271c0a7b4f46831a8926ef066617',
        carrier: 'DHLExpress',
        service: 'Express Easy',
        carrier_account_id: 'ca_198fff28d1534b3ba3788fa221b39514',
        currency: 'EUR',
        rate: 37.61,
        formatted_rate: '€37,61',
        delivery_date: '2023-07-12T00:00:00Z',
        formatted_delivery_date: 'Jul 12, 2023 12:00 AM',
        delivery_days: 1,
        est_delivery_days: 1,
        shipment_id: 'shp_733ca570a45c4527867d4eb8072e764d',
        mode: 'test'
      }
    ]
  }
}
