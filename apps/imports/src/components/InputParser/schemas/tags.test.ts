import { csvTagsSchema } from './tags'

describe('Validate csvTagsSchema', () => {
  test('received input should have a valid Tags schema', () => {
    expect(
      csvTagsSchema.parse([
        {
          name: 'bags'
        },
        {
          name: 'accessories'
        }
      ])
    ).toStrictEqual([
      {
        name: 'bags'
      },
      {
        name: 'accessories'
      }
    ])
  })
})
