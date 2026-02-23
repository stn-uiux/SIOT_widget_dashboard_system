import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { PluginOption } from 'vite';

const assetsDir = path.resolve(__dirname, 'assets');
const MIMES: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

/** 프로젝트 루트의 assets 폴더를 /assets/... 로 서빙 (public 없이 폴더에서 이미지 사용) */
function serveAssetsPlugin(): PluginOption {
  return {
    name: 'serve-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/assets', (req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        const filePath = path.join(assetsDir, decodeURIComponent(url));
        if (!filePath.startsWith(assetsDir) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
          return next();
        }
        const ext = path.extname(filePath);
        const mime = MIMES[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mime);
        fs.createReadStream(filePath).pipe(res);
      });
    },
    closeBundle() {
      if (fs.existsSync(assetsDir)) {
        const out = path.resolve(__dirname, 'dist/assets');
        fs.mkdirSync(out, { recursive: true });
        const copy = (src: string, dest: string) => {
          const st = fs.statSync(src);
          if (st.isDirectory()) {
            fs.mkdirSync(dest, { recursive: true });
            fs.readdirSync(src).forEach((name) => copy(path.join(src, name), path.join(dest, name)));
          } else {
            fs.copyFileSync(src, dest);
          }
        };
        fs.readdirSync(assetsDir).forEach((name) => copy(path.join(assetsDir, name), path.join(out, name)));
      }
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), serveAssetsPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
