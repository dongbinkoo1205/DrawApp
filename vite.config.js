import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs'; // CommonJS 호환 플러그인

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': '/src', // 필요한 경우 경로 별칭 추가
        },
    },
    build: {
        rollupOptions: {
            input: 'index.html',
            plugins: [commonjs()], // CommonJS 모듈 호환 설정
            external: ['peerjs'], // peerjs를 외부 모듈로 설정
        },
    },
    server: {
        port: 5173,
        strictPort: true,
    },
    define: {
        'process.env': {},
    },
    base: '/',
});
