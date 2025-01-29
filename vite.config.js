import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src', // 🔹 경로 별칭 설정
        },
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: 'index.html', // 🔹 번들링 시 진입점을 명확히 지정
        },
    },
    define: {
        'process.env': {},
    },
    server: {
        port: 5173,
        strictPort: true,
        https: true, // 🔹 HTTPS 환경에서 실행
    },
    base: '/',
});
