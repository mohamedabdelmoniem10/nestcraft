// User DTOs
export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto extends CreateUserDto {
  confirmPassword: string;
}

// Plugin DTOs
export interface CreatePluginDto {
  name: string;
  version: string;
  description?: string;
  author?: string;
  metadata?: any;
  config?: any;
}

export interface UpdatePluginDto {
  version?: string;
  description?: string;
  metadata?: any;
  config?: any;
  status?: string;
}

export interface PluginQueryDto {
  status?: string;
  search?: string;
  author?: string;
  page?: number;
  limit?: number;
}

// Auth DTOs
export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// Generic DTOs
export interface IdDto {
  id: string;
}

export interface BulkDeleteDto {
  ids: string[];
}
