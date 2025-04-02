/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    base: "/", // 添加基础路径配置

    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
  build: {
    outDir: "build", // Change output directory from 'dist' to 'build'
  },
  server: {
    historyApiFallback: true, // 添加历史 API 回退支持
  },
});
