// ancestrychain/src/app/auth/error/page.tsx
export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="mb-2">There was a problem signing you in.</p>
        <p className="text-red-600">{searchParams.error || "Unknown error"}</p>
        <a href="/login" className="text-blue-600 underline">Back to Login</a>
      </div>
    </div>
  );
}