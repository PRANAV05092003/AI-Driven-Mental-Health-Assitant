import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthHookReturn } from '../types/auth';
import { User } from '../types';

/**
 * Custom hook to access the authentication context
 * @returns AuthContextType with user, auth state, and auth methods
 * @throws Error if used outside of an AuthProvider
 */
const useAuth = (): AuthHookReturn => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    login: context.login,
    register: context.register,
    logout: context.logout,
    updateUser: context.updateUser,
    refreshToken: context.refreshToken
  };
};

export default useAuth;

// Re-export types for convenience
export type { User };
