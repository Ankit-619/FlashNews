import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import netlify from "@netlify/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    netlify({
      // This tells the plugin to skip starting the local Edge Functions server,
      // which is causing the error. Your regular Netlify function will still work.
      edgeFunctions: { enabled: false },
    }),
  ],
});