"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/client";

export function useDocuments(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["documents", page, pageSize],
    queryFn: () => api.listDocuments({ page, page_size: pageSize }),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: api.getDashboardStats,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () => api.getDocument(id),
    enabled: !!id,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => api.uploadDocument(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useRevokeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.revokeDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
    },
  });
}

export function useVerifyDocument(shortId: string) {
  return useQuery({
    queryKey: ["verify", shortId],
    queryFn: () => api.verifyDocument(shortId),
    enabled: !!shortId,
    retry: false,
  });
}
