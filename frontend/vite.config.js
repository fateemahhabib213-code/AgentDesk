import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxying /api -> FastAPI (port 8000) avoids CORS friction in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
