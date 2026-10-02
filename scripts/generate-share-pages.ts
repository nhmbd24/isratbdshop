import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const shareDir = path.resolve(distDir, 'share');

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildProductHtml(product: any): string {
  const shopName = 'Israt BD Shop | ইসরাত বিডি শপ';
  const publicShopUrl = `https://isratbdshop.blogspot.com/#product-${encodeURIComponent(product.id)}`;
  const canonicalUrl = `https://nhmbd24.github.io/isratbdshop/share/${encodeURIComponent(product.id)}.html`;
  const title = `${product.nameBn || product.name} - ৳${(product.offerPrice || 0).toLocaleString('en-IN')} | ${shopName}`;
  const rawDesc = product.shortDescBn || product.shortDesc || product.fullDescBn || '';
  const cleanDesc = rawDesc.replace(/\s+/g, ' ').trim().slice(0, 180);
  const description = `অফার মূল্য: ৳${(product.offerPrice || 0).toLocaleString('en-IN')}। ${cleanDesc}। সারা দেশে ক্যাশ অন ডেলিভারি।`;
  const imageUrl = product.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&h=630&q=85';

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Israt BD Shop">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">

  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <!-- Instant Human Redirect to Blogger Storefront with Product Hash -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(publicShopUrl)}">
  <script>
    window.location.replace(${JSON.stringify(publicShopUrl)});
  </script>
  <style>
    body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #334155; }
    .card { background: white; padding: 2rem; border-radius: 1.5rem; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 400px; }
    a { display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #059669; color: white; text-decoration: none; border-radius: 0.75rem; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h2>${escapeHtml(product.nameBn || product.name)}</h2>
    <p>দোকানে নিয়ে যাওয়া হচ্ছে...</p>
    <a href="${escapeHtml(publicShopUrl)}">সরাসরি প্রোডাক্ট দেখুন</a>
  </div>
</body>
</html>`;
}

async function generate() {
  if (!fs.existsSync(distDir)) {
    console.log('Dist directory does not exist, skipping share pages generation.');
    return;
  }

  if (!fs.existsSync(shareDir)) {
    fs.mkdirSync(shareDir, { recursive: true });
  }

  try {
    const snap = await getDocs(collection(db, 'products'));
    let count = 0;

    snap.forEach((docSnap) => {
      const product = { id: docSnap.id, ...docSnap.data() };
      const html = buildProductHtml(product);
      fs.writeFileSync(path.resolve(shareDir, `${docSnap.id}.html`), html, 'utf-8');

      // Also create folder for clean /share/:id/ index.html
      const subDir = path.resolve(shareDir, docSnap.id);
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
      }
      fs.writeFileSync(path.resolve(subDir, 'index.html'), html, 'utf-8');
      count++;
    });

    console.log(`Generated ${count} static product share pages in dist/share/`);
  } catch (err) {
    console.warn('Could not fetch products from Firestore for static share generation (offline/non-fatal):', err);
  }

  // General share fallback index.html
  const fallbackHtml = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=https://isratbdshop.blogspot.com/"><script>window.location.replace("https://isratbdshop.blogspot.com/");</script></head><body>Redirecting to Israt BD Shop...</body></html>`;
  fs.writeFileSync(path.resolve(shareDir, 'index.html'), fallbackHtml, 'utf-8');
}

generate().then(() => {
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(0); // non-fatal to never break build
});
