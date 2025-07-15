import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { User } from '../types';

// Define the shape of the auth context
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [interceptorId, setInterceptorId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize the refresh token function to prevent unnecessary re-renders
  const refreshTokenHandler = useCallback(async (): Promise<string> => {
    try {
      const { token } = await authService.refreshToken();
      if (token) {
        authService.setAuthToken(token);
        return token;
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await authService.logout();
      throw error; // Re-throw to allow the interceptor to handle the error
    }
  }, []);

  // Handle unauthenticated state
  const handleUnauthenticated = useCallback((error: any) => {
    console.error('Authentication error:', error);
    setIsAuthenticated(false);
    setUser(null);
    authService.clearAuthToken();
    navigate('/login');
  }, [navigate]);

  // Setup response interceptor on mount
  useEffect(() => {
    const id = authService.setupResponseInterceptor(
      refreshTokenHandler,
      handleUnauthenticated
    );
    setInterceptorId(id);

    // Cleanup interceptor on unmount
    return () => {
      if (id !== null) {
        authService.ejectResponseInterceptor(id);
      }
    };
  }, [refreshTokenHandler, handleUnauthenticated]);

  // Set auth token in axios headers and local storage
  const setAuthToken = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
      // Set default auth header for axios
      if (authService.setAuthToken) {
        authService.setAuthToken(token);
      }
    } else {
      localStorage.removeItem('token');
      if (authService.clearAuthToken) {
        authService.clearAuthToken();
      }
    }
  }, []);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getMe();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setAuthToken]);

  // Handle login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user, token } = await authService.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      authService.setAuthToken(token);
      toast.success('Login successful!');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      setIsLoading(true);
      const { user, token } = await authService.register(userData);
      setUser(user);
      setIsAuthenticated(true);
      authService.setAuthToken(token);
      toast.success('Registration successful!');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      authService.clearAuthToken();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...userData } : null));
  };

  // Refresh access token - exposed through context
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      await refreshTokenHandler();
      return true;
    } catch (error) {
      return false;
    }
  }, [refreshTokenHandler]);

  // Provide the auth context
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
