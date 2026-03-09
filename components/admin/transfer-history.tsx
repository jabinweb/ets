"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowRight, Calendar, User, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

interface Transfer {
  id: string
  type: string
  status: string
  reason: string | null
  effectiveDate: string
  requestedDate: string
  completedDate: string | null
  isExternalTransfer: boolean
  externalSchoolName: string | null
  student: {
    id: string
    name: string | null
    email: string
    studentNumber: string | null
  }
  fromClass: {
    id: string
    name: string
    grade: number
  } | null
  toClass: {
    id: string
    name: string
    grade: number
  } | null
  requestedBy: {
    id: string
    name: string | null
    email: string
  }
  approvedBy: {
    id: string
    name: string | null
    email: string
  } | null
}

interface TransferHistoryProps {
  initialStudentId?: string
}

export function TransferHistory({ initialStudentId }: TransferHistoryProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchTransfers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })
      
      if (initialStudentId) {
        params.append("studentId", initialStudentId)
      }
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/admin/students/transfer?${params}`)
      if (!response.ok) throw new Error("Failed to fetch transfers")
      
      const data = await response.json()
      setTransfers(data.transfers)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching transfers:", error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, offset, initialStudentId])

  useEffect(() => {
    fetchTransfers()
  }, [fetchTransfers])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
      case "APPROVED":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approved</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      CLASS_CHANGE: "Class Change",
      SECTION_CHANGE: "Section Change",
      SCHOOL_TRANSFER_OUT: "Transfer Out",
      SCHOOL_TRANSFER_IN: "Transfer In",
      EMERGENCY: "Emergency",
      ADMINISTRATIVE: "Administrative"
    }
    
    const isExternal = type === "SCHOOL_TRANSFER_OUT" || type === "SCHOOL_TRANSFER_IN"
    
    return (
      <Badge variant="outline" className={isExternal ? "bg-purple-50 text-purple-700 border-purple-200" : ""}>
        {typeLabels[type] || type}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transfer History</CardTitle>
            <CardDescription>
              View all student transfer records and their status
            </CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No transfer records found</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Transfer Details</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {format(new Date(transfer.effectiveDate), "MMM dd, yyyy")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Requested: {format(new Date(transfer.requestedDate), "MMM dd")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{transfer.student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {transfer.student.studentNumber || "No ID"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transfer.isExternalTransfer ? (
                            <>
                              {transfer.fromClass ? (
                                <Badge variant="outline">{transfer.fromClass.name}</Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not Assigned</span>
                              )}
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                                {transfer.externalSchoolName || "External School"}
                              </Badge>
                            </>
                          ) : transfer.fromClass ? (
                            <>
                              <Badge variant="outline">{transfer.fromClass.name}</Badge>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="outline">{transfer.toClass?.name}</Badge>
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-muted-foreground">New Assignment</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="outline">{transfer.toClass?.name}</Badge>
                            </>
                          )}
                        </div>
                        {transfer.reason && (
                          <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                            {transfer.reason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getTypeBadge(transfer.type)}</TableCell>
                      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{transfer.requestedBy.name || "Admin"}</div>
                          {transfer.approvedBy && (
                            <div className="text-xs text-muted-foreground">
                              Approved by: {transfer.approvedBy.name || "Admin"}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} transfers
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= total}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
