import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Helper to escape HTML characters for safe meta tag insertion
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function startServer() {
  const app = express();

  // Helper to fetch live product data from Firestore for dynamic OpenGraph tags
  async function getProductData(productId: string) {
    if (!productId) return null;
    try {
      const snap = await getDoc(doc(db, 'products', productId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as any;
      }
    } catch (err) {
      console.error('Error fetching product for OG tags:', err);
    }
    return null;
  }

  // Inject exact product OpenGraph and Twitter metadata into HTML template before sending to crawlers
  function injectProductMetaTags(html: string, product: any) {
    if (!product) return html;

    const shopName = 'Israt BD Shop | ইসরাত বিডি শপ';
    const publicDomain = 'https://isratbdshop.blogspot.com';
    const productUrl = `${publicDomain}/product/${encodeURIComponent(product.id)}`;
    const title = `${product.nameBn || product.name} - ৳${(product.offerPrice || 0).toLocaleString('en-IN')} | ${shopName}`;
    const rawDesc = product.shortDescBn || product.shortDesc || product.fullDescBn || product.categoryBn || '';
    const cleanDesc = rawDesc.replace(/\s+/g, ' ').trim().slice(0, 180);
    const originalPrice = product.originalPrice > product.offerPrice ? ` (পূর্বমূল্য ৳${product.originalPrice.toLocaleString('en-IN')})` : '';
    const description = `দাম: ৳${(product.offerPrice || 0).toLocaleString('en-IN')}${originalPrice}। ${cleanDesc}। সারা দেশে ক্যাশ অন ডেলিভারি।`;
    const imageUrl = product.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&h=630&q=85';

    let result = html;

    // 1. Title & Meta Description
    result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    result = result.replace(
      /<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

    // 2. Open Graph Tags
    result = result.replace(
      /<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:title" content="${escapeHtml(title)}" />`
    );
    result = result.replace(
      /<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:description" content="${escapeHtml(description)}" />`
    );
    result = result.replace(
      /<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`
    );
    result = result.replace(
      /<meta\s+property=["']og:image:secure_url["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}" />`
    );
    result = result.replace(
      /<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:url" content="${escapeHtml(productUrl)}" />`
    );
    result = result.replace(
      /<meta\s+property=["']og:type["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta property="og:type" content="product" />`
    );

    // 3. Twitter Card Tags
    result = result.replace(
      /<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`
    );
    result = result.replace(
      /<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:description" content="${escapeHtml(description)}" />`
    );
    result = result.replace(
      /<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i,
      `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`
    );

    // 4. Canonical Tag
    result = result.replace(
      /<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/i,
      `<link rel="canonical" href="${escapeHtml(productUrl)}" />`
    );

    return result;
  }

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

  // Handle all page requests, including /product/:id and /?product=:id
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
      let productId: string | undefined;

      // Extract productId from path: /product/:id or /p/:id
      const pathMatch = url.match(/^\/(?:product|p)\/([^/?#]+)/i);
      if (pathMatch) {
        productId = decodeURIComponent(pathMatch[1]);
      } else if (req.query.product && typeof req.query.product === 'string') {
        productId = req.query.product;
      }

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

      // If viewing a specific product, inject its exact Firestore details into HTML before sending
      if (productId) {
        const product = await getProductData(productId);
        if (product) {
          template = injectProductMetaTags(template, product);
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
