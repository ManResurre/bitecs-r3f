import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {TanStackRouterVite} from "@tanstack/router-plugin/vite";
// import {cloudflare} from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [TanStackRouterVite(), react()],
    build: {
        outDir: 'dist',
    },
    // Для SPA с React Router
    base: './',
});
