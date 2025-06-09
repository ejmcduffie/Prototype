import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      message: 'NFT minting is not yet implemented',
      note: 'Web3 integration will be added in a future update'
    }, 
    { status: 501 } // 501 Not Implemented
  );
}
