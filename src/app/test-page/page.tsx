'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEndpoints = async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      const endpoints = ['/api/family-tree', '/api/family-stats', '/api/ancestors'];
      const results: Record<string, any> = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            credentials: 'include',
          });
          const data = await response.json();
          results[endpoint] = data;
        } catch (err) {
          results[endpoint] = { error: err instanceof Error ? err.message : 'Unknown error' };
        }
      }

      setResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Please sign in to continue</h1>
        <button
          onClick={() => signIn('google')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>API Test Results</h1>
        <div>
          <span style={{ marginRight: '10px' }}>Signed in as {session.user?.email}</span>
          <button
            onClick={() => signOut()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <button
        onClick={testEndpoints}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px',
        }}
      >
        {loading ? 'Testing...' : 'Test Endpoints'}
      </button>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '4px' }}>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>
    </div>
  );
}