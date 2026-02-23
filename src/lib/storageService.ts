const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export type ImageType = 'courses' | 'blog' | 'student-works' | 'general';

export async function uploadImage(file: File, type: ImageType = 'general'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(
      `${supabaseUrl}/functions/v1/upload-image`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to upload image';
      try {
        const error = await response.json();
        errorMessage = error.details || error.error || errorMessage;
      } catch {
        errorMessage = await response.text() || errorMessage;
      }
      console.error('Upload error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('No URL returned from upload');
    }
    return data.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
}

export async function uploadStudentWorkImage(file: File): Promise<string> {
  return uploadImage(file, 'student-works');
}

export async function uploadCourseImage(file: File): Promise<string> {
  return uploadImage(file, 'courses');
}

export async function uploadBlogImage(file: File): Promise<string> {
  return uploadImage(file, 'blog');
}

export async function deleteStudentWorkImage(imageUrl: string): Promise<void> {
  try {
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;

    const filePath = `student-works/${fileName}`;

    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/images/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to delete file');
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}
