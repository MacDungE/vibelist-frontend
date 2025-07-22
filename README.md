# VibeList Frontend

A modern React application built with TypeScript and the latest web technologies.

## 🚀 Tech Stack

### Core Framework

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

### Styling & UI

- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Framer Motion** - Animation and gesture library

### Utilities

- **Lodash** - JavaScript utility library
- **date-fns** - Modern date utility library

### Communication

- **Axios** - HTTP client for API requests
- **TanStack Query** - Data fetching and caching library

## 🛠️ Setup Instructions

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🔧 개발 환경 프록시 설정

### CORS 문제 해결

개발 환경에서 백엔드 서버와의 CORS 문제를 해결하기 위해 Vite 프록시를 사용합니다.

#### 프록시 설정 (vite.config.ts)

```typescript
server: {
  port: 3000,
  proxy: {
    // SSO 관련 API 프록시 (쿠키 전송을 위해 중요)
    '/v1/sso': {
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      secure: false,
      cookieDomainRewrite: 'localhost',
      cookiePathRewrite: '/',
    },
    // 기존 API 프록시
    '/api': {
      target: 'http://127.0.0.1:8080',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api/, ''),
      secure: false,
    },
  },
}
```

#### 동작 방식

- 브라우저에서 `http://localhost:3000/v1/sso/claim-tokens` 요청
- Vite 개발 서버가 `http://127.0.0.1:8080/v1/sso/claim-tokens`로 프록시
- SameSite=Lax 쿠키가 정상적으로 전송됨

#### 환경 변수 설정 (선택사항)

```bash
# .env.development 파일 생성
VITE_API_BASE_URL=
VITE_USE_PROXY=true
```

## 📦 Package Configuration

### Core Packages

```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "typescript": "~5.8.3"
}
```

### Styling & UI Packages

```json
{
  "tailwindcss": "^4.0.0",
  "framer-motion": "^12.23.0",
  "@radix-ui/react-slot": "^1.2.3",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1"
}
```

### Utility Packages

```json
{
  "lodash": "^4.17.21",
  "date-fns": "^4.1.0"
}
```

### Communication Packages

```json
{
  "axios": "^1.10.0",
  "@tanstack/react-query": "^5.81.5"
}
```

## 📁 Project Structure

```
src/
├── components/
│   └── ui/           # shadcn/ui components
├── lib/
│   └── utils.ts      # Utility functions
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles with Tailwind
```

## 🎨 Usage Examples

### Framer Motion

```tsx
import { motion } from 'framer-motion';

<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }}>
  Animated content
</motion.div>;
```

### Lodash

```tsx
import { debounce } from 'lodash';

const debouncedFunction = debounce(() => {
  // Your function here
}, 1000);
```

### date-fns

```tsx
import { format } from 'date-fns';

const formattedDate = format(new Date(), 'PPpp');
```

### TanStack Query

```tsx
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { data, isLoading } = useQuery({
  queryKey: ['todos'],
  queryFn: () => axios.get('/api/todos').then(res => res.data),
});
```

### Tailwind CSS

```tsx
<div className='rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-4'>
  Styled with Tailwind
</div>
```

## 🔧 Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `tsconfig.app.json` - TypeScript configuration with path aliases
- `vite.config.ts` - Vite configuration with path resolution and proxy settings

## 🎯 Features

- ✅ Modern React with TypeScript
- ✅ Tailwind CSS v4 for styling
- ✅ shadcn/ui for beautiful components
- ✅ Framer Motion for animations
- ✅ Lodash for utilities
- ✅ date-fns for date handling
- ✅ Axios for HTTP requests
- ✅ TanStack Query for data fetching
- ✅ Path aliases (@/ for src/)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Development proxy for CORS-free API calls
- ✅ HttpOnly cookie support for secure authentication

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

The application demonstrates all the installed packages with a beautiful, interactive interface.

## 🔒 보안 및 인증

### SSO 인증 플로우

1. 사용자가 소셜 로그인 버튼 클릭
2. 백엔드로 리다이렉트하여 인증 처리
3. 임시 토큰으로 `/v1/sso/claim-tokens` 호출
4. HttpOnly 쿠키로 JWT 토큰 설정
5. 자동 토큰 갱신 및 보안 강화

### 프록시를 통한 쿠키 전송

- 개발 환경에서 프록시 사용으로 CORS 문제 해결
- SameSite=Lax 설정으로도 쿠키 정상 전송
- 프로덕션에서는 적절한 도메인 설정 필요
