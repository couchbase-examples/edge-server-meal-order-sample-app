/// <reference types="vite/client" />

// This part extends the built-in ImportMetaEnv interface.
interface ImportMetaEnv {
    readonly EDGE_SERVER_BASE_URL: string;
    // Add more env variables as needed...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }