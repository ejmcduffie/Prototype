import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export const BUCKET_NAME = 'documents';

// Create a type for file metadata
export interface FileWithMetadata extends File {
  preview?: string;
  path?: string;
}

// Initialize the Supabase client for client-side usage
const getSupabaseClient = () => {
  return createClientComponentClient<Database>();
};

// Upload a file to Supabase Storage
export const uploadFile = async (file: File, userId: string): Promise<{ path: string; error: any }> => {
  const supabase = getSupabaseClient();
  
  // Create a unique file path: user_id/filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { path: '', error };
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { path: publicUrl, error: null };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return { path: '', error };
  }
};

// List all files for the current user
export const listUserFiles = async (userId: string) => {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(userId);

    if (error) throw error;
    
    // Get public URLs for each file
    const filesWithUrls = await Promise.all(
      (data || []).map(async (file) => {
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${userId}/${file.name}`);
          
        return {
          ...file,
          url: publicUrl,
          fullPath: `${userId}/${file.name}`
        };
      })
    );

    return { data: filesWithUrls, error: null };
  } catch (error) {
    console.error('Error listing files:', error);
    return { data: null, error };
  }
};

// Delete a file
export const deleteFile = async (filePath: string) => {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error };
  }
};

// Download a file
export const downloadFile = async (filePath: string) => {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) throw error;
    
    // Create a URL for the blob
    const url = URL.createObjectURL(data);
    return { url, error: null };
  } catch (error) {
    console.error('Error downloading file:', error);
    return { url: '', error };
  }
};
