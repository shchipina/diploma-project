import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  publicationsApi,
  type CreatePublicationData,
  type UpdatePublicationData,
  type QueryParams,
} from '@/services/publications.service';

export const publicationKeys = {
  all: ['publications'] as const,
  my: (params?: QueryParams) => [...publicationKeys.all, 'my', params] as const,
  feed: (params?: QueryParams) => [...publicationKeys.all, 'feed', params] as const,
  popular: (params?: QueryParams) => [...publicationKeys.all, 'popular', params] as const,
  forYou: (params?: QueryParams) => [...publicationKeys.all, 'for-you', params] as const,
  saved: (params?: QueryParams) => [...publicationKeys.all, 'saved', params] as const,
  savedIds: () => [...publicationKeys.all, 'saved-ids'] as const,
  one: (id: string) => [...publicationKeys.all, id] as const,
  tags: () => [...publicationKeys.all, 'tags'] as const,
};

export function useMyPublications(params?: QueryParams) {
  return useQuery({
    queryKey: publicationKeys.my(params),
    queryFn: () => publicationsApi.getMy(params),
  });
}

export function useFeedPublications(params?: QueryParams) {
  return useQuery({
    queryKey: publicationKeys.feed(params),
    queryFn: () => publicationsApi.getFeed(params),
  });
}

export function usePopularPublications(params?: QueryParams) {
  return useQuery({
    queryKey: publicationKeys.popular(params),
    queryFn: () => publicationsApi.getPopular(params),
  });
}

export function useForYouPublications(params?: QueryParams) {
  return useQuery({
    queryKey: publicationKeys.forYou(params),
    queryFn: () => publicationsApi.getForYou(params),
  });
}

export function useSavedPublications(params?: QueryParams) {
  return useQuery({
    queryKey: publicationKeys.saved(params),
    queryFn: () => publicationsApi.getSaved(params),
  });
}

export function useSavedIds() {
  return useQuery({
    queryKey: publicationKeys.savedIds(),
    queryFn: publicationsApi.getSavedIds,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTags() {
  return useQuery({
    queryKey: publicationKeys.tags(),
    queryFn: publicationsApi.getTags,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePublicationData) => publicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.all });
    },
  });
}

export function useUpdatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePublicationData }) =>
      publicationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.all });
    },
  });
}

export function useDeletePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publicationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.all });
    },
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publicationsApi.toggleSave(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: publicationKeys.savedIds() });
      const previous = queryClient.getQueryData<string[]>(publicationKeys.savedIds());

      queryClient.setQueryData<string[]>(publicationKeys.savedIds(), (old) => {
        if (!old) return [id];
        return old.includes(id) ? old.filter((i) => i !== id) : [...old, id];
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(publicationKeys.savedIds(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: publicationKeys.savedIds() });
      queryClient.invalidateQueries({ queryKey: publicationKeys.saved() });
    },
  });
}
