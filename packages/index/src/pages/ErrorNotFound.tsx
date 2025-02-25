import { EmptyState, PageLayout } from '@commercelayer/app-elements'

export function ErrorNotFound(): React.JSX.Element {
  return (
    <PageLayout title='App router'>
      <EmptyState
        title='Not found'
        description='We could not find the resource you are looking for.'
      />
    </PageLayout>
  )
}
