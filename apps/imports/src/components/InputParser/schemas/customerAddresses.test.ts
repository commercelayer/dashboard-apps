import { ZodError } from 'zod'
import { csvCustomerAddressesSchema } from './customerAddresses'

// flat address.* keys as produced by PapaParse from CSV headers like "address.line_1"
const validFlatAddress = {
  'address.first_name': 'George',
  'address.last_name': 'Harrison',
  'address.line_1': 'Viale Borgo Valsugana 93',
  'address.city': 'Prato',
  'address.zip_code': '59100',
  'address.state_code': 'PO',
  'address.country_code': 'IT',
  'address.phone': '+39 0574 933550'
}

describe('Validate csvCustomerAddressesSchema', () => {
  test('valid with address.id only', () => {
    expect(
      csvCustomerAddressesSchema.parse([
        {
          'customer.email': 'user@commercelayer.io',
          'address.id': 'xYZkjABcde'
        }
      ])
    ).toStrictEqual([
      {
        'customer.email': 'user@commercelayer.io',
        'address.id': 'xYZkjABcde'
      }
    ])
  })

  test('valid with inline flat address only', () => {
    expect(
      csvCustomerAddressesSchema.parse([
        {
          'customer.email': 'user@commercelayer.io',
          ...validFlatAddress
        }
      ])
    ).toStrictEqual([
      {
        'customer.email': 'user@commercelayer.io',
        ...validFlatAddress
      }
    ])
  })

  test('valid with optional fields reference and reference_origin', () => {
    expect(
      csvCustomerAddressesSchema.parse([
        {
          'customer.email': 'user@commercelayer.io',
          'address.id': 'xYZkjABcde',
          reference: 'ref-001',
          reference_origin: 'app'
        }
      ])
    ).toStrictEqual([
      {
        'customer.email': 'user@commercelayer.io',
        'address.id': 'xYZkjABcde',
        reference: 'ref-001',
        reference_origin: 'app'
      }
    ])
  })

  test('throws when both address.id and flat address are provided', () => {
    expect(() =>
      csvCustomerAddressesSchema.parse([
        {
          'customer.email': 'user@commercelayer.io',
          'address.id': 'xYZkjABcde',
          ...validFlatAddress
        }
      ])
    ).toThrow(ZodError)
  })

  test('throws when neither address.id nor address is provided', () => {
    expect(() =>
      csvCustomerAddressesSchema.parse([
        {
          'customer.email': 'user@commercelayer.io'
        }
      ])
    ).toThrow(ZodError)
  })

  test('throws when inline address is missing required fields (city, phone, etc.)', () => {
    expect(() =>
      csvCustomerAddressesSchema.parse([
        {
          'customer.email': 'user@commercelayer.io',
          // line_1 is present (triggers inline-address path) but other required fields omitted
          'address.line_1': 'Viale Borgo Valsugana 93',
          'address.first_name': 'George',
          'address.last_name': 'Harrison'
        }
      ])
    ).toThrow(ZodError)
  })

  test('throws when address.first_name is missing and business is false', () => {
    expect(() =>
      csvCustomerAddressesSchema.parse([
        {
          'customer.email': 'user@commercelayer.io',
          'address.line_1': 'Viale Borgo Valsugana 93',
          'address.city': 'Prato',
          'address.zip_code': '59100',
          'address.state_code': 'PO',
          'address.country_code': 'IT',
          'address.phone': '+39 0574 933550'
          // first_name and last_name omitted, business defaults to false
        }
      ])
    ).toThrow(ZodError)
  })

  test('throws when customer.email is invalid', () => {
    expect(() =>
      csvCustomerAddressesSchema.parse([
        {
          'customer.email': 'not-an-email',
          'address.id': 'xYZkjABcde'
        }
      ])
    ).toThrow(ZodError)
  })

  test('throws when customer.email is missing', () => {
    expect(() =>
      csvCustomerAddressesSchema.parse([
        {
          'address.id': 'xYZkjABcde'
        }
      ])
    ).toThrow(ZodError)
  })
})
