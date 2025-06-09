// scripts/test-user-uploads.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mock user - in a real app, this would come from your auth system
const MOCK_USER = {
  id: 'test-user-123', // Would be auth.user.id in a real app
  email: 'test@example.com'
};

// File categories
const FILE_CATEGORIES = {
  'jpg|jpeg|png|gif|webp': 'images',
  'pdf|doc|docx|txt': 'documents',
  'mp4|mov|avi': 'videos',
  'mp3|wav|ogg': 'audio'
};

function getFileCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  for (const [pattern, category] of Object.entries(FILE_CATEGORIES)) {
    if (new RegExp(pattern).test(ext)) return category;
  }
  return 'other';
}

async function uploadUserFile(userId, filePath, fileContent, category = 'documents') {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(fileName);
  const fileId = uuidv4();
  
  // Create structured path: users/{user_id}/{category}/{file_id}{ext}
  const storagePath = `users/${userId}/${category}/${fileId}${fileExt}`;
  
  console.log(`Uploading ${fileName} to: ${storagePath}`);
  
  // Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, fileContent, {
      contentType: 'application/octet-stream',
      cacheControl: '3600',
      upsert: false
    });
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath);
  
  return {
    path: uploadData.path,
    publicUrl,
    fileName,
    fileSize: Buffer.byteLength(fileContent),
    mimeType: 'application/octet-stream',
    category,
    userId,
    fileId,
    uploadedAt: new Date().toISOString()
  };
}

async function listUserFiles(userId, prefix = '') {
  const path = `users/${userId}${prefix ? `/${prefix}` : ''}`;
  console.log(`\nListing files in: ${path}`);
  
  const { data: files, error } = await supabase.storage
    .from('documents')
    .list(path);
  
  if (error) {
    console.error('Error listing files:', error.message);
    return [];
  }
  
  return files;
}

async function testUserUploads() {
  console.log('Testing user file uploads...');
  
  try {
    // Create a test file
    const testFileName = `test-file-${Date.now()}.txt`;
    const testFilePath = path.join(__dirname, testFileName);
    const testContent = `Test file created at ${new Date().toISOString()}\nUser: ${MOCK_USER.email}`;
    
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Created test file: ${testFilePath}`);
    
    // Determine file category
    const category = getFileCategory(testFileName);
    console.log(`Detected category: ${category}`);
    
    // Upload the file
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileInfo = await uploadUserFile(
      MOCK_USER.id,
      testFileName,
      fileBuffer,
      category
    );
    
    console.log('\n✅ File uploaded successfully:');
    console.log(`- Path: ${fileInfo.path}`);
    console.log(`- Public URL: ${fileInfo.publicUrl}`);
    console.log(`- Size: ${fileInfo.fileSize} bytes`);
    console.log(`- Category: ${fileInfo.category}`);
    
    // List all user files
    console.log('\n=== User Files ===');
    const userFiles = await listUserFiles(MOCK_USER.id);
    console.log('Files:', userFiles.map(f => f.name).join(', '));
    
    // List files by category
    console.log(`\n=== Files in ${category} ===`);
    const categoryFiles = await listUserFiles(MOCK_USER.id, category);
    console.log('Files:', categoryFiles.map(f => f.name).join(', '));
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('\nCleaned up test file');
    
    return fileInfo;
    
  } catch (err) {
    console.error('Error during user upload test:', err);
    throw err;
  }
}

// Run the test
testUserUploads()
  .then(() => console.log('\nTest completed successfully!'))
  .catch(err => console.error('Test failed:', err));