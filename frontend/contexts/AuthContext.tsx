'use client';

import { useLogin } from '@/hooks/auth/useLogin';
import { useLogout } from '@/hooks/auth/useLogout';
import { useMe } from '@/hooks/auth/useMe';
import { useRegister } from '@/hooks/auth/useRegister';
import { tokenStorage } from '@/lib/token-storage';
import { IAuthContext, ILoginData, IRegisterData } from '@/types/auth.types';
import { IUser } from '@/types/user.types';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Fetch user data if token exists
  const { data: userData, isLoading, isError } = useMe();

  useEffect(() => {
    if (userData) {
      setUser(userData);
    } else if (isError) {
      setUser(null);
      tokenStorage.clearAll();
    }
  }, [userData, isError]);

  const login = async (data: ILoginData) => {
    const result = await loginMutation.mutateAsync(data);
    setUser(result.user);
    router.push('/dashboard');
  };

  const register = async (data: IRegisterData) => {
    const result = await registerMutation.mutateAsync(data);
    setUser(result.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUser: IUser) => {
    setUser(updatedUser);
  };

  const value: IAuthContext = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
