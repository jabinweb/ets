"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { 
  BookOpen,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Upload,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  BookMarked,
  Users,
  Library as LibraryIcon
} from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  copies: number
  available: number
  status: 'available' | 'limited' | 'unavailable'
  publisher: string
  publishYear: number
  addedDate: string
}

interface BorrowRecord {
  id: string
  bookTitle: string
  borrower: string
  borrowerType: 'student' | 'teacher'
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: 'borrowed' | 'returned' | 'overdue'
}

interface LibraryStats {
  totalBooks: number
  totalCopies: number
  borrowedBooks: number
  availableBooks: number
  overdueBooks: number
  activeMembers: number
}

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([])
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchLibraryData()
  }, [])

  const fetchLibraryData = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockBooks: Book[] = [
        {
          id: '1',
          title: 'Introduction to Computer Science',
          author: 'John Smith',
          isbn: '978-0-123456-78-9',
          category: 'Technology',
          copies: 5,
          available: 3,
          status: 'available',
          publisher: 'Tech Books Publishing',
          publishYear: 2023,
          addedDate: '2024-01-15'
        },
        {
          id: '2',
          title: 'World History: Modern Era',
          author: 'Sarah Johnson',
          isbn: '978-0-987654-32-1',
          category: 'History',
          copies: 8,
          available: 2,
          status: 'limited',
          publisher: 'Historical Press',
          publishYear: 2022,
          addedDate: '2024-02-10'
        },
        {
          id: '3',
          title: 'Advanced Mathematics',
          author: 'Dr. Robert Brown',
          isbn: '978-0-456789-12-3',
          category: 'Mathematics',
          copies: 6,
          available: 0,
          status: 'unavailable',
          publisher: 'Math Education Inc',
          publishYear: 2023,
          addedDate: '2024-01-20'
        },
        {
          id: '4',
          title: 'English Literature Classics',
          author: 'Emily White',
          isbn: '978-0-234567-89-0',
          category: 'Literature',
          copies: 10,
          available: 7,
          status: 'available',
          publisher: 'Classic Books Ltd',
          publishYear: 2021,
          addedDate: '2023-12-05'
        }
      ]

      const mockBorrowRecords: BorrowRecord[] = [
        {
          id: '1',
          bookTitle: 'Introduction to Computer Science',
          borrower: 'Alice Johnson',
          borrowerType: 'student',
          borrowDate: '2024-10-28',
          dueDate: '2024-11-11',
          returnDate: null,
          status: 'borrowed'
        },
        {
          id: '2',
          bookTitle: 'World History: Modern Era',
          borrower: 'Bob Smith',
          borrowerType: 'teacher',
          borrowDate: '2024-10-20',
          dueDate: '2024-11-03',
          returnDate: null,
          status: 'overdue'
        },
        {
          id: '3',
          bookTitle: 'English Literature Classics',
          borrower: 'Carol Davis',
          borrowerType: 'student',
          borrowDate: '2024-10-25',
          dueDate: '2024-11-08',
          returnDate: '2024-11-02',
          status: 'returned'
        }
      ]

      const mockStats: LibraryStats = {
        totalBooks: 24,
        totalCopies: 125,
        borrowedBooks: 18,
        availableBooks: 107,
        overdueBooks: 3,
        activeMembers: 156
      }

      setBooks(mockBooks)
      setBorrowRecords(mockBorrowRecords)
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to fetch library data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn.includes(searchQuery)
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || book.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = {
      available: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
      limited: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400", icon: AlertCircle },
      unavailable: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: AlertCircle },
      borrowed: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", icon: Clock },
      returned: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400", icon: CheckCircle },
      overdue: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400", icon: AlertCircle }
    }
    const { color, icon: Icon } = config[status as keyof typeof config]
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Library Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage books, borrowing records, and library resources
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Books
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
      >
        {stats && [
          { label: "Total Books", value: stats.totalBooks, icon: BookOpen, color: "text-blue-600" },
          { label: "Total Copies", value: stats.totalCopies, icon: LibraryIcon, color: "text-purple-600" },
          { label: "Borrowed", value: stats.borrowedBooks, icon: BookMarked, color: "text-orange-600" },
          { label: "Available", value: stats.availableBooks, icon: CheckCircle, color: "text-green-600" },
          { label: "Overdue", value: stats.overdueBooks, icon: AlertCircle, color: "text-red-600" },
          { label: "Members", value: stats.activeMembers, icon: Users, color: "text-indigo-600" }
        ].map((stat, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card>
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
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} initial="initial" animate="animate">
        <Tabs defaultValue="books" className="w-full">
          <TabsList>
            <TabsTrigger value="books">
              <BookOpen className="h-4 w-4 mr-2" />
              Books
            </TabsTrigger>
            <TabsTrigger value="borrowed">
              <BookMarked className="h-4 w-4 mr-2" />
              Borrowed Books
            </TabsTrigger>
            <TabsTrigger value="overdue">
              <AlertCircle className="h-4 w-4 mr-2" />
              Overdue
            </TabsTrigger>
          </TabsList>

          {/* Books Tab */}
          <TabsContent value="books" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Book Collection</CardTitle>
                    <CardDescription>Manage your library&apos;s book inventory</CardDescription>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search books..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Literature">Literature</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>ISBN</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Copies</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {book.title}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {book.publisher} ({book.publishYear})
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {book.author}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 font-mono text-sm">
                          {book.isbn}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{book.category}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-white font-medium">
                          {book.copies}
                        </TableCell>
                        <TableCell className="text-slate-900 dark:text-white font-medium">
                          {book.available}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(book.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Book
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookMarked className="h-4 w-4 mr-2" />
                                Borrow History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Book
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
          </TabsContent>

          {/* Borrowed Books Tab */}
          <TabsContent value="borrowed" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Borrowed Books</CardTitle>
                <CardDescription>Track currently borrowed books</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Borrow Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowRecords.filter(r => r.status === 'borrowed' || r.status === 'overdue').map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {record.bookTitle}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {record.borrower}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {record.borrowerType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {new Date(record.borrowDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {new Date(record.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm">Mark Returned</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overdue Tab */}
          <TabsContent value="overdue" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Overdue Books</CardTitle>
                <CardDescription>Books that are past their due date</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book Title</TableHead>
                      <TableHead>Borrower</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowRecords.filter(r => r.status === 'overdue').map((record) => {
                      const daysOverdue = Math.floor((new Date().getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium text-slate-900 dark:text-white">
                            {record.bookTitle}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {record.borrower}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {record.borrowerType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-red-600">
                            {new Date(record.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              {daysOverdue} days
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline">Send Reminder</Button>
                              <Button size="sm">Mark Returned</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
