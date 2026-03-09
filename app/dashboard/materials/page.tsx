import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { 
  File, PlusCircle, Search, Download, ExternalLink, 
  FileText, FileImage, Video, FileSpreadsheet, 
  Share2, MoreHorizontal, Trash2 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define proper types for the material object
interface Material {
  id: string;
  title: string;
  subjectId: string;
  type: string;
  size: string;
  uploadedAt: string;
  downloads: number;
  shared: boolean;
}

export default async function LearningMaterialsPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/auth/signin")
  }

  if (session.user?.role !== "TEACHER") {
    redirect("/dashboard")
  }
  
  // Mock data for subjects
  const subjects = [
    { id: "1", name: "Mathematics", code: "MATH" },
    { id: "2", name: "English", code: "ENG" },
    { id: "3", name: "Science", code: "SCI" }
  ]
  
  // Mock data for materials
  const materials = [
    {
      id: "1",
      title: "Algebra Fundamentals Handout",
      subjectId: "1",
      type: "pdf",
      size: "2.3 MB",
      uploadedAt: "2023-11-01",
      downloads: 45,
      shared: true
    },
    {
      id: "2",
      title: "Geometry Formula Sheet",
      subjectId: "1",
      type: "pdf",
      size: "1.8 MB",
      uploadedAt: "2023-11-05",
      downloads: 32,
      shared: true
    },
    {
      id: "3",
      title: "Writing Structure Guidelines",
      subjectId: "2",
      type: "docx",
      size: "1.2 MB",
      uploadedAt: "2023-10-28",
      downloads: 27,
      shared: true
    },
    {
      id: "4",
      title: "Grammar Exercises",
      subjectId: "2",
      type: "xlsx",
      size: "0.9 MB",
      uploadedAt: "2023-10-30",
      downloads: 18,
      shared: false
    },
    {
      id: "5",
      title: "Cellular Structure Video",
      subjectId: "3",
      type: "mp4",
      size: "45.6 MB",
      uploadedAt: "2023-11-02",
      downloads: 36,
      shared: true
    },
    {
      id: "6",
      title: "Chemical Reactions Presentation",
      subjectId: "3",
      type: "pptx",
      size: "5.2 MB",
      uploadedAt: "2023-11-08",
      downloads: 21,
      shared: false
    },
  ]
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Materials</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Upload and manage learning materials for your subjects
          </p>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/materials/upload">
            <PlusCircle className="h-4 w-4 mr-2" />
            Upload Material
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input placeholder="Search materials..." className="pl-10" />
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Materials</TabsTrigger>
          {subjects.map(subject => (
            <TabsTrigger key={subject.id} value={subject.id}>
              {subject.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map(material => (
              <MaterialCard 
                key={material.id} 
                material={material} 
                subject={subjects.find(s => s.id === material.subjectId)?.name || ''} 
              />
            ))}
          </div>
        </TabsContent>
        
        {subjects.map(subject => (
          <TabsContent key={subject.id} value={subject.id} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials
                .filter(m => m.subjectId === subject.id)
                .map(material => (
                  <MaterialCard 
                    key={material.id} 
                    material={material} 
                    subject={subject.name} 
                  />
                ))
              }
              
              {materials.filter(m => m.subjectId === subject.id).length === 0 && (
                <div className="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium">No Materials</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    You haven&apos;t uploaded any materials for this subject yet.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/materials/upload">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Upload Material
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function MaterialCard({ material, subject }: { material: Material, subject: string }) {
  const fileIcon = getFileIcon(material.type)
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 flex flex-row justify-between items-start">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md ${getFileColor(material.type)}`}>
            {fileIcon}
          </div>
          <div>
            <CardTitle className="text-base">{material.title}</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subject}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              {material.shared ? 'Manage Access' : 'Share'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{material.type.toUpperCase()} • {material.size}</span>
          <div className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs">
            {material.downloads} downloads
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/materials/${material.id}`}>
            View
          </Link>
        </Button>
        <Button variant="secondary" size="sm">
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-white" />
    case 'docx':
    case 'doc':
      return <FileText className="h-5 w-5 text-white" />
    case 'xlsx':
    case 'xls':
      return <FileSpreadsheet className="h-5 w-5 text-white" />
    case 'jpg':
    case 'png':
      return <FileImage className="h-5 w-5 text-white" />
    case 'mp4':
    case 'mov':
      return <Video className="h-5 w-5 text-white" />
    default:
      return <File className="h-5 w-5 text-white" />
  }
}

function getFileColor(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'bg-red-500'
    case 'docx':
    case 'doc':
      return 'bg-blue-500'
    case 'xlsx':
    case 'xls':
      return 'bg-green-500'
    case 'jpg':
    case 'png':
      return 'bg-purple-500'
    case 'mp4':
    case 'mov':
      return 'bg-orange-500'
    case 'pptx':
    case 'ppt':
      return 'bg-amber-500'
    default:
      return 'bg-slate-500'
  }
}

