import { A, EmptyState } from '@commercelayer/app-elements'
import type { FC } from 'react'

export const ListEmptyStateSku: FC = () => {
  return (
    <EmptyState
      title='No skus yet!'
      description={
        <div>
          <p>Add a SKU with the API, or use the CLI.</p>
          <A
            target='_blank'
            href='https://docs.commercelayer.io/core/v/api-reference/skus'
            rel='noreferrer'
          >
            View API reference.
          </A>
        </div>
      }
    />
  )
}
