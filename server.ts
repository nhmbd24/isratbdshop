import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();

  let vite: any;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));
  }

  // Serve pre-generated share pages if requested directly
  app.use('/share', express.static(path.resolve(__dirname, 'dist/share')));

  // Handle storefront requests cleanly
  app.get('*', async (req, res, next) => {
    const url = req.originalUrl;

    // Skip Vite internal files and static assets
    if (
      url.startsWith('/@') ||
      url.startsWith('/src/') ||
      url.startsWith('/node_modules/') ||
      url.match(/\.(js|css|json|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf)$/)
    ) {
      return next();
    }

    try {
      let template = '';
      if (!isProd && vite) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
      } else {
        const distIndexPath = path.resolve(__dirname, 'dist', 'index.html');
        if (fs.existsSync(distIndexPath)) {
          template = fs.readFileSync(distIndexPath, 'utf-8');
        } else {
          template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        }
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      if (!isProd && vite) {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Israt BD Shop server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

