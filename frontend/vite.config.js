import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "node:path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "#": path.resolve("./src"),
        },
    },
    build: {
        outDir: "dist",
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom", "react-router"],
                    astryx: ["@astryxdesign/core"],
                },
            },
        },
    }, 
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
            }
        }
    }
})
