import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
                manualChunks(id) {
                    if (id.includes("@astryxdesign/core")) {
                        return "astryx";
                    }
                    if (id.includes("node_modules")) {
                        return "vendor";
                    }
                    if (
                        id.includes("react-dom") ||
                        id.includes("react-router")
                    ) {
                        return "vendor";
                    }
                    if (id.includes("react")) {
                        return "vendor";
                    }
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
            },
        },
    },
});
