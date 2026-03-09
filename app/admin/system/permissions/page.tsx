"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { fadeInUp } from '@/lib/motion'
import { Shield, Users, Plus, Edit, CheckCircle } from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  userCount: number
  color: string
  permissions: Record<string, { view: boolean; edit: boolean; delete: boolean }>
}

interface Category {
  id: string
  name: string
  permissions: string[]
}

export default function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/admin/system/permissions')
        const data = await response.json()
        
        if (data.roles && data.categories) {
          setRoles(data.roles)
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

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

  const getRoleColor = (color: string) => {
    const colors: Record<string, string> = {
      purple: 'text-purple-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      red: 'text-red-600'
    }
    return colors[color] || 'text-slate-600'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Roles & Permissions
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Configure user roles and access permissions
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>
      </motion.div>

      {/* Roles Grid */}
      <motion.div 
        variants={fadeInUp} 
        initial="initial" 
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Shield className={`h-8 w-8 ${getRoleColor(role.color)}`} />
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{role.name}</CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{role.userCount} users</span>
                </div>
                <Badge variant="outline">{role.userCount}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Permissions Matrix */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>Configure permissions for each role</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {categories.map((category) => (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger className="text-left font-semibold">
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Permission</TableHead>
                          {roles.map((role) => (
                            <TableHead key={role.id} className="text-center">
                              {role.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.permissions.map((permissionKey) => {
                          const permissionName = permissionKey.charAt(0).toUpperCase() + permissionKey.slice(1).replace(/([A-Z])/g, ' $1')
                          
                          return (
                            <TableRow key={permissionKey}>
                              <TableCell className="font-medium">
                                {permissionName}
                              </TableCell>
                              {roles.map((role) => {
                                const perm = role.permissions[permissionKey]
                                if (!perm) return (
                                  <TableCell key={role.id} className="text-center">-</TableCell>
                                )
                                
                                return (
                                  <TableCell key={role.id} className="text-center">
                                    <div className="flex flex-col gap-1 items-center">
                                      {perm.view && <Badge variant="outline" className="text-xs">View</Badge>}
                                      {perm.edit && <Badge variant="outline" className="text-xs">Edit</Badge>}
                                      {perm.delete && <Badge variant="outline" className="text-xs">Delete</Badge>}
                                    </div>
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <div className="flex justify-end gap-4">
          <Button variant="outline">
            Cancel
          </Button>
          <Button>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
