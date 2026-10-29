import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://mjschool.in',
  server: {
    port: 3000,
    host: true,
  },
  output: 'static',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  integrations: [react()],
  vite: {
    configFile: false,
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        'react-easy-crop',
        'lucide-react',
        '@supabase/supabase-js',
      ],
    },
  },
});
