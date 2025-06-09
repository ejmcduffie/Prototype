/**
 * File type definitions and utilities
 * 
 * This module provides file categorization and type information
 * for handling different file types in the application.
 */

/**
 * File categories and their properties
 */
export const FILE_CATEGORIES = {
  // GEDCOM files get their own top-level category
  'ged': {
    path: 'gedcom',
    type: 'gedcom',
    process: true,  // Flag for blockchain processing
    icon: '🧬',     // Optional: Icon for UI
    displayName: 'GEDCOM File'
  },
  
  // Image files
  'jpg|jpeg|png|gif|webp|svg': {
    path: 'images',
    type: 'image',
    process: false,
    icon: '🖼️',
    displayName: 'Image'
  },
  
  // Document files
  'pdf|doc|docx|txt|rtf|odt|pages': {
    path: 'documents',
    type: 'document',
    process: false,
    icon: '📄',
    displayName: 'Document'
  },
  
  // Video files
  'mp4|mov|avi|webm|mkv': {
    path: 'media/videos',
    type: 'video',
    process: false,
    icon: '🎥',
    displayName: 'Video'
  },
  
  // Audio files
  'mp3|wav|ogg|m4a': {
    path: 'media/audio',
    type: 'audio',
    process: false,
    icon: '🔊',
    displayName: 'Audio'
  },
  
  // Archive files
  'zip|rar|7z': {
    path: 'archives',
    type: 'archive',
    process: false,
    icon: '🗜️',
    displayName: 'Archive'
  }
};

/**
 * Get file information based on filename/extension
 * @param {string} filename - The name of the file
 * @returns {Object} File information object
 */
export function getFileInfo(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  // Special case for .ged files (GEDCOM)
  if (ext === 'ged') {
    return {
      ...FILE_CATEGORIES['ged'],
      extension: 'ged',
      isGedcom: true
    };
  }
  
  // Check other file types
  for (const [pattern, info] of Object.entries(FILE_CATEGORIES)) {
    if (new RegExp(`^(${pattern})$`).test(ext)) {
      return {
        ...info,
        extension: ext,
        isGedcom: false
      };
    }
  }
  
  // Default for unknown types
  return {
    path: 'other',
    type: 'other',
    process: false,
    extension: ext,
    icon: '📁',
    displayName: 'File',
    isGedcom: false
  };
}

/**
 * Check if a file is a GEDCOM file
 * @param {string} filename - The name of the file
 * @returns {boolean} True if the file is a GEDCOM file
 */
export function isGedcomFile(filename) {
  return getFileInfo(filename).isGedcom;
}

/**
 * Get the MIME type for a file extension
 * @param {string} extension - The file extension
 * @returns {string} The MIME type
 */
export function getMimeType(extension) {
  const mimeTypes = {
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text',
    
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    
    // GEDCOM
    'ged': 'text/x-gedcom',
    
    // Add more MIME types as needed
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

// For CommonJS compatibility
module.exports = {
  FILE_CATEGORIES,
  getFileInfo,
  isGedcomFile,
  getMimeType
};