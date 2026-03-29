import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moderationApi } from '@/services/moderation.service';
import type { QueryParams } from '@/services/publications.service';

export const moderationKeys = {
  all: ['moderation'] as const,
  stats: () => [...moderationKeys.all, 'stats'] as const,
  publications: (params?: QueryParams & { status?: string }) =>
    [...moderationKeys.all, 'publications', params] as const,
  pending: (params?: QueryParams) => [...moderationKeys.all, 'pending', params] as const,
};

export function useModerationStats() {
  return useQuery({
    queryKey: moderationKeys.stats(),
    queryFn: moderationApi.getStats,
  });
}

export function useModerationPublications(params?: QueryParams & { status?: string }) {
  return useQuery({
    queryKey: moderationKeys.publications(params),
    queryFn: () => moderationApi.getPublications(params),
  });
}

export function useApprovePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => moderationApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
    },
  });
}

export function useRejectPublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => moderationApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
    },
  });
}
