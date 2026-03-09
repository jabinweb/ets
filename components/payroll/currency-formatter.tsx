"use client"

import { useEffect, useState } from 'react'

interface CurrencyFormatterProps {
  amount: number | string | null | undefined
  className?: string
}

interface SchoolSettings {
  currencySymbol: string
  currencyPosition: 'before' | 'after'
}

export function CurrencyFormatter({ amount, className }: CurrencyFormatterProps) {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/school/settings')
        const result = await response.json()
        
        if (result.success) {
          setSettings(result.data)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const formatCurrency = (amount: number | string | null | undefined) => {
    // Convert to number and handle edge cases
    const numAmount = typeof amount === 'number' ? amount : 
                     typeof amount === 'string' ? parseFloat(amount) : 0
    
    // Handle NaN or invalid numbers
    const validAmount = isNaN(numAmount) ? 0 : numAmount

    if (!settings) {
      return `$${validAmount.toFixed(2)}`
    }

    const formatted = validAmount.toFixed(2)
    return settings.currencyPosition === 'before' 
      ? `${settings.currencySymbol}${formatted}`
      : `${formatted}${settings.currencySymbol}`
  }

  return (
    <span className={className}>
      {formatCurrency(amount)}
    </span>
  )
}
