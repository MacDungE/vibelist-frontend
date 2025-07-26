import type { QueryClient } from '@tanstack/react-query';

interface LikeData {
  data: {
    liked: boolean;
    likeCount?: number;
  };
}

export const createOptimisticLikeMutation = (
  queryClient: QueryClient,
  likeStatusKey: string[],
  likeCountKey: string[]
) => ({
  onMutate: async () => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: likeStatusKey });
    await queryClient.cancelQueries({ queryKey: likeCountKey });
    
    // Snapshot the previous values
    const previousLikeStatus = queryClient.getQueryData<LikeData>(likeStatusKey);
    const previousLikeCount = queryClient.getQueryData<LikeData>(likeCountKey);
    
    // Optimistically update to the new value
    queryClient.setQueryData<LikeData>(likeStatusKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          liked: !old.data.liked
        }
      };
    });
    
    queryClient.setQueryData<LikeData>(likeCountKey, (old) => {
      if (!old) return old;
      const currentLiked = previousLikeStatus?.data?.liked || false;
      return {
        ...old,
        data: {
          ...old.data,
          likeCount: currentLiked 
            ? Math.max(0, (old.data.likeCount || 0) - 1) 
            : (old.data.likeCount || 0) + 1
        }
      };
    });
    
    // Return a context object with the snapshotted values
    return { previousLikeStatus, previousLikeCount };
  },
  
  onError: (_err: unknown, _variables: unknown, context: any) => {
    // If the mutation fails, use the context returned from onMutate to roll back
    if (context?.previousLikeStatus) {
      queryClient.setQueryData(likeStatusKey, context.previousLikeStatus);
    }
    if (context?.previousLikeCount) {
      queryClient.setQueryData(likeCountKey, context.previousLikeCount);
    }
  },
  
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: likeStatusKey });
    queryClient.invalidateQueries({ queryKey: likeCountKey });
  }
});