import React, {type ReactNode, useEffect, useState} from "react";
import {AuthContext, type AuthContextType} from "@/contexts/AuthContext.tsx";
import type {User} from "@/types/user.tsx";
interface AuthProviderProps {
    children: ReactNode;
}
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
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