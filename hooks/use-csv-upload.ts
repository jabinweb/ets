"use client"

import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"

interface ParsedCSV<T = Record<string, string>> {
  data: T[]
  headers: string[]
  errors: string[]
}

interface CSVUploadOptions<T = Record<string, string>> {
  requiredColumns?: string[]
  skipEmptyRows?: boolean
  transform?: (row: Record<string, string>) => T
  validate?: (row: Record<string, string>, index: number) => string | null
}

export function useCSVUpload<T = Record<string, string>>(options: CSVUploadOptions<T> = {}) {
  const [isUploading, setIsUploading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedCSV<T> | null>(null)
  const { toast } = useToast()

  const parseCSV = (file: File): Promise<ParsedCSV<T>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split('\n').map(line => line.trim()).filter(line => line)
          
          if (lines.length === 0) {
            reject(new Error('CSV file is empty'))
            return
          }

          // Parse headers
          const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
          
          // Validate required columns
          if (options.requiredColumns) {
            const missingColumns = options.requiredColumns.filter(col => 
              !headers.some(header => header.toLowerCase() === col.toLowerCase())
            )
            if (missingColumns.length > 0) {
              reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`))
              return
            }
          }

          const data: T[] = []
          const errors: string[] = []

          // Parse data rows
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i]
            if (!line || (options.skipEmptyRows && !line.trim())) continue

            const values = parseCSVLine(line)
            
            if (values.length !== headers.length) {
              errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`)
              continue
            }

            const row: Record<string, string> = {}
            headers.forEach((header, index) => {
              row[header] = values[index] || ''
            })

            // Validate row if validator provided
            if (options.validate) {
              const validationError = options.validate(row, i)
              if (validationError) {
                errors.push(`Row ${i + 1}: ${validationError}`)
                continue
              }
            }

            // Transform row if transformer provided
            const transformedRow = options.transform ? options.transform(row) : row
            data.push(transformedRow as T)
          }

          resolve({ data, headers, errors })
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file)
    })
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  const uploadCSV = async (file: File) => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please select a CSV file to upload"
      })
      return
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Invalid file type", {
        description: "Please select a CSV file"
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File too large", {
        description: "Please select a file smaller than 10MB"
      })
      return
    }

    setIsUploading(true)
    const toastId = toast.loading("Parsing CSV file...")

    try {
      const result = await parseCSV(file)
      setParsedData(result)
      
      toast.dismiss(toastId)
      
      if (result.errors.length > 0) {
        toast.warning(`CSV parsed with ${result.errors.length} errors`, {
          description: `${result.data.length} valid rows found. Check the preview for details.`
        })
      } else {
        toast.success("CSV parsed successfully", {
          description: `Found ${result.data.length} valid rows`
        })
      }
      
      return result
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse CSV'
      toast.error("CSV parsing failed", {
        description: errorMessage
      })
      setParsedData(null)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const reset = () => {
    setParsedData(null)
    setIsUploading(false)
  }

  const downloadTemplate = (columns: string[], filename: string = 'template.csv') => {
    const csvContent = columns.join(',') + '\n'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    toast.success("Template downloaded", {
      description: `${filename} has been downloaded`
    })
  }

  return {
    isUploading,
    parsedData,
    uploadCSV,
    reset,
    downloadTemplate
  }
}
