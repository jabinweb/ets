import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'default';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Forward the file to your Hostinger PHP endpoint
    const phpUploadUrl = process.env.NEXT_PUBLIC_PHP_UPLOAD_URL || 'https://files.jabin.org/api/upload.php';
    
    const phpFormData = new FormData();
    phpFormData.append('file', file);
    phpFormData.append('folder', folder); // Add folder parameter

    const response = await fetch(phpUploadUrl, {
      method: 'POST',
      body: phpFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Upload failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}