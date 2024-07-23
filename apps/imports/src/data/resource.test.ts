import { getParentResourceIfNeeded } from './resources'

describe('getParentResourceIfNeeded', () => {
  test('Should return the parent resource type', () => {
    expect(getParentResourceIfNeeded('bundles')).toBe('markets')
    expect(getParentResourceIfNeeded('coupons')).toBe('promotions')
    expect(getParentResourceIfNeeded('orders')).toBe('markets')
    expect(getParentResourceIfNeeded('prices')).toBe('price_lists')
    expect(getParentResourceIfNeeded('sku_options')).toBe('markets')
    expect(getParentResourceIfNeeded('stock_items')).toBe('stock_locations')
    expect(getParentResourceIfNeeded('tax_categories')).toBe('tax_calculators')
  })

  test('Should return false when resource does not have a parent', () => {
    expect(getParentResourceIfNeeded('sku')).toBe(false)
    expect(getParentResourceIfNeeded('customer_subscriptions')).toBe(false)
  })

  test('Should also return false when resource passed as argument is invalid', () => {
    expect(getParentResourceIfNeeded('skuuuu')).toBe(false)
    // @ts-expect-error testing without argument
    expect(getParentResourceIfNeeded(undefined)).toBe(false)
    // @ts-expect-error testing with invalid argument
    expect(getParentResourceIfNeeded(42)).toBe(false)
  })
})
