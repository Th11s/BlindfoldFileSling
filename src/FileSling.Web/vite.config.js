export default {
    appType: 'custom',
    root: './typescript',
    build: {
        manifest: true,
        outDir: '../wwwroot/js-client',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
                main: './typescript/App.ts'
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        }
    },
    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            clientPort: 5173
        }
    }
};