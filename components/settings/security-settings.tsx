"use client"

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key,
  AlertTriangle,
  CheckCircle,
  LogOut
} from 'lucide-react'

export function SecuritySettings() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))

    // Calculate password strength for new password
    if (field === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return Math.min(strength, 100)
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 25) return 'bg-red-500'
    if (strength < 50) return 'bg-orange-500'
    if (strength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength < 25) return 'Very Weak'
    if (strength < 50) return 'Weak'
    if (strength < 75) return 'Medium'
    return 'Strong'
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both password fields match"
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters long"
      })
      return
    }

    setIsLoading(true)
    const toastId = toast.loading("Updating password...")

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Password updated successfully!", {
          description: "You will be signed out for security"
        })
        
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Sign out after password change for security
        setTimeout(() => {
          signOut({ callbackUrl: '/auth/signin' })
        }, 2000)
      } else {
        throw new Error(result.error || 'Failed to update password')
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Failed to update password", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!session?.user?.email) return

    const toastId = toast.loading("Sending reset email...")

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.dismiss(toastId)
        toast.success("Reset email sent!", {
          description: "Check your email for password reset instructions"
        })
      } else {
        throw new Error(result.error || 'Failed to send reset email')
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error("Failed to send reset email", {
        description: error instanceof Error ? error.message : "Please try again"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {passwordData.newPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Password Strength:</span>
                    <span className={`font-medium ${
                      passwordStrength < 50 ? 'text-red-600' : 
                      passwordStrength < 75 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Passwords don&apos;t match
                </p>
              )}
              
              {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Passwords match
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword || !passwordData.currentPassword}
              >
                <Shield className="h-4 w-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Reset Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Reset Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              If you&apos;ve forgotten your current password, you can request a password reset email.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            onClick={handleForgotPassword}
            className="w-full"
          >
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Sign out all devices</h4>
              <p className="text-sm text-muted-foreground">
                Sign out of all devices except this one for security
              </p>
            </div>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out All
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Last signed in:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Account status:</strong> Active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
