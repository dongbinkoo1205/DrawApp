import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // 🔹 이 부분이 있어야 함!

export default defineConfig({
    plugins: [react()],
});
