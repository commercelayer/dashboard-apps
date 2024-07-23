interface FrequencyOption {
  value: string
  label: string
}

export const getFrequenciesForSelect = (): FrequencyOption[] => {
  return [
    { value: '0', label: 'Hourly' },
    { value: '1', label: 'Daily' },
    { value: '7', label: 'Weekly' },
    { value: '30', label: 'Monthly' },
    { value: '60', label: 'Two months' },
    { value: '90', label: 'Three months' },
    { value: '120', label: 'Four months' },
    { value: '180', label: 'Six months' },
    { value: '365', label: 'Yearly' },
    { value: 'unlimited', label: 'Unlimited' },
    { value: 'custom', label: 'Custom' }
  ]
}
