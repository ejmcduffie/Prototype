'use client';
import { dbConnect } from '@/lib/dbconnect';
import { useEffect, useState } from 'react';

export default function DebugUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const db = await dbConnect();
        const userData = await db.collection('users').find().toArray();
        setUsers(userData);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Accounts</h1>
      {loading ? (
        <p>Loading user data...</p>
      ) : (
        <div>
          <p className="mb-4">Total users: {users.length}</p>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user._id} className="p-4 border rounded">
                <p><strong>ID:</strong> {user._id.toString()}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Provider:</strong> {user.provider || 'email/password'}</p>
                <p><strong>Created:</strong> {user.createdAt?.toString() || 'Unknown'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
