"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as api from "@/lib/api/client";
import { clearToken, getToken, setToken } from "@/lib/auth/token";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hydrated, setHydrated] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getToken());
    setHydrated(true);
  }, []);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: api.getMe,
    enabled: hydrated && !!token,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
    onSuccess: (data) => {
      setToken(data.token);
      setTokenState(data.token);
      queryClient.setQueryData(["auth", "me"], data.organization);
      router.push("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => api.register(name, email, password),
    onSuccess: (data) => {
      setToken(data.token);
      setTokenState(data.token);
      queryClient.setQueryData(["auth", "me"], data.organization);
      router.push("/dashboard");
    },
  });

  const logout = () => {
    clearToken();
    setTokenState(null);
    queryClient.clear();
    router.push("/login");
  };

  const isAuthenticated = hydrated && !!token;

  return {
    token,
    user: meQuery.data,
    isLoading: !hydrated || (!!token && meQuery.isLoading),
    isAuthenticated,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
