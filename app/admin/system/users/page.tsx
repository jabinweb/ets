"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fadeInUp } from '@/lib/motion'
import { 
  Users, 
  Search, 
  MoreVertical,
  UserPlus,
  Mail,
  Shield,
  Edit,
  Trash2,
  Ban,
  CheckCircle
} from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  status: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
}

interface UserStats {
  total: number
  admins: number
  teachers: number
  students: number
  parents: number
  active: number
  newThisMonth: number
}

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog / form state
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/system/users')
        const data = await response.json()
        
        if (data.users && data.stats) {
          setUsers(data.users)
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // helper to refresh users/stats from system endpoint
  const refreshData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/system/users')
      const data = await response.json()
      if (data.users && data.stats) {
        setUsers(data.users)
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Failed to refresh data', err)
    } finally {
      setLoading(false)
    }
  }

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    try {
      if (editing) {
        const res = await fetch(`/api/admin/users/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, role, password: password || undefined }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err?.error || 'Failed to update')
        }
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, role: role === 'ADMIN' ? 'admin' : role === 'TEACHER' ? 'editor' : 'student', password }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err?.error || 'Failed to create')
        }
      }

      await refreshData()
      setOpen(false)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Operation failed')
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const userStats = [
    { label: "Total Users", value: stats?.total.toString() || "0", icon: Users, color: "text-blue-600" },
    { label: "Active Users", value: stats?.active.toString() || "0", icon: CheckCircle, color: "text-green-600" },
    { label: "Admins", value: stats?.admins.toString() || "0", icon: Shield, color: "text-purple-600" },
    { label: "New This Month", value: stats?.newThisMonth.toString() || "0", icon: UserPlus, color: "text-orange-600" }
  ]

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      TEACHER: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      STUDENT: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    }
    return colors[role as keyof typeof colors] || colors.STUDENT
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              User Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage system users and their access
            </p>
          </div>
          <Button onClick={() => {
            setEditing(null)
            setName('')
            setEmail('')
            setRole('ADMIN')
            setPassword('')
            setOpen(true)
          }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={fadeInUp} 
        initial="initial" 
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {userStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Users Table */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name ? user.name.split(' ').map(n => n[0]).join('') : user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {user.name || 'No Name'}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={user.status === 'active' ? 'text-green-600 border-green-600' : 'text-slate-600 border-slate-600'}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {user.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setEditing(user)
                            setName(user.name || '')
                            setEmail(user.email)
                            setRole(user.role)
                            setPassword('')
                            setOpen(true)
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            <button onClick={async (e) => {
                              e.preventDefault()
                              if (!confirm('Delete this user?')) return
                              try {
                                const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
                                if (res.ok) {
                                  setUsers(prev => prev.filter(u => u.id !== user.id))
                                } else {
                                  const err = await res.json()
                                  alert(err?.error || 'Failed to delete')
                                }
                              } catch (err) {
                                console.error(err)
                                alert('Error deleting user')
                              }
                            }}>Delete User</button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit User' : 'Add User'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2 bg-transparent">
                <option value="ADMIN">Admin</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password {editing ? '(leave blank to keep current)' : ''}</label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
            </div>

            <DialogFooter>
              <Button type="submit">{editing ? 'Save changes' : 'Create user'}</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
