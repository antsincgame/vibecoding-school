export type ImageType = 'courses' | 'blog' | 'student-works' | 'general';

export async function uploadImage(file: File, type: ImageType = 'general'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  const response = await fetch(`${window.location.origin}/functions/v1/upload-image`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.details || error.error || 'Failed to upload image');
  }
  const data = await response.json();
  if (!data.url) throw new Error('No URL returned');
  return data.url;
}

export async function uploadStudentWorkImage(file: File): Promise<string> { return uploadImage(file, 'student-works'); }
export async function uploadCourseImage(file: File): Promise<string> { return uploadImage(file, 'courses'); }
export async function uploadBlogImage(file: File): Promise<string> { return uploadImage(file, 'blog'); }

export async function deleteStudentWorkImage(imageUrl: string): Promise<void> {
  // TODO: implement via Appwrite Storage API
  console.log('Delete image:', imageUrl);
}
