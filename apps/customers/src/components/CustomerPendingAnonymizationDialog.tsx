import {
  formatDateWithPredicate,
  Modal,
  Spacer,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Customer } from "@commercelayer/sdk"
import { Link } from "wouter"
import { appRoutes } from "#data/routes"

interface Props {
  customers: Customer[]
  show: boolean
  onClose: () => void
}

export function CustomerPendingAnonymizationDialog({
  customers,
  show,
  onClose,
}: Props): React.JSX.Element {
  const { user } = useTokenProvider()

  return (
    <Modal show={show} onClose={onClose} size="small">
      <Modal.Header>Pending anonymization</Modal.Header>
      <Modal.Body>
        {customers.map((customer, index) => (
          <Link
            key={customer.id}
            href={appRoutes.details.makePath(customer.id)}
          >
            <Spacer bottom={index === customers.length - 1 ? undefined : "4"}>
              <Spacer bottom="1">
                <Text color="black" size="small" weight="semibold">
                  {customer.email}
                </Text>
              </Spacer>
              <Text tag="div" variant="info" size="x-small">
                {formatDateWithPredicate({
                  predicate: "Requested",
                  format: "distanceToNow",
                  isoDate: customer.anonymization_info?.requested_at,
                  timezone: user?.timezone,
                })}
              </Text>
            </Spacer>
          </Link>
        ))}
      </Modal.Body>
    </Modal>
  )
}
