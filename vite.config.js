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
            '@': '/src',
            stream: 'stream-browserify',
        },
    },
    build: {
        sourcemap: true, // 소스 맵 활성화
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
