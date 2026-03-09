"use client"

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  School, 
  Palette, 
  Globe, 
  DollarSign, 
  Calendar, 
  Save,
  RefreshCw,
  Eye,
  Upload,
  Info,
} from 'lucide-react'

interface SettingsData {
  schoolName: string
  schoolShortName: string
  schoolTagline: string
  schoolDescription: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  schoolWebsite: string
  adminEmail: string
  currency: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
  timeZone: string
  dateFormat: string
  academicYearStart: string
  academicYearEnd: string
  language: string
  theme: string
  logoUrl?: string
  bannerUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ACA', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
  { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
  { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' }
]

const timeZones = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai',
  'Australia/Sydney', 'Pacific/Auckland'
]

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
]
export default function AdminSettingsPage() {

  const [settings, setSettings] = useState<SettingsData>({
    schoolName: '',
    schoolShortName: '',
    schoolTagline: '',
    schoolDescription: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolWebsite: '',
    adminEmail: '',
    currency: 'USD',
    currencySymbol: '$',
    currencyPosition: 'before',
    timeZone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    academicYearStart: '',
    academicYearEnd: '',
    language: 'en',
    theme: 'system',
    primaryColor: '#1E40AF',
    secondaryColor: '#64748B',
    accentColor: '#059669'
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      const result = await response.json()
      
      if (result.success && result.data) {
        setSettings(result.data)
      } else {
        toast.error("Failed to load settings")
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    const toastId = toast.loading("Saving settings...")

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Settings saved successfully!", {
          description: "Changes have been applied to the system"
        })
      } else {
        throw new Error(result.error || 'Failed to save settings')
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings'
      toast.error("Save failed", {
        description: errorMessage
      })
    }}

  const handleInputChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleCurrencyChange = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode)
    if (currency) {
      setSettings(prev => ({
        ...prev,
        currency: currency.code,
        currencySymbol: currency.symbol
      }))
    }
  }

  const formatCurrencyPreview = (amount: number) => {
    const { currencySymbol, currencyPosition } = settings
    return currencyPosition === 'before' 
      ? `${currencySymbol}${amount.toFixed(2)}`
      : `${amount.toFixed(2)}${currencySymbol}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            School Settings
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Configure your school management system preferences
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" onClick={fetchSettings} disabled={loading} size="sm" className="sm:h-10">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm" className="sm:h-10">
            <Save className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Settings'}</span>
            <span className="sm:hidden">{saving ? 'Save...' : 'Save'}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="general" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
            <School className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden text-[10px]">General</span>
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Currency</span>
            <span className="sm:hidden text-[10px]">Money</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Academic</span>
            <span className="sm:hidden text-[10px]">Academic</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Localization</span>
            <span className="sm:hidden text-[10px]">Region</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
            <span className="sm:hidden text-[10px]">Theme</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="schoolName">School Name *</Label>
                  <Input
                    id="schoolName"
                    value={settings.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolShortName">Short Name *</Label>
                  <Input
                    id="schoolShortName"
                    value={settings.schoolShortName}
                    onChange={(e) => handleInputChange('schoolShortName', e.target.value)}
                    placeholder="e.g., ACA"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="schoolTagline">Tagline</Label>
                  <Input
                    id="schoolTagline"
                    value={settings.schoolTagline}
                    onChange={(e) => handleInputChange('schoolTagline', e.target.value)}
                    placeholder="School motto or tagline"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="schoolDescription">Description</Label>
                  <Textarea
                    id="schoolDescription"
                    value={settings.schoolDescription}
                    onChange={(e) => handleInputChange('schoolDescription', e.target.value)}
                    placeholder="Brief description of your school"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="schoolAddress">Address</Label>
                  <Textarea
                    id="schoolAddress"
                    value={settings.schoolAddress}
                    onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
                    placeholder="Complete school address"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="schoolPhone">Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={settings.schoolPhone}
                    onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolEmail">School Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={settings.schoolEmail}
                    onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
                    placeholder="info@school.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="schoolWebsite">Website</Label>
                  <Input
                    id="schoolWebsite"
                    value={settings.schoolWebsite}
                    onChange={(e) => handleInputChange('schoolWebsite', e.target.value)}
                    placeholder="https://school.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                    placeholder="admin@school.edu"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Currency Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center justify-between w-full">
                            <span>{currency.code} - {currency.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {currency.symbol}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                    placeholder="$"
                  />
                </div>
                <div>
                  <Label htmlFor="currencyPosition">Symbol Position</Label>
                  <Select 
                    value={settings.currencyPosition} 
                    onValueChange={(value) => handleInputChange('currencyPosition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before amount ({settings.currencySymbol}100.00)</SelectItem>
                      <SelectItem value="after">After amount (100.00{settings.currencySymbol})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preview</Label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md border">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">Sample amounts:</span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div>Tuition Fee: {formatCurrencyPreview(2500)}</div>
                      <div>Library Fee: {formatCurrencyPreview(50)}</div>
                      <div>Total: {formatCurrencyPreview(2550)}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Currency Settings Impact</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                      <li>• All fee amounts and financial reports will display in this currency</li>
                      <li>• Payment forms and invoices will use the selected symbol and position</li>
                      <li>• Historical data will maintain original currency but display in new format</li>
                      <li>• Changes take effect immediately across the entire system</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Settings */}
        <TabsContent value="academic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Year Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="academicYearStart">Academic Year Start</Label>
                  <Input
                    id="academicYearStart"
                    type="date"
                    value={settings.academicYearStart}
                    onChange={(e) => handleInputChange('academicYearStart', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="academicYearEnd">Academic Year End</Label>
                  <Input
                    id="academicYearEnd"
                    type="date"
                    value={settings.academicYearEnd}
                    onChange={(e) => handleInputChange('academicYearEnd', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select 
                    value={settings.dateFormat} 
                    onValueChange={(value) => handleInputChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/dd/yyyy (US Format)</SelectItem>
                      <SelectItem value="dd/MM/yyyy">dd/MM/yyyy (UK Format)</SelectItem>
                      <SelectItem value="yyyy-MM-dd">yyyy-MM-dd (ISO Format)</SelectItem>
                      <SelectItem value="dd-MM-yyyy">dd-MM-yyyy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Localization Settings */}
        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeZone">Time Zone</Label>
                  <Select 
                    value={settings.timeZone} 
                    onValueChange={(value) => handleInputChange('timeZone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeZones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      placeholder="#1E40AF"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      placeholder="#64748B"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      placeholder="#059669"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="theme">Default Theme</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => handleInputChange('theme', value)}
                >
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="system">System Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logo and Banner Upload placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <Label>School Logo</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 md:p-6 text-center">
                    <Upload className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs md:text-sm text-slate-600">Logo upload coming soon</p>
                  </div>
                </div>
                <div>
                  <Label>Banner Image</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 md:p-6 text-center">
                    <Upload className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-xs md:text-sm text-slate-600">Banner upload coming soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
