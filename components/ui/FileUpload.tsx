'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  folder?: string; // Website/project folder name
  multiple?: boolean;
}

export function FileUpload({
  onUploadComplete,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  maxSizeMB = 10,
  label = 'Upload File',
  folder = 'aca', // Default folder for ACA
  multiple = false
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: File[]) => {
    let successFiles: UploadedFile[] = [];
    setUploading(true);

    for (const file of files) {
      console.log('Starting upload for file:', file.name, 'Type:', file.type, 'Size:', file.size);

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast.error(`File ${file.name} too large. Maximum size: ${maxSizeMB}MB`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        console.log(`Sending request for ${file.name}`);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        successFiles.push(data);
        console.log('Upload successful for:', file.name);
      } catch (error) {
        console.error('Upload error for:', file.name, error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (successFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...successFiles]);
      toast.success(`${successFiles.length} file(s) uploaded successfully!`);
      onUploadComplete?.(successFiles);
    }
    setUploading(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    await uploadFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast.error('Only single file upload is allowed');
      await uploadFiles([files[0]]);
      return;
    }

    await uploadFiles(files);
  };

  const handleRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        multiple={multiple}
      />

      {/* Show Dropzone when multiple or no files uploaded */}
      {(multiple || uploadedFiles.length === 0) && (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100'
            }`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            {uploading ? (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                <p className="text-base font-medium text-gray-700">Uploading...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait</p>
              </>
            ) : (
              <>
                <Upload className={`w-16 h-16 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-base font-semibold text-gray-700 mb-2">{label}</p>
                <p className="text-sm text-gray-500 mb-1">
                  Click to browse or drag and drop{multiple ? ' (multiple files supported)' : ''}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Max size: {maxSizeMB}MB per file
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <Card key={`${file.filename}-${index}`} className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg">
                    {getFileIcon(file.type || '')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.filename}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View file
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}