import {
  Button,
  InputFeedback,
  PageHeading,
  Spacer,
  useOverlay
} from '@commercelayer/app-elements'
import { CommerceLayerStatic } from '@commercelayer/sdk'
import { useState, type FC } from 'react'

interface OverlayHook {
  openDeleteOverlay: () => void
  closeDeleteOverlay: () => void
  DeleteOverlay: React.FC<{ title: string; onDelete: () => Promise<unknown> }>
}

export function useDeleteOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const [error, setError] = useState<unknown>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  return {
    openDeleteOverlay: open,
    closeDeleteOverlay: close,
    DeleteOverlay: ({ title, onDelete }) => {
      return (
        <OverlayElement backgroundColor='light'>
          <PageHeading
            title={title}
            navigationButton={{
              onClick: () => {
                close()
                setError(null)
              },
              label: 'Close',
              icon: 'x'
            }}
            description='This action cannot be undone, proceed with caution.'
          />

          <Button
            variant='danger'
            fullWidth
            disabled={isDeleting}
            onClick={() => {
              setError(null)
              setIsDeleting(true)
              void onDelete()
                .catch(setError)
                .finally(() => {
                  setIsDeleting(false)
                })
            }}
          >
            Delete
          </Button>

          <APIError error={error} />
        </OverlayElement>
      )
    }
  }
}

const APIError: FC<{ error: unknown }> = ({ error }) => {
  const apiError = parseApiError(error)

  if (error == null || apiError.length === 0) {
    return null
  }

  return (
    <Spacer top='2'>
      {apiError.map((error, idx) => (
        <InputFeedback variant='danger' key={idx} message={error.detail} />
      ))}
    </Spacer>
  )
}

function parseApiError(err: any): ApiError[] {
  if (err == null) {
    return []
  }

  if (CommerceLayerStatic.isApiError(err) && Array.isArray(err.errors)) {
    return err.errors
  } else {
    return [
      {
        code: 'Internal server error',
        detail: err.message ?? 'Something went wrong, please retry later',
        status: '500',
        title: err.message ?? 'Internal server error'
      }
    ]
  }
}

interface ApiError {
  code: string
  detail: string
  status: string
  title: string
}
