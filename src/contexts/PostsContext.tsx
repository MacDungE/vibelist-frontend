import React, {createContext} from 'react';
import type {Post} from '@/components/common/PostCard';
import {initialPosts} from "@/contexts/PostsProvider.tsx";

export const PostsContext = createContext<{
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}>({
  posts: initialPosts,
  setPosts: () => {},
});

