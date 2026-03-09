'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/FileUpload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  Image as ImageIcon,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  folder: string;
  filename: string;
  size: number;
  modified: number;
  url: string;
}

export default function FileManagerPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder] = useState('aca'); // ACA seminary folder
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const isAdmin = user && userRole === 'ADMIN';
  const isLoadingAuth = status === 'loading' || (user && userRole === null);

  useEffect(() => {
    if (!isLoadingAuth && user && userRole !== 'ADMIN') {
      window.location.href = '/';
      return;
    }

    if (isAdmin) {
      fetchFiles();
    }
  }, [isAdmin, isLoadingAuth, user, userRole]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_PHP_UPLOAD_URL?.replace('upload.php', 'manage.php')}?folder=${selectedFolder}`;

      const response = await fetch(url!, {
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_FILE_API_KEY || ''
        }
      });

      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      } else {
        toast.error('Failed to load files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Error loading files');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (folder: string, filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;

    setDeleting(`${folder}/${filename}`);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_PHP_UPLOAD_URL?.replace('upload.php', 'manage.php')!,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_FILE_API_KEY || ''
          },
          body: JSON.stringify({ folder, filename })
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('File deleted');
        fetchFiles();
      } else {
        toast.error(data.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Error deleting file');
    } finally {
      setDeleting(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    }
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">File Manager</h1>
            <p className="text-gray-600 mt-1">
              Manage files for North India Baptist Seminary
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowUpload(!showUpload)} variant={showUpload ? "secondary" : "default"}>
              {showUpload ? 'Hide Upload' : 'Upload Files'}
            </Button>
            <Button onClick={fetchFiles} disabled={loading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                folder={selectedFolder}
                multiple={true}
                onUploadComplete={() => {
                  fetchFiles();
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{files.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Folder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{selectedFolder}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Latest Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {files.length > 0
                  ? new Date(Math.max(...files.map(f => f.modified)) * 1000).toLocaleDateString()
                  : 'N/A'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        {/* Files Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Files ({filteredFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Loading files...
                      </TableCell>
                    </TableRow>
                  ) : filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No files found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFiles.map((file) => (
                      <TableRow key={`${file.folder}/${file.filename}`}>
                        <TableCell>
                          {getFileIcon(file.filename)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {file.filename}
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(file.modified)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={file.url} download>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFile(file.folder, file.filename)}
                              disabled={deleting === `${file.folder}/${file.filename}`}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}