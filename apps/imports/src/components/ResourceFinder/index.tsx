import { type CommerceLayerClient } from '@commercelayer/sdk'
import { type AllowedParentResource, type AllowedResourceType } from 'App'
import { useEffect, useRef, useState } from 'react'
import { fetchResources } from './utils'
import {
  InputSelect,
  Label,
  isSingleValueSelected
} from '@commercelayer/app-elements'
import {
  type InputSelectValue,
  type InputSelectProps
} from '@commercelayer/app-elements/dist/ui/forms/InputSelect'

interface Props extends Pick<InputSelectProps, 'feedback' | 'hint'> {
  /**
   * Text to show above the input
   */
  label: string
  /**
   * Optional input placeholder
   */
  placeholder?: string
  /**
   * the type of the resource we need to access
   */
  resourceType: AllowedResourceType | AllowedParentResource
  /**
   * A signed SDK client
   */
  sdkClient: CommerceLayerClient
  /**
   * callback function fired when the resource is selected from the list
   */
  onSelect?: (resourceId: string | null) => void
}

export function ResourceFinder({
  label,
  placeholder,
  resourceType,
  sdkClient,
  feedback,
  hint,
  onSelect
}: Props): JSX.Element {
  const [isLoading, setIsLoading] = useState(true)
  const [initialValues, setInitialValues] = useState<InputSelectValue[]>([])
  const element = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (resourceType == null) {
      return
    }
    setIsLoading(true)
    void fetchResources({ sdkClient, resourceType })
      .then(setInitialValues)
      .finally(() => {
        setIsLoading(false)
      })
  }, [resourceType])

  useEffect(() => {
    if (
      feedback != null &&
      feedback.variant === 'danger' &&
      element.current != null
    ) {
      element.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [feedback])

  return (
    <div ref={element}>
      <Label gap htmlFor='parent-resource'>
        {label}
      </Label>
      <InputSelect
        initialValues={initialValues}
        isClearable
        feedback={feedback}
        hint={hint}
        placeholder={placeholder}
        isLoading={isLoading}
        onSelect={(selected) => {
          if (onSelect != null) {
            onSelect(
              isSingleValueSelected(selected) ? `${selected.value}` : null
            )
          }
        }}
        loadAsyncValues={async (hint) => {
          return await fetchResources({ sdkClient, resourceType, hint })
        }}
      />
    </div>
  )
}
