"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Image as ImageIcon, Search, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRef } from "react"

interface MediaItem {
    id: string
    url: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    createdAt: string
}

interface MediaPickerProps {
    onSelect: (url: string) => void
    selectedUrl?: string
    folder?: string
}

export function MediaPicker({ onSelect, selectedUrl, folder = "all" }: MediaPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [media, setMedia] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const filteredMedia = media.filter(item =>
        item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.filename.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        if (isOpen) {
            fetchMedia()
        }
    }, [isOpen])

    const fetchMedia = async () => {
        try {
            setLoading(true)
            console.log('Fetching media from folder:', folder)
            const response = await fetch(`/api/files?folder=${folder}&limit=100`)
            console.log('Media fetch response:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('Media data received:', data)
                const imageFiles = (data.files || []).filter((file: MediaItem) =>
                    file.mimeType.startsWith('image/')
                )
                console.log('Filtered image files:', imageFiles.length)
                setMedia(imageFiles)
            } else {
                console.error('Failed to fetch media:', response.status)
            }
        } catch (error) {
            console.error('Failed to load media:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (fileOrEvent: React.ChangeEvent<HTMLInputElement> | File) => {
        let file: File | undefined

        if ('target' in fileOrEvent) {
            file = fileOrEvent.target.files?.[0]
        } else {
            file = fileOrEvent
        }

        if (!file) return

        console.log('File processing:', file.name, file.type, file.size)

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB')
            return
        }

        try {
            setUploading(true)
            setUploadProgress(10)

            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', folder === 'all' ? 'images' : folder)
            formData.append('isPublic', 'true')
            formData.append('description', `Image uploaded from media picker`)

            console.log('Uploading to /api/files...')
            setUploadProgress(30)

            const response = await fetch('/api/files', {
                method: 'POST',
                body: formData
            })

            console.log('Upload response:', response.status)
            setUploadProgress(70)

            if (response.ok) {
                const newMedia = await response.json()
                console.log('Upload successful:', newMedia)
                setUploadProgress(90)

                // Refresh media list
                await fetchMedia()

                // Select the new image
                onSelect(newMedia.url)
                setIsOpen(false)
                setUploadProgress(100)
                alert('Image uploaded successfully!')
            } else {
                const error = await response.json()
                console.error('Upload failed:', error)
                throw new Error(error.error || 'Upload failed')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert(error instanceof Error ? error.message : 'Failed to upload image')
        } finally {
            setUploading(false)
            setUploadProgress(0)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file) {
            await handleFileUpload(file)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-[var(--color-bg-secondary)] border-[var(--color-brand-primary)]/20 hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:border-[var(--color-brand-primary)]"
                >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {selectedUrl ? 'Change Image' : 'Browse Media'}
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-hidden flex flex-col bg-[var(--color-bg-primary)] border border-[var(--color-brand-primary)]/20">
                <DialogHeader className="pb-4 border-b border-[var(--color-brand-primary)]/10">
                    <DialogTitle className="text-lg sm:text-xl text-[var(--color-text-primary)]">Media Library</DialogTitle>
                    <DialogDescription className="text-sm text-[var(--color-text-secondary)]">
                        Select an image or upload a new one
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col space-y-4 pt-4">
                    {/* Upload Section */}
                    <div
                        className={`border-2 border-dashed transition-all duration-200 rounded-lg p-3 sm:p-6 cursor-pointer ${isDragging
                                ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 scale-[1.01]'
                                : 'border-[var(--color-brand-primary)]/30 bg-[var(--color-bg-secondary)] hover:border-[var(--color-brand-primary)]/50'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center pointer-events-none">
                            {uploading ? (
                                <div className="space-y-3">
                                    <Loader2 className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-[var(--color-brand-primary)] animate-spin" />
                                    <div className="space-y-2">
                                        <p className="text-sm sm:text-base font-medium text-[var(--color-text-primary)]">Uploading...</p>
                                        <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2 max-w-xs mx-auto">
                                            <div
                                                className="bg-[var(--color-brand-primary)] h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-[var(--color-text-secondary)]">{uploadProgress}%</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className={`mx-auto h-8 w-8 sm:h-10 sm:w-10 mb-3 transition-colors ${isDragging ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-brand-primary)]/60'
                                        }`} />
                                    <div className="space-y-2">
                                        <p className="text-sm sm:text-base font-medium text-[var(--color-text-primary)]">
                                            {isDragging ? 'Drop to upload' : 'Upload new image'}
                                        </p>
                                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                                            Supports JPG, PNG, WebP, SVG up to 10MB
                                        </p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        disabled={uploading}
                                        className="w-full sm:w-auto mt-4 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-600)] text-[var(--color-button-text)] pointer-events-auto"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        Choose File
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
                        <Input
                            placeholder="Search images by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-[var(--color-bg-secondary)] border-[var(--color-brand-primary)]/20 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-brand-primary)] focus:ring-[var(--color-brand-primary)]"
                        />
                    </div>

                    {/* Media Grid */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-[var(--color-bg-tertiary)] animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : filteredMedia.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                                {filteredMedia.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`cursor-pointer transition-all hover:shadow-lg rounded-lg overflow-hidden border-2 ${selectedUrl === item.url
                                                ? 'border-[var(--color-brand-primary)] ring-2 ring-[var(--color-brand-primary)]/20 shadow-[0_0_0_1px_var(--color-brand-primary)]'
                                                : 'border-[var(--color-brand-primary)]/10 hover:border-[var(--color-brand-primary)]/40'
                                            } bg-[var(--color-bg-secondary)]`}
                                        onClick={() => {
                                            onSelect(item.url)
                                            setIsOpen(false)
                                        }}
                                    >
                                        <div className="aspect-square relative bg-[var(--color-bg-tertiary)]">
                                            <Image
                                                src={item.url}
                                                alt={item.originalName}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none'
                                                }}
                                            />
                                        </div>
                                        <div className="p-2 bg-[var(--color-bg-primary)]">
                                            <p className="text-xs font-medium truncate text-[var(--color-text-primary)]" title={item.originalName}>
                                                {item.originalName}
                                            </p>
                                            <p className="text-xs text-[var(--color-text-tertiary)]">
                                                {(item.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 sm:py-16">
                                <ImageIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-[var(--color-text-tertiary)] mb-4" />
                                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] font-medium">
                                    {searchTerm ? 'No images found' : 'No images uploaded yet'}
                                </p>
                                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                                    {searchTerm ? 'Try a different search term' : 'Upload your first image to get started'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}