import { usePickingList } from '#hooks/usePickingList'
import { Progress } from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'
import sumBy from 'lodash/sumBy'
import { useMemo } from 'react'

export const ShipmentProgress: React.FC<{ shipment: Shipment }> = ({
  shipment
}) => {
  const pickingList = usePickingList(shipment)

  const progress = useMemo(() => {
    const max = sumBy(shipment.stock_line_items, 'quantity')
    const value = max - sumBy(pickingList, 'quantity')

    return {
      value,
      max,
      percentage: (value / max) * 100
    }
  }, [shipment])

  return (
    <Progress value={progress.value} max={progress.max}>
      {progress.percentage}%
    </Progress>
  )
}
