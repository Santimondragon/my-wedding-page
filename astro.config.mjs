// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    vite: {
        server: {
            headers: {
                'Set-Cookie': 'SameSite=Strict; Secure'
            }
        }
    }
});
