import type { PriceTierFormValues } from '#components/PriceTierForm'
import {
  getPriceTierSdkResource,
  getUpToForFrequencyForm,
  getUpToForFrequencyTable,
  getUpToForVolumeForm,
  getUpToFromForm,
  isUpToForFrequencyFormCustom
} from './priceTiers'

test('Check getPriceTierSdkResource', () => {
  expect(getPriceTierSdkResource('frequency')).toBe('price_frequency_tiers')
  expect(getPriceTierSdkResource('volume')).toBe('price_volume_tiers')
})

test('Check getUpToFromForm', () => {
  const volumeFormValues: PriceTierFormValues = {
    name: 'Unlimited',
    currency_code: 'EUR',
    up_to: '',
    price: 9.0,
    type: 'volume'
  }
  expect(getUpToFromForm(volumeFormValues)).toBe(null)

  const frequencyFormValues: PriceTierFormValues = {
    name: 'Every 6 days',
    currency_code: 'EUR',
    up_to: 'custom',
    up_to_days: '6',
    price: 9.0,
    type: 'frequency'
  }
  expect(getUpToFromForm(frequencyFormValues)).toBe(6)
})

test('Check isUpToForFrequencyFormCustom', () => {
  expect(isUpToForFrequencyFormCustom(6)).toBe(true)
  expect(isUpToForFrequencyFormCustom(7)).toBe(false)
  expect(isUpToForFrequencyFormCustom(25)).toBe(true)
  expect(isUpToForFrequencyFormCustom(30)).toBe(false)
})

test('Check getUpToForFrequencyForm', () => {
  expect(getUpToForFrequencyForm(null)).toBe('unlimited')
  expect(getUpToForFrequencyForm(1)).toBe('1')
  expect(getUpToForFrequencyForm(7)).toBe('7')
})

test('Check getUpToForVolumeForm', () => {
  expect(getUpToForVolumeForm(null)).toBe('')
  expect(getUpToForVolumeForm(1.0)).toBe('1')
  expect(getUpToForVolumeForm(7.0)).toBe('7')
})

test('Check getUpToForFrequencyTable', () => {
  expect(getUpToForFrequencyTable(null)).toBe(`♾️`)
  expect(getUpToForFrequencyTable(1)).toBe('Daily')
  expect(getUpToForFrequencyTable(2)).toBe('2 days')
  expect(getUpToForFrequencyTable(7)).toBe('Weekly')
  expect(getUpToForFrequencyTable(16)).toBe('16 days')
  expect(getUpToForFrequencyTable(30)).toBe('Monthly')
})
