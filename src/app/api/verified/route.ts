export const dynamic = 'force-dynamic'
export async function GET() {
  return Response.json({ 
    status: 'api-working', 
    timestamp: new Date().toISOString(),
    note: 'This verifies basic routing functionality'
  })
}
