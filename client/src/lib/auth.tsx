import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  githubUser: GitHubUser | null;
  isGitHubConnected: boolean;
  isLoadingGitHub: boolean;
  login: () => void;
  logout: () => void;
  connectGitHub: () => void;
  disconnectGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch GitHub connection status
  const { data: githubStatus, isLoading: isLoadingGitHub } = useQuery<{
    connected: boolean;
    user: GitHubUser | null;
  }>({
    queryKey: ['/api/github/oauth/status'],
    staleTime: 60 * 1000, // 1 minute
  });

  const isAuthenticated = !!user;
  const isGitHubConnected = githubStatus?.connected ?? false;
  const githubUser = githubStatus?.user ?? null;

  const login = () => {
    window.location.href = '/api/login';
  };

  const logout = () => {
    window.location.href = '/api/logout';
  };

  const connectGitHub = () => {
    window.location.href = '/api/github/oauth/connect';
  };

  const disconnectGitHubMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/github/oauth/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to disconnect GitHub');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/github/oauth/status'] });
    },
  });

  const disconnectGitHub = async () => {
    await disconnectGitHubMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading: isLoadingUser,
        isAuthenticated,
        githubUser,
        isGitHubConnected,
        isLoadingGitHub,
        login,
        logout,
        connectGitHub,
        disconnectGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
