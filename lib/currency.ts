/**
 * Currency Settings Interface
 */
export interface CurrencySettings {
  currency: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
}

/**
 * Default currency settings
 */
export const DEFAULT_CURRENCY: CurrencySettings = {
  currency: 'USD',
  currencySymbol: '$',
  currencyPosition: 'before'
}

/**
 * Format a number as currency based on settings
 * @param amount - The amount to format
 * @param settings - Currency settings (optional, uses defaults if not provided)
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  settings: CurrencySettings = DEFAULT_CURRENCY,
  options: {
    showSymbol?: boolean
    decimals?: number
  } = {}
): string {
  const {
    showSymbol = true,
    decimals = 2
  } = options

  // Handle null/undefined/empty values
  if (amount === null || amount === undefined || amount === '') {
    amount = 0
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return showSymbol ? `${settings.currencySymbol}0.00` : '0.00'
  }

  // Format number with thousands separator and decimals
  const formattedNumber = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  // Return without symbol if requested
  if (!showSymbol) {
    return formattedNumber
  }

  // Add symbol based on position
  if (settings.currencyPosition === 'after') {
    return `${formattedNumber}${settings.currencySymbol}`
  } else {
    return `${settings.currencySymbol}${formattedNumber}`
  }
}

/**
 * Fetch currency settings from the API
 * @returns Promise with currency settings or defaults
 */
export async function fetchCurrencySettings(): Promise<CurrencySettings> {
  try {
    const response = await fetch('/api/admin/settings/currency')
    const result = await response.json()
    
    if (result.success && result.data) {
      return result.data
    }
    
    return DEFAULT_CURRENCY
  } catch (error) {
    console.error('Error fetching currency settings:', error)
    return DEFAULT_CURRENCY
  }
}

/**
 * Format currency with dynamic settings (async)
 * Fetches settings and formats in one call
 * @param amount - The amount to format
 * @param options - Additional formatting options
 * @returns Promise with formatted currency string
 */
export async function formatCurrencyAsync(
  amount: number | string | null | undefined,
  options?: {
    showSymbol?: boolean
    decimals?: number
  }
): Promise<string> {
  const settings = await fetchCurrencySettings()
  return formatCurrency(amount, settings, options)
}
