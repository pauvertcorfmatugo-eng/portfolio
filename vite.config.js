import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Chemin public du site une fois compilé :
    //  - "/" sur un VPS (valeur par défaut)
    //  - "/Portfolio/dist/" pour tester la version compilée dans WAMP (npm run build:wamp)
    base: env.VITE_BASE || '/',
    plugins: [react()],
    server: {
      port: 5173,
      // En développement, les appels à /api sont redirigés vers l'API PHP servie par WAMP.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost/Portfolio',
          changeOrigin: true,
        },
      },
    },
  };
});
