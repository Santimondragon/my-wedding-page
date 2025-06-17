// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
    site: 'http://auraysantisecasan.com/',
    base: '/',
    output: 'server',
    adapter: vercel({}),
    vite: {
        envPrefix: 'PUBLIC_'
    }
});
