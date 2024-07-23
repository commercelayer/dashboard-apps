interface MetricsApiShipmentsBreakdownItem {
  label: string
  value: number
}

interface MetricsApiShipmentsBreakdownData {
  'shipments.status': MetricsApiShipmentsBreakdownItem[]
}

interface VndApiResponse<Data> {
  data: Data
  meta: {
    pagination: {
      record_count: number
      cursor: string | null
    }
  }
}
