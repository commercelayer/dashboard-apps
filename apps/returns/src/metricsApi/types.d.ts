type MetricsApiReturnsSearchData = Array<{
  id: string
  created_at: string
  status:
    | 'requested'
    | 'approved'
    | 'shipped'
    | 'received'
    | 'cancelled'
    | 'rejected'
  market?: {
    name: string
    id: string
  }
  customer?: {
    email: string
  }
}>

interface MetricsApiReturnsStatsData {
  value: number
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
