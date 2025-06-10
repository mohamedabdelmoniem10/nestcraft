import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { DashboardMetrics, User, Content, Plugin, Activity, PaginatedResponse } from '@/types';

// Dashboard queries
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.get<DashboardMetrics>('/dashboard/stats'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserGrowth = () => {
  return useQuery({
    queryKey: ['dashboard', 'user-growth'],
    queryFn: () => apiClient.get<any[]>('/dashboard/user-growth'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => apiClient.get<Activity[]>('/dashboard/recent-activity'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// User queries
export const useUsers = (page = 1, limit = 10, search = '', role?: string) => {
  return useQuery({
    queryKey: ['users', page, limit, search, role],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(role && { role }),
      });
      return apiClient.get<PaginatedResponse<User>>(`/users?${params}`);
    },
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => apiClient.get<any>('/users/stats'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: Partial<User>) => apiClient.post<User>('/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => 
      apiClient.put<User>(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'stats'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
};

// Content queries
export const useContent = (page = 1, limit = 10, search = '', type?: string, status?: string) => {
  return useQuery({
    queryKey: ['content', page, limit, search, type, status],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(type && { type }),
        ...(status && { status }),
      });
      return apiClient.get<PaginatedResponse<Content>>(`/content?${params}`);
    },
  });
};

export const useContentStats = () => {
  return useQuery({
    queryKey: ['content', 'stats'],
    queryFn: () => apiClient.get<any>('/content/stats'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contentData: Partial<Content>) => apiClient.post<Content>('/content', contentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content', 'stats'] });
      toast.success('Content created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create content');
    },
  });
};

export const useUpdateContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Content> }) => 
      apiClient.put<Content>(`/content/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast.success('Content updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update content');
    },
  });
};

export const useDeleteContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/content/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content', 'stats'] });
      toast.success('Content deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete content');
    },
  });
};

// Plugin queries
export const usePlugins = () => {
  return useQuery({
    queryKey: ['plugins'],
    queryFn: () => apiClient.get<Plugin[]>('/plugins'),
  });
};

export const useInstallPlugin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pluginId: string) => apiClient.post(`/plugins/${pluginId}/install`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      toast.success('Plugin installed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to install plugin');
    },
  });
};

export const useEnablePlugin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pluginId: string) => apiClient.post(`/plugins/${pluginId}/enable`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      toast.success('Plugin enabled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enable plugin');
    },
  });
};

export const useDisablePlugin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pluginId: string) => apiClient.post(`/plugins/${pluginId}/disable`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      toast.success('Plugin disabled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disable plugin');
    },
  });
};

// Analytics queries
export const useAnalyticsOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => apiClient.get<any>('/analytics/overview'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrafficOverview = () => {
  return useQuery({
    queryKey: ['analytics', 'traffic-overview'],
    queryFn: () => apiClient.get<any[]>('/analytics/traffic-overview'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserEngagement = () => {
  return useQuery({
    queryKey: ['analytics', 'user-engagement'],
    queryFn: () => apiClient.get<any[]>('/analytics/user-engagement'),
    staleTime: 5 * 60 * 1000,
  });
};

// File upload
export const useFileUpload = () => {
  return useMutation({
    mutationFn: ({ file, path }: { file: File; path?: string }) => 
      apiClient.upload('/upload', file, { path }),
    onSuccess: () => {
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file');
    },
  });
};