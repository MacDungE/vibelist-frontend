<<<<<<< HEAD
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
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  whileHover={{ scale: 1.05 }}
>
  Animated content
</motion.div>
```

### Lodash
```tsx
import { debounce } from 'lodash'

const debouncedFunction = debounce(() => {
  // Your function here
}, 1000)
```

### date-fns
```tsx
import { format } from 'date-fns'

const formattedDate = format(new Date(), 'PPpp')
```

### TanStack Query
```tsx
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const { data, isLoading } = useQuery({
  queryKey: ['todos'],
  queryFn: () => axios.get('/api/todos').then(res => res.data)
})
```

### Tailwind CSS
```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-lg">
  Styled with Tailwind
</div>
```

## 🔧 Configuration Files

- `tailwind.config.js` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `tsconfig.app.json` - TypeScript configuration with path aliases
- `vite.config.ts` - Vite configuration with path resolution

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

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open [http://localhost:5173](http://localhost:5173) in your browser

The application demonstrates all the installed packages with a beautiful, interactive interface.
=======
# vibelist-frontend
>>>>>>> 59233409594c93c0ceab2d33ae60525592883ce4
