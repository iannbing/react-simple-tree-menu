import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// React 16.14's jsx-runtime supports the automatic JSX transform, which is
// exactly what our library ships. This config pins the JSX import source
// so Vite doesn't try to use React 17+ conventions that 16.x lacks.
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
    }),
  ],
});
