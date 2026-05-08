/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// we need this file to declare the types for our custom environment variables and any global types we want to use across the frontend codebase. It doesn't contain any actual code, just type declarations.