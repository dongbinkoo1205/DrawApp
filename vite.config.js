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
            '@': '/src', // 프로젝트 경로 alias 설정 유지
        },
    },
    build: {
        target: 'esnext',
        modulePreload: false,
        rollupOptions: {
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
    css: {
        preprocessorOptions: {
            css: {
                importLoaders: 1,
            },
        },
    },
    define: {
        'process.env': {},
    },
    server: {
        port: 5173,
        strictPort: true,
    },
});
