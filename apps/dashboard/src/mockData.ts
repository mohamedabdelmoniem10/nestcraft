import { DashboardMetrics, User, Content, Plugin, Activity } from '@/types';

// Mock API responses for development
export const mockDashboardMetrics: DashboardMetrics = {
  totalUsers: 12543,
  totalContent: 8921,
  totalViews: 1254320,
  revenue: 45230,
  userGrowth: 12.5,
  contentGrowth: 8.3,
  viewsGrowth: 23.1,
  revenueGrowth: 18.7,
};

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2025-01-20T14:25:00Z',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    role: 'editor',
    status: 'active',
    createdAt: '2024-02-20T09:15:00Z',
    lastLogin: '2025-01-19T16:45:00Z',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'author',
    status: 'inactive',
    createdAt: '2024-03-10T11:20:00Z',
    lastLogin: '2025-01-15T12:30:00Z',
    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
  },
];

export const mockContent: Content[] = [
  {
    id: '1',
    title: 'Getting Started with NestCraft',
    slug: 'getting-started-nestcraft',
    type: 'post',
    status: 'published',
    author: mockUsers[0],
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z',
    excerpt: 'Learn how to build amazing websites with NestCraft CMS',
    featuredImage: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2'
  },
  {
    id: '2',
    title: 'Advanced Features Guide',
    slug: 'advanced-features-guide',
    type: 'page',
    status: 'draft',
    author: mockUsers[1],
    createdAt: '2024-12-10T15:20:00Z',
    updatedAt: '2024-12-20T09:45:00Z',
    excerpt: 'Explore the powerful features that make NestCraft unique'
  },
  {
    id: '3',
    title: 'Premium Plugin Bundle',
    slug: 'premium-plugin-bundle',
    type: 'product',
    status: 'published',
    author: mockUsers[0],
    createdAt: '2024-11-25T12:15:00Z',
    updatedAt: '2024-12-05T16:20:00Z',
    excerpt: 'Complete collection of premium plugins for your website',
    featuredImage: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2'
  },
];

export const mockPlugins: Plugin[] = [
  {
    id: '1',
    name: 'SEO Optimizer',
    description: 'Advanced SEO tools to improve your site\'s search engine ranking',
    version: '2.1.3',
    author: 'NestCraft Team',
    category: 'SEO',
    installed: true,
    active: true,
    icon: '🔍',
    price: 0,
    rating: 4.8,
    downloads: 15420,
  },
  {
    id: '2',
    name: 'Analytics Pro',
    description: 'Comprehensive analytics and reporting dashboard',
    version: '1.4.2',
    author: 'Analytics Inc',
    category: 'Analytics',
    installed: true,
    active: false,
    icon: '📊',
    price: 29.99,
    rating: 4.6,
    downloads: 8932,
  },
  {
    id: '3',
    name: 'Social Media Kit',
    description: 'Complete social media integration and sharing tools',
    version: '3.0.1',
    author: 'Social Tools Ltd',
    category: 'Social',
    installed: false,
    active: false,
    icon: '📱',
    price: 19.99,
    rating: 4.5,
    downloads: 12786,
  },
  {
    id: '4',
    name: 'E-commerce Suite',
    description: 'Full-featured e-commerce solution with payment processing',
    version: '2.8.0',
    author: 'Commerce Pro',
    category: 'E-commerce',
    installed: false,
    active: false,
    icon: '🛒',
    price: 49.99,
    rating: 4.9,
    downloads: 5431,
  },
  {
    id: '5',
    name: 'Backup Manager',
    description: 'Automated backup and restore functionality',
    version: '1.2.1',
    author: 'Backup Solutions',
    category: 'Utilities',
    installed: true,
    active: true,
    icon: '💾',
    price: 0,
    rating: 4.7,
    downloads: 9876,
  },
  {
    id: '6',
    name: 'Form Builder',
    description: 'Drag-and-drop form builder with advanced validation',
    version: '2.3.0',
    author: 'Form Masters',
    category: 'Forms',
    installed: false,
    active: false,
    icon: '📝',
    price: 15.99,
    rating: 4.4,
    downloads: 7654,
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'user_registered',
    message: 'New user Sarah Wilson registered',
    user: mockUsers[1],
    timestamp: '2025-01-20T10:30:00Z',
  },
  {
    id: '2',
    type: 'content_published',
    message: 'Post "Getting Started with NestCraft" was published',
    user: mockUsers[0],
    timestamp: '2025-01-20T09:15:00Z',
  },
  {
    id: '3',
    type: 'plugin_installed',
    message: 'Plugin "SEO Optimizer" was installed',
    user: mockUsers[0],
    timestamp: '2025-01-19T16:45:00Z',
  },
  {
    id: '4',
    type: 'system_update',
    message: 'System updated to version 2.1.0',
    timestamp: '2025-01-19T14:20:00Z',
  },
  {
    id: '5',
    type: 'user_registered',
    message: 'New user Mike Johnson registered',
    user: mockUsers[2],
    timestamp: '2025-01-18T11:30:00Z',
  },
];

// Mock API client for development
export const mockApiClient = {
  async get(endpoint: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    switch (endpoint) {
      case '/dashboard/metrics':
        return mockDashboardMetrics;
      case '/dashboard/activity':
        return mockActivities;
      case '/plugins':
        return mockPlugins;
      default:
        if (endpoint.startsWith('/users')) {
          return {
            data: mockUsers,
            pagination: {
              page: 1,
              limit: 10,
              total: mockUsers.length,
              totalPages: 1,
            },
          };
        }
        if (endpoint.startsWith('/content')) {
          return {
            data: mockContent,
            pagination: {
              page: 1,
              limit: 10,
              total: mockContent.length,
              totalPages: 1,
            },
          };
        }
        throw new Error(`Mock endpoint not found: ${endpoint}`);
    }
  },
  
  async post(endpoint: string, data?: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data };
  },
  
  async put(endpoint: string, data?: any) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data };
  },
  
  async delete(endpoint: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },
};