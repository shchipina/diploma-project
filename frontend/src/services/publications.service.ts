import { api } from '@/lib/api';

export interface PublicationTag {
  tagId: string;
  tag: { id: string; name: string };
}

export interface PublicationAuthor {
  id: string;
  email: string;
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  viewCount: number;
  authorId: string;
  author: PublicationAuthor;
  tags: PublicationTag[];
  _count: { savedBy: number };
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TagWithCount {
  id: string;
  name: string;
  _count: { publications: number };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}

export interface CreatePublicationData {
  title: string;
  description: string;
  tags?: string[];
  image?: File;
}

export interface UpdatePublicationData {
  title?: string;
  description?: string;
  tags?: string[];
  image?: File;
}

function buildFormData(data: CreatePublicationData | UpdatePublicationData): FormData {
  const formData = new FormData();
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.tags) {
    data.tags.forEach((tag) => formData.append('tags', tag));
  }
  if (data.image) formData.append('image', data.image);
  return formData;
}

export const publicationsApi = {
  create: async (data: CreatePublicationData): Promise<Publication> => {
    const formData = buildFormData(data);
    const { data: result } = await api.post<Publication>('/publications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return result;
  },

  update: async (id: string, data: UpdatePublicationData): Promise<Publication> => {
    const formData = buildFormData(data);
    const { data: result } = await api.put<Publication>(`/publications/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return result;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/publications/${id}`);
  },

  getMy: async (params?: QueryParams): Promise<PaginatedResponse<Publication>> => {
    const { data } = await api.get<PaginatedResponse<Publication>>('/publications/my', { params });
    return data;
  },

  getFeed: async (params?: QueryParams): Promise<PaginatedResponse<Publication>> => {
    const { data } = await api.get<PaginatedResponse<Publication>>('/publications/feed', {
      params,
    });
    return data;
  },

  getPopular: async (params?: QueryParams): Promise<PaginatedResponse<Publication>> => {
    const { data } = await api.get<PaginatedResponse<Publication>>('/publications/popular', {
      params,
    });
    return data;
  },

  getForYou: async (params?: QueryParams): Promise<PaginatedResponse<Publication>> => {
    const { data } = await api.get<PaginatedResponse<Publication>>('/publications/for-you', {
      params,
    });
    return data;
  },

  getSaved: async (params?: QueryParams): Promise<PaginatedResponse<Publication>> => {
    const { data } = await api.get<PaginatedResponse<Publication>>('/publications/saved', {
      params,
    });
    return data;
  },

  getOne: async (id: string): Promise<Publication> => {
    const { data } = await api.get<Publication>(`/publications/${id}`);
    return data;
  },

  toggleSave: async (id: string): Promise<{ saved: boolean }> => {
    const { data } = await api.post<{ saved: boolean }>(`/publications/${id}/save`);
    return data;
  },

  getSavedIds: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>('/publications/saved/ids');
    return data;
  },

  getTags: async (): Promise<TagWithCount[]> => {
    const { data } = await api.get<TagWithCount[]>('/publications/tags');
    return data;
  },
};
