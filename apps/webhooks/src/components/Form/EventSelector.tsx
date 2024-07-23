import { getAllEventsForSelect } from '#data/events'
import { HookedInputSelect } from '@commercelayer/app-elements'
import type { HintProps } from '@commercelayer/app-elements/dist/ui/atoms/Hint'

interface Props {
  name: string
  hintText?: HintProps['children']
}

export function EventSelector({ name, hintText }: Props): JSX.Element | null {
  const events = getAllEventsForSelect()

  return (
    <HookedInputSelect
      name={name}
      initialValues={events}
      isClearable
      label='Topic'
      hint={{ text: hintText }}
    />
  )
}
