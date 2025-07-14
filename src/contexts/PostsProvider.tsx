import type {Post} from "@/components/common/PostCard.tsx";
import {EMOTION_STATE} from "@/constants/emotion.ts";
import React, {useState} from "react";
import {PostsContext} from "@/contexts/PostsContext.tsx";

export const initialPosts: Post[] = [
    {
        id: 1,
        description: '새벽 감성 플레이리스트',
        likes: 124,
        comments: 18,
        isPrivate: false,
        createdAt: '2일 전',
        tags: ['Chill', 'Lofi', '감성'],
        trackCount: 12,
        duration: '45분',
        spotifyUri: 'spotify:playlist:37i9dQZF1DXcBWIGoYBM5M',
        playlist: [
            {
                id: 1,
                artist: 'DRWN.',
                duration: '1:33',
                cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=80&h=80'
            },
            {id: 2, artist: 'potsu', duration: '2:10'},
            {id: 3, artist: 'eevee', duration: '2:42'},
        ],
        author: '음악러버',
        authorAvatar: '',
        emotion: EMOTION_STATE.무기력한,
        mood: '반대 기분',
    },
    {
        id: 2,
        description: '운동할 때 듣는 신나는 음악',
        likes: 256,
        comments: 32,
        isPrivate: false,
        createdAt: '5일 전',
        tags: ['Workout', 'Energy', 'Pop'],
        trackCount: 10,
        duration: '38분',
        spotifyUri: 'spotify:playlist:37i9dQZF1DX76Wlfdnj7AP',
        playlist: [
            {
                id: 1,
                artist: 'Kanye West',
                duration: '5:12',
                cover: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=80&h=80'
            },
            {id: 2, artist: 'David Guetta', duration: '4:05'},
        ],
        author: '운동러버',
        authorAvatar: '',
        emotion: EMOTION_STATE.활기찬,
        mood: '기분 올리기',
    },
    {
        id: 3,
        description: '비 오는 날의 재즈',
        likes: 189,
        comments: 15,
        isPrivate: false,
        createdAt: '1주 전',
        tags: ['Jazz', 'Rainy', '감성'],
        trackCount: 8,
        duration: '32분',
        spotifyUri: 'spotify:playlist:37i9dQZF1DXbITWG1ZJKYt',
        playlist: [
            {
                id: 1,
                artist: 'Bill Evans',
                duration: '5:58',
                cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=facearea&w=80&h=80'
            },
            {id: 2, artist: 'Miles Davis', duration: '5:37'},
        ],
        author: '재즈러버',
        authorAvatar: '',
        emotion: EMOTION_STATE.편안한,
        mood: '기분 유지하기',
    },
];
export const PostsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    return (
        <PostsContext.Provider value={{posts, setPosts}}>
            {children}
        </PostsContext.Provider>
    );
};