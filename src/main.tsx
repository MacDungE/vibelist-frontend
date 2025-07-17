import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
    },
  },
});

// 🔧 개발 모드에서 StrictMode 비활성화 (claim-tokens 중복 호출 방지)
const isDevelopment = import.meta.env.DEV;

const AppWrapper = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
);

createRoot(document.getElementById('root')!).render(
  isDevelopment ? (
    <AppWrapper />
  ) : (
    <StrictMode>
      <AppWrapper />
    </StrictMode>
  )
);
