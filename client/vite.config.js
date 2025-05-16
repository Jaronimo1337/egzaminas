import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tailwindcssAnimated from 'tailwindcss-animated';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss({
            config: {
                theme: {
                    extend: {},
                },
                variants: {
                    extend: {
                        animation: [
                            'responsive',
                            'hover',
                            'focus',
                            'group-hover',
                        ],
                    },
                },
                plugins: [tailwindcssAnimated],
            },
        }),
    ],
});
