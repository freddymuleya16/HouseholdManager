
import { User } from '@/entities/User';
import authService from '@/services/AuthService';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
 

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  hasRole: (role: string) => Promise<boolean>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const isAuth = await authService.checkAndRefreshAuth();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          const userData = await authService.getUserData();
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              roles: userData.roles,
              householdId:userData.householdId,
              name:userData.name
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const payload = await authService.login(credentials);
      setIsAuthenticated(true);

      const userData = await authService.getUserData();
      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          roles: userData.roles
        });
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Invalid credentials');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const payload = await authService.register(credentials);
      setIsAuthenticated(true);

      const userData = await authService.getUserData();
      if (userData) {
        setUser({
          id: userData.id,
          email: userData.email,
          roles: userData.roles
        });
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      console.log('Registration Failed', error instanceof Error ? error.message : 'Registration failed')
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      Alert.alert('Password Reset', 'If an account exists with this email, a reset link will be sent');
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert('Password Reset', 'If an account exists with this email, a reset link will be sent');
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword(token, newPassword);
      Alert.alert('Success', 'Your password has been reset successfully. You can now login.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Password reset failed');
      throw error;
    }
  };

  // Check if user has a specific role
  const hasRole = async (role: string) => {
    return authService.hasRole(role);
  };

  // Function to refresh auth state (useful after operations that might change user data)
  const refreshAuthState = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const userData = await authService.getUserData();
        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            roles: userData.roles
          });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Refresh auth state error:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    hasRole,
    refreshAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;