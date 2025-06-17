// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'http://auraysantisecasan.com/',
    base: '/',
    output: 'server',
    vite: {
        envPrefix: 'PUBLIC_'
    }
});
