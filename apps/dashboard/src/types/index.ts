export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author' | 'contributor';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  type: 'page' | 'post' | 'product';
  status: 'draft' | 'published' | 'archived';
  author: User;
  createdAt: string;
  updatedAt: string;
  excerpt?: string;
  featuredImage?: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  installed: boolean;
  active: boolean;
  icon: string;
  price: number;
  rating: number;
  downloads: number;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalContent: number;
  totalViews: number;
  revenue: number;
  userGrowth: number;
  contentGrowth: number;
  viewsGrowth: number;
  revenueGrowth: number;
}

export interface Activity {
  id: string;
  type: 'user_registered' | 'content_published' | 'plugin_installed' | 'system_update';
  message: string;
  user?: User;
  timestamp: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}