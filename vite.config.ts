import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import ui from "@nuxt/ui/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui({
      ui: {
        skeleton: {
          base: "animate-pulse rounded-md bg-elevated",
        },
        avatar: {
          slots: {
            root: "inline-flex items-center justify-center shrink-0 select-none rounded-full align-middle bg-elevated",
            image: "h-full w-full rounded-full object-cover",
            fallback: "font-medium leading-none text-muted truncate",
            icon: "text-muted shrink-0",
          },
          variants: {
            size: {
              "3xs": {
                root: "size-4 text-[8px]",
              },
              "2xs": {
                root: "size-5 text-[10px]",
              },
              xs: {
                root: "size-6 text-xs",
              },
              sm: {
                root: "size-7 text-sm",
              },
              md: {
                root: "size-8 text-base",
              },
              lg: {
                root: "size-9 text-lg",
              },
              xl: {
                root: "size-10 text-xl",
              },
              "2xl": {
                root: "size-11 text-[22px]",
              },
              "3xl": {
                root: "size-12 text-2xl",
              },
            },
          },
          defaultVariants: {
            size: "md",
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  build: {
    target: "es2020",
    outDir: "dist",
    emptyOutDir: true,
  },
});
