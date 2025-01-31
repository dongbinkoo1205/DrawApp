import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: 'automatic', // 자동 JSX 런타임 설정
        }),
    ],
    resolve: {
        alias: {
            '@': '/src', // 절대 경로 설정 (유지)
        },
    },
    build: {
        target: 'esnext',
        sourcemap: true, // 소스 맵 활성화 (필요 없으면 제거)
    },
    define: {
        'process.env': {}, // 환경 변수 정의 (필요 없으면 제거 가능)
    },
    server: {
        port: 5173, // 개발 서버 포트
        strictPort: true, // 포트 고정 (중요하지 않다면 제거 가능)
    },
});
