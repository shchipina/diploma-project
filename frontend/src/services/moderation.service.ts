import { api } from '@/lib/api';
import type { PaginatedResponse, Publication, QueryParams } from './publications.service';

export interface ModerationStats {
  pending: number;
  published: number;
  rejected: number;
  total: number;
}

export const moderationApi = {
  getStats: async (): Promise<ModerationStats> => {
    const { data } = await api.get<ModerationStats>('/moderation/stats');
    return data;
  },

  getPublications: async (
    params?: QueryParams & { status?: string },
  ): Promise<PaginatedResponse<Publication>> => {
    const { data } = await api.get<PaginatedResponse<Publication>>('/moderation/publications', {
      params,
    });
    return data;
  },

  getPending: async (params?: QueryParams): Promise<PaginatedResponse<Publication>> => {
    const { data } = await api.get<PaginatedResponse<Publication>>(
      '/moderation/publications/pending',
      { params },
    );
    return data;
  },

  approve: async (id: string): Promise<Publication> => {
    const { data } = await api.patch<Publication>(`/moderation/publications/${id}/approve`);
    return data;
  },

  reject: async (id: string): Promise<Publication> => {
    const { data } = await api.patch<Publication>(`/moderation/publications/${id}/reject`);
    return data;
  },
};
