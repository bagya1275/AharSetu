import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  register: (data: any) => Promise<User | null>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  setUserRole: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aharseu_token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Load current user
  const fetchMe = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setToken(null);
        localStorage.removeItem('aharseu_token');
      }
    } catch (err) {
      console.error('Failed to fetch auth state', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('aharseu_token', data.token);
        return data.user;
      }
    } catch (err) {
      console.error('Login failed', err);
    }
    return null;
  };

  const register = async (data: any): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
        setToken(resData.token);
        localStorage.setItem('aharseu_token', resData.token);
        return resData.user;
      }
    } catch (err) {
      console.error('Register failed', err);
    }
    return null;
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, message: data.message || 'Password updated successfully!' };
      }
      return { success: false, message: data.error || 'Failed to update password.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Server error.' };
    }
  };

  const setUserRole = async (role: UserRole): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/set-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('aharseu_token', data.token);
        return true;
      }
    } catch (err) {
      console.error('Set role failed', err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aharseu_token');
  };

  const switchDemoRole = async (role: UserRole) => {
    const roleEmails: Record<string, string> = {
      donor: 'donor@aharseu.org',
      ngo: 'ngo@aharseu.org',
      requester: 'requester@aharseu.org',
      volunteer: 'volunteer@aharseu.org',
      admin: 'bagya1275@gmail.com',
      unassigned: 'newuser@aharseu.org'
    };
    setLoading(true);
    await login(roleEmails[role] || `${role}@aharseu.org`);
    if (role !== 'unassigned' && role !== 'admin') {
      await setUserRole(role);
    }
    setLoading(false);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Update user failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, setUserRole, logout, switchDemoRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
