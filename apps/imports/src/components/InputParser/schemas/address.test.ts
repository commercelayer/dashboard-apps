import { ZodError } from 'zod'
import { csvAddressSchema } from './address'

describe('Validate csvAddressSchema', () => {
  test('received input should have a valid schema', () => {
    expect(
      csvAddressSchema.parse([
        {
          business: 'false',
          first_name: 'George',
          last_name: 'Harrison',
          line_1: 'Viale Borgo Valsugana 93',
          city: 'Prato',
          zip_code: '59100',
          state_code: 'PO',
          country_code: 'IT',
          phone: '+39 0574 933550',
          email: 'george@thebeatles.co.uk'
        }
      ])
    ).toStrictEqual([
      {
        business: false,
        first_name: 'George',
        last_name: 'Harrison',
        line_1: 'Viale Borgo Valsugana 93',
        city: 'Prato',
        zip_code: '59100',
        state_code: 'PO',
        country_code: 'IT',
        phone: '+39 0574 933550',
        email: 'george@thebeatles.co.uk'
      }
    ])
  })

  test('company is mandatory when business is true', () => {
    expect(
      csvAddressSchema.parse([
        {
          business: 'true',
          company: 'The Beatles',
          line_1: 'Viale Borgo Valsugana 93',
          city: 'Prato',
          zip_code: '59100',
          state_code: 'PO',
          country_code: 'IT',
          phone: '+39 0574 933550',
          email: 'george@thebeatles.co.uk'
        }
      ])
    ).toStrictEqual([
      {
        business: true,
        company: 'The Beatles',
        line_1: 'Viale Borgo Valsugana 93',
        city: 'Prato',
        zip_code: '59100',
        state_code: 'PO',
        country_code: 'IT',
        phone: '+39 0574 933550',
        email: 'george@thebeatles.co.uk'
      }
    ])
  })

  test('Expect error when first_name is missing and company is false', () => {
    try {
      csvAddressSchema.parse([
        {
          line_1: 'Viale Borgo Valsugana 93',
          city: 'Prato',
          zip_code: '59100',
          state_code: 'PO',
          country_code: 'IT',
          phone: '+39 0574 933550',
          email: 'george@thebeatles.co.uk'
        }
      ])
    } catch (err) {
      if (err instanceof ZodError) {
        expect(err).toBeInstanceOf(ZodError)
      }
    }
  })
})
