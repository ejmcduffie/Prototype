import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

/**
 * Ensures that the uploads directory and its subdirectories exist
 * Creates them if they don't exist
 */
export async function ensureUploadsDirectory(subfolder?: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  try {
    // Check if directory exists
    const dirExists = await exists(uploadsDir);
    
    // Create directory if it doesn't exist
    if (!dirExists) {
      await mkdir(uploadsDir, { recursive: true });
      console.log(`Created uploads directory at ${uploadsDir}`);
    }
    
    // Create subdirectories for different file types
    const subfolders = [
      'gedcom', 'documents', 'images', 'audio', 'video', 'dna_data', 'other'
    ];
    
    for (const folder of subfolders) {
      const subfolderPath = path.join(uploadsDir, folder);
      const subfolderExists = await exists(subfolderPath);
      
      if (!subfolderExists) {
        await mkdir(subfolderPath, { recursive: true });
        console.log(`Created subfolder: ${subfolderPath}`);
      }
    }
    
    // If a specific subfolder was requested, return that path
    if (subfolder && subfolders.includes(subfolder)) {
      return path.join(uploadsDir, subfolder);
    }
    
    return uploadsDir;
  } catch (error) {
    console.error('Error ensuring uploads directory exists:', error);
    throw error;
  }
}

/**
 * Helper function to clean up temporary files if needed
 */
export async function cleanupFile(filePath: string): Promise<void> {
  try {
    if (await exists(filePath)) {
      await promisify(fs.unlink)(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${filePath}:`, error);
  }
}
