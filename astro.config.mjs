// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    site: 'http://auraysantisecasan.com/',
    base: '/',
    output: 'server',
    adapter: vercel({}),
    integrations: [react(), tailwind()],
    vite: {
        envPrefix: 'PUBLIC_'
    }
});
