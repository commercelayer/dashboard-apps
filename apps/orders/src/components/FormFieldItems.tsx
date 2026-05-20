import {
  Avatar,
  HookedInputCheckboxGroup,
  type HookedInputCheckboxGroupProps,
  Input,
  InputSelect,
  isSingleValueSelected,
  ListItem,
  Text,
  useCoreApi,
  useTranslation,
} from "@commercelayer/app-elements"
import type { LineItem } from "@commercelayer/sdk"
import { isEmpty } from "lodash-es"
import { type FC, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import type { ReturnFormValues } from "#components/FormReturn"

interface Props {
  lineItems: LineItem[]
}

export function FormFieldItems({ lineItems }: Props): React.JSX.Element {
  const { t } = useTranslation()
  const { data: organization, isLoading } = useCoreApi(
    "organization",
    "retrieve",
    [],
  )

  const returnReasons: string[] =
    organization?.config?.apps?.returns?.return_reasons ?? []

  if (lineItems.length === 0) {
    return <div>{t("common.no_items")}</div>
  }

  return (
    <HookedInputCheckboxGroup
      name="items"
      title="Items"
      options={lineItems.map((item) =>
        makeOptionItem({ item, isLoading, returnReasons }),
      )}
    />
  )
}

function makeOptionItem({
  item,
  isLoading,
  returnReasons,
}: {
  item: LineItem
  isLoading: boolean
  returnReasons: string[]
}): HookedInputCheckboxGroupProps["options"][number] {
  return {
    value: item.id,
    content: (
      <>
        <ListItem
          alignIcon="center"
          alignItems="center"
          borderStyle="none"
          icon={
            item.image_url != null ? (
              <Avatar
                alt={item.name ?? ""}
                size="small"
                src={item.image_url as `https://${string}`}
              />
            ) : undefined
          }
          padding="none"
        >
          <div>
            <Text size="regular" tag="div" weight="semibold">
              {item.name}
            </Text>
          </div>
        </ListItem>
      </>
    ),
    checkedElement: (
      <OptionInputReason
        item={item}
        returnReasons={returnReasons}
        isLoading={isLoading}
      />
    ),
    quantity: {
      min: 1,
      max: item.quantity,
    },
  }
}

/** When checked, show input for reason */
const OptionInputReason: FC<{
  item: LineItem
  returnReasons: string[]
  isLoading: boolean
}> = ({ item, returnReasons, isLoading }) => {
  const { watch, setValue } = useFormContext<ReturnFormValues>()
  const items = watch("items") ?? []
  const isSelected = items.find(({ value }) => value === item.id) != null
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!isSelected && !isEmpty(reason)) {
      setReason("")
    }
  }, [isSelected, reason])

  return returnReasons.length > 0 || isLoading ? (
    <InputSelect
      isLoading={isLoading}
      initialValues={returnReasons.map((reason) => ({
        value: reason,
        label: reason,
      }))}
      isCreatable
      isClearable
      placeholder="Select or add a reason (optional)"
      menuPortalTarget={document.body}
      onSelect={(selected) => {
        const value =
          isSingleValueSelected(selected) && typeof selected.value === "string"
            ? selected.value
            : ""
        setReason(value)
        setValue(
          `items.${items.findIndex(({ value }) => value === item.id)}.reason`,
          value,
        )
      }}
    />
  ) : (
    <Input
      value={reason}
      placeholder="Add a reason (optional)"
      onChange={(e) => {
        setReason(e.target.value)
        setValue(
          `items.${items.findIndex(({ value }) => value === item.id)}.reason`,
          e.target.value,
        )
      }}
    />
  )
}
