import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Table,
  Td,
  Th,
  Tr,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

import { LinkListRow } from '#components/LinkListRow'
import { appRoutes, type PageProps } from '#data/routes'
import { useLinksList } from '#hooks/useLinksList'

export const LinkList = (
  props: PageProps<typeof appRoutes.linksList>
): JSX.Element => {
  const {
    settings: { mode },
    canUser
  } = useTokenProvider()

  const [, setLocation] = useLocation()
  const skuListId = props.params?.skuListId ?? ''

  const {
    links,
    isLoading,
    error,
    mutate: mutateList
  } = useLinksList({ skuListId })

  const pageTitle = 'Archive'

  if (error != null) {
    return (
      <PageLayout
        title={pageTitle}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.details.makePath({ skuListId }))
          },
          label: 'Cancel',
          icon: 'x'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.details.makePath({ skuListId })
          })
        },
        label: 'Cancel',
        icon: 'x'
      }}
      toolbar={
        canUser('create', 'links')
          ? {
              buttons: [
                {
                  label: 'Add new',
                  icon: 'plus',
                  size: 'small',
                  onClick: () => {
                    setLocation(appRoutes.linksNew.makePath({ skuListId }))
                  }
                }
              ]
            }
          : undefined
      }
      scrollToTop
      overlay
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Table
          variant='boxed'
          thead={
            <Tr>
              <Th>Code</Th>
              <Th> </Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th> </Th>
            </Tr>
          }
          tbody={
            <>
              {!isLoading && links?.length === 0 && (
                <Tr>
                  <Td colSpan={5}>no results</Td>
                </Tr>
              )}
              {links?.map((link) => (
                <LinkListRow
                  link={link}
                  skuListId={skuListId}
                  key={link.id}
                  mutateList={mutateList}
                />
              ))}
            </>
          }
        />
      </SkeletonTemplate>
    </PageLayout>
  )
}
