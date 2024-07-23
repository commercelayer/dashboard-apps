import { ErrorNotFound } from '#components/ErrorNotFound'
import { WebhookCallback } from '#components/WebhookCallback'
import { WebhookInfos } from '#components/WebhookInfos'
import { WebhookTopCard } from '#components/WebhookTopCard'
import { appRoutes } from '#data/routes'
import { useWebhookDetails } from '#hooks/useWebhookDetails'
import {
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  EmptyState,
  Icon,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export const WebhookDetails: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, params] = useRoute(appRoutes.details.path)
  const [, setLocation] = useLocation()

  const webhookId = params?.webhookId ?? ''
  const { webhook, isLoading } = useWebhookDetails(webhookId)

  if (webhookId == null || !canUser('read', 'webhooks')) {
    return (
      <PageLayout
        title='Webhook details'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Webhooks`,
          icon: 'arrowLeft'
        }}
        mode={settings.mode}
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

  const contextMenuEdit = canUser('update', 'webhooks') && (
    <DropdownItem
      label='Edit'
      onClick={() => {
        setLocation(appRoutes.editWebhook.makePath({ webhookId }))
      }}
    />
  )

  const contextMenuDivider = canUser('update', 'webhooks') &&
    canUser('destroy', 'webhooks') && <DropdownDivider />

  const contextMenuDelete = canUser('destroy', 'webhooks') && (
    <DropdownItem
      label='Delete'
      onClick={() => {
        setLocation(appRoutes.deleteWebhook.makePath({ webhookId }))
      }}
    />
  )

  const contextMenu = (
    <Dropdown
      dropdownLabel={
        <Button variant='secondary' size='small'>
          <Icon name='dotsThree' size={16} weight='bold' />
        </Button>
      }
      dropdownItems={
        <>
          {contextMenuEdit}
          {contextMenuDivider}
          {contextMenuDelete}
        </>
      }
    />
  )

  return webhook == null ? (
    <ErrorNotFound />
  ) : (
    <SkeletonTemplate isLoading={isLoading}>
      <PageLayout
        title={webhook.name}
        mode={settings.mode}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Webhooks`,
          icon: 'arrowLeft'
        }}
        actionButton={contextMenu}
      >
        <Spacer bottom='12'>
          <WebhookTopCard />
        </Spacer>
        <Spacer bottom='12'>
          <WebhookInfos webhook={webhook} />
        </Spacer>
        <WebhookCallback webhook={webhook} />
      </PageLayout>
    </SkeletonTemplate>
  )
}
