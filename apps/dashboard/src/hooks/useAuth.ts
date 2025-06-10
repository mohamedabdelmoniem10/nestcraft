import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { User } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const useLogin = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiClient.post<AuthResponse>("/auth/login", credentials),
    onSuccess: (data) => {
      login(data.user, data.token);
      toast.success("Login successful");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterData) =>
      apiClient.post<AuthResponse>("/auth/register", data),
    onSuccess: () => {
      toast.success("Registration successful. Please login.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
    onSuccess: () => {
      logout();
      toast.success("Logged out successfully");
    },
    onError: () => {
      // Still logout locally even if server request fails
      logout();
    },
  });
};

export const useMe = () => {
  const { token, updateUser } = useAuthStore();

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get<User>("/auth/me"),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle success in a useEffect-like pattern
  if (query.data) {
    updateUser(query.data);
  }

  return query;
};
