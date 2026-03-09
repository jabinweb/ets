"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save,
  X,
  GraduationCap,
  Briefcase,
  Users,
  Heart,
  Settings,
  Camera
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
  
  // Student fields
  studentNumber?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  phone?: string | null
  address?: string | null
  parentName?: string | null
  parentEmail?: string | null
  parentPhone?: string | null
  medicalInfo?: string | null
  previousSchool?: string | null
  class?: {
    name: string
    grade: number
  } | null
  
  // Teacher fields
  qualification?: string | null
  specialization?: string | null
  experience?: number | null
  dateOfJoining?: string | null
  emergencyContact?: string | null
  bio?: string | null
}

export default function ProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile')
        if (!res.ok) throw new Error('Failed to fetch profile')
        
        const data = await res.json()
        if (data.success) {
          setProfile(data.data)
          // Convert null values to empty strings for form inputs
          setFormData({
            ...data.data,
            name: data.data.name ?? '',
            phone: data.data.phone ?? '',
            address: data.data.address ?? '',
            parentName: data.data.parentName ?? '',
            parentEmail: data.data.parentEmail ?? '',
            parentPhone: data.data.parentPhone ?? '',
            medicalInfo: data.data.medicalInfo ?? '',
            previousSchool: data.data.previousSchool ?? '',
            qualification: data.data.qualification ?? '',
            specialization: data.data.specialization ?? '',
            emergencyContact: data.data.emergencyContact ?? '',
            bio: data.data.bio ?? ''
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to update profile')

      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
        setEditing(false)
        toast({
          title: 'Success',
          description: 'Profile updated successfully'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!profile) {
      setFormData({})
      setEditing(false)
      return
    }
    // Convert null values to empty strings for form inputs
    setFormData({
      ...profile,
      name: profile.name ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      parentName: profile.parentName ?? '',
      parentEmail: profile.parentEmail ?? '',
      parentPhone: profile.parentPhone ?? '',
      medicalInfo: profile.medicalInfo ?? '',
      previousSchool: profile.previousSchool ?? '',
      qualification: profile.qualification ?? '',
      specialization: profile.specialization ?? '',
      emergencyContact: profile.emergencyContact ?? '',
      bio: profile.bio ?? ''
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <User className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'TEACHER':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'STUDENT':
        return 'bg-green-500 hover:bg-green-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your personal information</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard/settings" className="flex-1 sm:flex-initial">
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>
          {!editing ? (
            <Button onClick={() => setEditing(true)} size="sm" className="flex-1 sm:flex-initial">
              <Edit className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving} className="flex-1 sm:flex-initial">
                <X className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1 sm:flex-initial">
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Changes'}</span>
                <span className="sm:hidden">{saving ? 'Saving...' : 'Save'}</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              {editing && (
                <button 
                  className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => toast({ title: 'Coming Soon', description: 'Profile picture upload will be available soon' })}
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground text-sm sm:text-base">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {profile.role}
                </Badge>
                {profile.studentNumber && (
                  <Badge variant="outline">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {profile.studentNumber}
                  </Badge>
                )}
                {profile.class && (
                  <Badge variant="outline">
                    {profile.class.name} - Grade {profile.class.grade}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {editing ? (
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-sm py-2">{profile.name || '-'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">{profile.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              {editing ? (
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{profile.phone || '-'}</p>
                </div>
              )}
            </div>

            {profile.dateOfBirth && (
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">
                    {format(new Date(profile.dateOfBirth), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {profile.gender && (
              <div className="space-y-2">
                <Label>Gender</Label>
                <p className="text-sm py-2">{profile.gender}</p>
              </div>
            )}
          </div>

          {(editing || profile.address) && (
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {editing ? (
                <Textarea
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                />
              ) : (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <p className="text-sm">{profile.address || '-'}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Specific Information */}
      {profile.role.toUpperCase() === 'STUDENT' && (
        <>
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                Parent/Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentName">Parent Name</Label>
                  {editing ? (
                    <Input
                      id="parentName"
                      value={formData.parentName || ''}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm py-2">{profile.parentName || '-'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Parent Email</Label>
                  {editing ? (
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail || ''}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{profile.parentEmail || '-'}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentPhone">Parent Phone</Label>
                  {editing ? (
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone || ''}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{profile.parentPhone || '-'}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {(editing || profile.medicalInfo || profile.previousSchool) && (
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.medicalInfo && (
                  <div className="space-y-2">
                    <Label>Medical Information</Label>
                    <p className="text-sm">{profile.medicalInfo}</p>
                  </div>
                )}
                {profile.previousSchool && (
                  <div className="space-y-2">
                    <Label>Previous School</Label>
                    <p className="text-sm">{profile.previousSchool}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Teacher Specific Information */}
      {profile.role.toUpperCase() === 'TEACHER' && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                {editing ? (
                  <Input
                    id="qualification"
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                ) : (
                  <p className="text-sm py-2">{profile.qualification || '-'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                {editing ? (
                  <Input
                    id="specialization"
                    value={formData.specialization || ''}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                ) : (
                  <p className="text-sm py-2">{profile.specialization || '-'}</p>
                )}
              </div>

              {profile.experience !== null && (
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <p className="text-sm py-2">{profile.experience} years</p>
                </div>
              )}

              {profile.dateOfJoining && (
                <div className="space-y-2">
                  <Label>Date of Joining</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(new Date(profile.dateOfJoining), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                {editing ? (
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{profile.emergencyContact || '-'}</p>
                  </div>
                )}
              </div>
            </div>

            {(editing || profile.bio) && (
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {editing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-sm">{profile.bio || '-'}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
