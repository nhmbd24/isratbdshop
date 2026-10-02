import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { DEMO_PRODUCTS } from '../src/data/products';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const shareDir = path.resolve(distDir, 'share');

function escapeHtml(str: any): string {
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
  
  const name = product.nameBn || product.name || 'পণ্য';
  const offerPrice = product.offerPrice || 0;
  const priceFormatted = `৳${offerPrice.toLocaleString('en-IN')}`;
  const title = `${name} - ${priceFormatted} | ${shopName}`;
  
  const rawDesc = product.shortDescBn || product.shortDesc || product.fullDescBn || '';
  const cleanDesc = rawDesc.replace(/\s+/g, ' ').trim().slice(0, 180);
  const description = `${cleanDesc ? cleanDesc + ' - ' : ''}অফার মূল্য: ${priceFormatted}। সারা দেশে ক্যাশ অন ডেলিভারি | Israt BD Shop`;
  
  let imageUrl = product.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&h=630&q=85';
  if (imageUrl.startsWith('//')) {
    imageUrl = 'https:' + imageUrl;
  } else if (imageUrl.startsWith('/')) {
    imageUrl = `https://nhmbd24.github.io${imageUrl}`;
  }

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">

  <!-- Open Graph / Facebook / Messenger -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Israt BD Shop">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(name)}">

  <!-- Product Metadata -->
  <meta property="product:price:amount" content="${offerPrice}">
  <meta property="product:price:currency" content="BDT">

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
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: white;
      padding: 2rem;
      border-radius: 1.5rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      max-width: 420px;
      margin: 1rem;
      border: 1px solid #e2e8f0;
    }
    .img-wrap {
      width: 100%;
      height: 220px;
      overflow: hidden;
      border-radius: 1rem;
      margin-bottom: 1.25rem;
      background: #f1f5f9;
    }
    .img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.2rem;
      color: #0f172a;
      line-height: 1.4;
    }
    .price {
      font-size: 1.25rem;
      font-weight: bold;
      color: #047857;
      margin-bottom: 1rem;
    }
    .btn {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.75rem 1.75rem;
      background: #047857;
      color: white;
      text-decoration: none;
      border-radius: 0.75rem;
      font-weight: bold;
      font-size: 0.95rem;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #065f46;
    }
    .note {
      font-size: 0.8rem;
      color: #64748b;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="img-wrap">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(name)}">
    </div>
    <h2>${escapeHtml(name)}</h2>
    <div class="price">${escapeHtml(priceFormatted)}</div>
    <a href="${escapeHtml(publicShopUrl)}" class="btn">দোকানে সরাসরি পণ্যটি দেখুন &rarr;</a>
    <p class="note">Israt BD Shop - বাংলাদেশের বিশ্বস্ত অনলাইন শপ</p>
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

  const productsMap = new Map<string, any>();

  // 1. Seed with demo products first as reliable fallback
  for (const p of DEMO_PRODUCTS) {
    productsMap.set(p.id, p);
  }

  // 2. Fetch live products from Firestore (if available)
  try {
    const snap = await getDocs(collection(db, 'products'));
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.isHidden) {
        productsMap.set(docSnap.id, { id: docSnap.id, ...data });
      }
    });
  } catch (err) {
    console.warn('Could not query live Firestore products during static build (using cached catalog):', err);
  }

  let count = 0;
  for (const [id, product] of productsMap.entries()) {
    const html = buildProductHtml(product);

    // Save as /share/prod-id.html
    fs.writeFileSync(path.resolve(shareDir, `${id}.html`), html, 'utf-8');

    // Also save as /share/prod-id/index.html
    const subDir = path.resolve(shareDir, id);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    fs.writeFileSync(path.resolve(subDir, 'index.html'), html, 'utf-8');
    count++;
  }

  // Fallback index.html inside /share/
  const fallbackHtml = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=https://isratbdshop.blogspot.com/"><script>window.location.replace("https://isratbdshop.blogspot.com/");</script></head><body>Redirecting to Israt BD Shop...</body></html>`;
  fs.writeFileSync(path.resolve(shareDir, 'index.html'), fallbackHtml, 'utf-8');

  // Prevent GitHub Pages from ignoring files or folders with underscores
  fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '', 'utf-8');

  console.log(`Generated ${count} product share pages in dist/share/`);
}

generate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Non-fatal error generating share pages:', e);
    process.exit(0);
  });
