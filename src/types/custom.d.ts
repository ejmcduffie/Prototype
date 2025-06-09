// Type definitions for modules
declare module '@/hooks/useUser' {
  export interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: string;
  }

  export interface UseUserReturn {
    user: User | undefined;
    isLoading: boolean;
    isAuthenticated: boolean;
  }

  const useUser: () => UseUserReturn;
  export default useUser;
}

declare module '@/lib/storage' {
  export interface StorageFile {
    name: string;
    fullPath: string;
    metadata: {
      size: number;
      mimetype: string;
      cacheControl: string;
      lastModified?: string;
      eTag: string;
    };
    url: string;
  }
  
  export const uploadFile: (file: File, userId: string) => Promise<{ path: string; error: any }>;
  export const listUserFiles: (userId: string) => Promise<{ data: StorageFile[] | null; error: any }>;
  export const deleteFile: (filePath: string) => Promise<{ success: boolean; error: any }>;
  export const downloadFile: (filePath: string) => Promise<{ url: string; error: any }>;
}
