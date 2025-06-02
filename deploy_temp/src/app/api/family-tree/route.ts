import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { dbConnect } from '@/lib/dbconnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { readFileSync } from 'fs';
import path from 'path';
import { parseGedcom, findRootIndividual, getFamilyTreeData } from '@/lib/gedcomParser';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const db = mongoose.connection.db;
    const userId = new ObjectId(session.user.id);

    // Find user's GEDCOM files (support both 'gedcom' and 'ged' file types)
    const query = {
      userId: userId.toString(),
      $or: [
        { fileType: 'gedcom' },
        { fileType: 'ged' },
        { fileCategory: 'GEDCOM' }
      ]
      // Removed status filter to include all GEDCOM files regardless of verification status
    };
    
    console.log('Searching for GEDCOM files with query:', JSON.stringify(query, null, 2));
    
    const gedcomFiles = await db.collection('fileUploads')
      .find(query)
      .sort({ uploadDate: -1 })
      .limit(1)
      .toArray();
    
    console.log('Found GEDCOM files:', gedcomFiles.length);
    if (gedcomFiles.length > 0) {
      console.log('GEDCOM file details:', {
        _id: gedcomFiles[0]._id,
        originalName: gedcomFiles[0].originalName,
        fileType: gedcomFiles[0].fileType,
        fileCategory: gedcomFiles[0].fileCategory,
        hasContent: !!gedcomFiles[0].content,
        path: gedcomFiles[0].path
      });
    }

    if (!gedcomFiles.length) {
      console.log('No verified GEDCOM files found for user:', userId);
      return NextResponse.json({ 
        error: 'No verified GEDCOM files found',
        code: 'NO_GEDCOM_FILES',
        suggestion: 'Please upload and verify a GEDCOM file to view your family tree'
      }, { status: 404 });
    }

    // Use the most recent GEDCOM file
    const gedcomFile = gedcomFiles[0];
    
    try {
      // The GEDCOM content should be stored in the file document
      if (!gedcomFile.content) {
        // If content is not in the document, try to read it from the file system as fallback
        try {
          const filePath = path.join(process.cwd(), gedcomFile.path);
          const fileContent = readFileSync(filePath, 'utf-8');
          gedcomFile.content = fileContent;
        } catch (readError) {
          console.error('Error reading GEDCOM file from disk:', readError);
          return NextResponse.json({ 
            error: 'GEDCOM file content not found in database or on disk',
            code: 'GEDCOM_CONTENT_MISSING',
            suggestion: 'Please re-upload your GEDCOM file and ensure it is properly verified.'
          }, { status: 400 });
        }
      }
      
      // Parse the GEDCOM content
      console.log('Parsing GEDCOM content, length:', gedcomFile.content.length);
      const gedcomData = parseGedcom(gedcomFile.content);
      
      console.log(`Parsed GEDCOM data: ${Object.keys(gedcomData.individuals).length} individuals, ${Object.keys(gedcomData.families).length} families`);
      
      // Find a root individual to start the tree
      const rootIndividual = findRootIndividual(gedcomData);
      
      if (!rootIndividual) {
        console.log('No root individual found, using first individual in file');
        // If no root individual found, try using the first individual in the file
        const firstIndividualId = Object.keys(gedcomData.individuals)[0];
        if (firstIndividualId) {
          const firstIndividual = gedcomData.individuals[firstIndividualId];
          
          // Ensure we have a proper structure for the frontend
          const familyTreeData = {
            id: firstIndividualId,
            name: firstIndividual.name || '',
            givenName: firstIndividual.givenName || '',
            surname: firstIndividual.surname || '',
            gender: firstIndividual.sex || 'U',
            birthDate: firstIndividual.birthDate,
            deathDate: firstIndividual.deathDate,
            children: [],
            partners: []
          };
          
          return NextResponse.json({
            tree: familyTreeData,
            fileName: gedcomFile.originalName,
            uploadDate: gedcomFile.uploadDate || new Date().toISOString(),
            warning: 'Using first individual as root. Family relationships may be incomplete.'
          });
        }
        
        // If no individuals found in the file
        return NextResponse.json({
          error: 'No valid individuals found in the GEDCOM file',
          code: 'NO_INDIVIDUALS_FOUND',
          suggestion: 'Please check your GEDCOM file and ensure it contains valid individual records.'
        }, { status: 400 });
      }
      
      // Generate the family tree data
      const familyTreeData = getFamilyTreeData(gedcomData, rootIndividual.id);
      
      // Add metadata to the response
      const responseData = {
        tree: familyTreeData,
        fileName: gedcomFile.originalName,
        uploadDate: gedcomFile.uploadDate || new Date().toISOString()
      };
      
      console.log('Returning family tree data:', {
        treeRootId: familyTreeData.id,
        treeRootName: familyTreeData.name,
        fileName: responseData.fileName,
        uploadDate: responseData.uploadDate
      });
      
      return NextResponse.json(responseData);
    } catch (parseError) {
      console.error('Error parsing GEDCOM file:', parseError);
      return NextResponse.json({
        error: 'Failed to parse GEDCOM file',
        code: 'GEDCOM_PARSE_ERROR',
        details: process.env.NODE_ENV === 'development' ? (parseError as Error).message : undefined,
        suggestion: 'Please ensure you have uploaded a valid GEDCOM file.'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in family tree API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}
