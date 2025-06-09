import { useSession } from 'next-auth/react';

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string;
}

const useUser = () => {
  const { data: session, status } = useSession();
  
  const user = session?.user as User | undefined;
  
  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
};

export default useUser;
