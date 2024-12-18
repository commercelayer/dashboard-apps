import { appRoutes, type PageProps } from '#data/routes'
import { isMock } from '#mocks'
import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { type Link, type LinkUpdate } from '@commercelayer/sdk'
import {
  LinkForm,
  type LinkFormValues
} from 'dashboard-apps-common/src/components/LinkForm'
import { useLinkDetails } from 'dashboard-apps-common/src/hooks/useLinkDetails'
import { useState } from 'react'
import { useLocation } from 'wouter'

function LinkEdit(props: PageProps<typeof appRoutes.linkEdit>): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()

  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const orderId = props.params?.orderId ?? ''
  const linkId = props.params?.linkId ?? ''
  const goBackUrl = appRoutes.linkDetails.makePath({ orderId })
  const { link, isLoading, mutateLink } = useLinkDetails(linkId)

  if (!canUser('update', 'links')) {
    return (
      <PageLayout
        title={t('common.edit_resource', {
          resource: t('resources.links.name')
        })}
        navigationButton={{
          onClick: () => {
            setLocation(goBackUrl)
          },
          label: t('common.back'),
          icon: 'x'
        }}
        scrollToTop
        overlay
      >
        <EmptyState
          title={t('common.not_authorized')}
          description={t('common.not_authorized_description')}
          action={
            <Button
              variant='primary'
              onClick={() => {
                setLocation(goBackUrl)
              }}
            >
              {t('common.go_back')}
            </Button>
          }
        />
      </PageLayout>
    )
  }

  if (link == null || isLoading || isMock(link)) {
    return <></>
  }

  return (
    <PageLayout
      title={t('common.edit_resource', {
        resource: t('resources.links.name')
      })}
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: t('common.back'),
        icon: 'arrowLeft'
      }}
      scrollToTop
      overlay
    >
      <Spacer bottom='14'>
        <LinkForm
          resourceType='orders'
          apiError={apiError}
          isSubmitting={isSaving}
          defaultValues={adaptLinkToFormValues(link)}
          onSubmit={(formValues) => {
            setIsSaving(true)
            const link = adaptFormValuesToLink(formValues)
            void sdkClient.links
              .update(link)
              .then((editedLink) => {
                if (editedLink != null) {
                  void mutateLink()
                  setLocation(goBackUrl)
                }
              })
              .catch((error) => {
                setApiError(error)
                setIsSaving(false)
              })
          }}
        />
      </Spacer>
    </PageLayout>
  )
}

function adaptLinkToFormValues(link?: Link): LinkFormValues {
  return {
    id: link?.id,
    name: link?.name ?? '',
    clientId: link?.client_id ?? '',
    market: link?.scope.replace('market:id:', '') ?? '',
    startsAt: new Date(link?.starts_at ?? ''),
    expiresAt: new Date(link?.expires_at ?? '')
  }
}

function adaptFormValuesToLink(formValues: LinkFormValues): LinkUpdate {
  return {
    id: formValues.id ?? '',
    name: formValues.name,
    client_id: formValues.clientId,
    expires_at: formValues.expiresAt.toJSON()
  }
}

export default LinkEdit
