import { type HintProps, HookedInputSelect } from "@commercelayer/app-elements"
import { getAllEventsForSelect } from "#data/events"

interface Props {
  name: string
  hintText?: HintProps["children"]
}

export function EventSelector({
  name,
  hintText,
}: Props): React.JSX.Element | null {
  const events = getAllEventsForSelect()

  return (
    <HookedInputSelect
      name={name}
      initialValues={events}
      isClearable
      label="Topic"
      hint={{ text: hintText }}
    />
  )
}
