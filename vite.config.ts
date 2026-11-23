import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Code-Entry/",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  worker: {
    format: "es",
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@codemirror") || id.includes("codemirror") || id.includes("@lezer")) {
              return "vendor-codemirror";
            }
            if (id.includes("motion") || id.includes("lucide-react")) {
              return "vendor-motion-icons";
            }
            if (id.includes("sql.js")) {
              return "vendor-sqljs";
            }
            if (id.includes("react-dom") || id.includes("react-router") || id.includes("react")) {
              return "vendor-react";
            }
          }
          if (id.includes("/src/data/lessons/") || id.includes("\\src\\data\\lessons\\")) {
            return "curriculum-lessons";
          }
          if (id.includes("/src/data/roadmaps/") || id.includes("\\src\\data\\roadmaps\\")) {
            return "curriculum-roadmaps";
          }
          if (id.includes("/src/data/theater/") || id.includes("\\src\\data\\theater\\")) {
            return "curriculum-theater";
          }
        },
      },
    },
  },
});
