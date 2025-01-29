import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: 'index.html',
        },
    },
    define: {
        'process.env': {},
    },
    server: {
        port: 5173,
        strictPort: true,
        https: true, // HTTPS 환경에서 실행
    },
    base: '/',
});
