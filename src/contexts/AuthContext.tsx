import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loginProvider: string | null;
  login: (provider: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginProvider, setLoginProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing login state on app load
    const checkAuthState = () => {
      const storedLoginState = localStorage.getItem('isLoggedIn');
      const storedUserData = localStorage.getItem('userData');
      const storedProvider = localStorage.getItem('loginProvider');

      if (storedLoginState === 'true' && storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setIsLoggedIn(true);
          setUser(userData);
          setLoginProvider(storedProvider);
        } catch (error) {
          console.error('Error parsing user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuthState();
  }, []);

  const login = (provider: string, userData: User) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginProvider', provider);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    setIsLoggedIn(true);
    setUser(userData);
    setLoginProvider(provider);
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginProvider');
    localStorage.removeItem('userData');
    
    setIsLoggedIn(false);
    setUser(null);
    setLoginProvider(null);
  };

  const value: AuthContextType = {
    isLoggedIn,
    user,
    loginProvider,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 