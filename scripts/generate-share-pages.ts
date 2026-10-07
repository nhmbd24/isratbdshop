import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

function getExactProductImageUrl(product: any): string {
  // Use that exact product's real image URL from the product data / database
  const rawImage = product?.image || (Array.isArray(product?.additionalImages) && product.additionalImages[0]) || '';
  let url = String(rawImage).trim();
  if (url.startsWith('//')) {
    url = 'https:' + url;
  } else if (url.startsWith('/')) {
    url = `https://nhmbd24.github.io${url}`;
  }
  return url;
}

function buildProductHtml(product: any, storeSettings?: any): string {
  const shopName = storeSettings?.shopName || 'Israt BD Shop';
  const shopNameBn = storeSettings?.shopNameBn || 'ইসরাত বিডি শপ';
  const rawPhone = storeSettings?.whatsappNumber || '01712345678';
  let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
    cleanPhone = '88' + cleanPhone;
  }
  if (!cleanPhone.startsWith('88')) {
    cleanPhone = '88' + cleanPhone;
  }
  const hotline = storeSettings?.phoneNumber || '01712-345678';

  const canonicalUrl = `https://nhmbd24.github.io/isratbdshop/share/${encodeURIComponent(product.id)}.html`;
  const bloggerProductDestination = `https://isratbdshop.blogspot.com/?product=${encodeURIComponent(product.id)}#product-${encodeURIComponent(product.id)}`;
  const bloggerShopUrl = bloggerProductDestination;

  const nameBn = product.nameBn || product.name || 'পণ্য';
  const nameEn = product.name || '';
  const offerPrice = product.offerPrice || 0;
  const originalPrice = product.originalPrice > offerPrice ? product.originalPrice : 0;
  const priceFormatted = `৳${offerPrice.toLocaleString('en-IN')}`;
  const originalPriceFormatted = originalPrice > 0 ? `৳${originalPrice.toLocaleString('en-IN')}` : '';
  const savings = originalPrice > offerPrice ? originalPrice - offerPrice : 0;
  const savingsFormatted = savings > 0 ? `৳${savings.toLocaleString('en-IN')}` : '';

  // Open Graph Title: exact product name + shop name (Strictly NO price, currency, or discount)
  const ogTitle = `${nameBn} | ${shopName}`;

  // Open Graph Description: product description without prices or currency symbols
  let cleanDesc = (product.shortDescBn || product.shortDesc || product.fullDescBn || '')
    .replace(/\s+/g, ' ')
    .trim();
  // Strip out any price or currency expressions if present
  cleanDesc = cleanDesc.replace(/(৳|tk|taka|টাকা|মূল্য|অফার|দাম|price)[\s:]*[\d,]+/gi, '').replace(/\s+/g, ' ').trim();
  if (cleanDesc.length > 160) {
    cleanDesc = cleanDesc.slice(0, 160) + '...';
  }
  const ogDescription = cleanDesc
    ? `${cleanDesc} | ক্যাশ অন ডেলিভারি ও দ্রুত হোম ডেলিভারি | ${shopName}`
    : `অরিজিনাল ও প্রিমিয়াম কোয়ালিটি পণ্য। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি ও দ্রুত হোম ডেলিভারি সুবিধা | ${shopName}`;

  // Exact product image from database / product data (identical to shop card)
  const exactProductImage = getExactProductImageUrl(product);

  // Pre-filled WhatsApp order message as required:
  // - Product name
  // - Selected price
  // - Product/share URL
  // - Product information if available
  const waLines = [
    shopNameBn,
    '',
    `পণ্যের নাম: ${nameBn}`,
    originalPrice > 0 ? `মূল্য: ${originalPriceFormatted}` : '',
    `অফার মূল্য: ${priceFormatted}`,
    product.categoryBn ? `ক্যাটাগরি: ${product.categoryBn}` : '',
    `পণ্য লিংক: ${canonicalUrl}`,
    '',
    'আমি এই পণ্যটি অর্ডার করতে চাই।'
  ].filter(Boolean);

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waLines.join('\n'))}`;

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(ogTitle)}</title>
  <meta name="description" content="${escapeHtml(ogDescription)}">

  <!-- Open Graph / Facebook / Messenger (Crawled Directly without Redirect) -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="${escapeHtml(shopName)}">
  <meta property="og:title" content="${escapeHtml(ogTitle)}">
  <meta property="og:description" content="${escapeHtml(ogDescription)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(exactProductImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(exactProductImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(nameBn)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(ogTitle)}">
  <meta name="twitter:description" content="${escapeHtml(ogDescription)}">
  <meta name="twitter:image" content="${escapeHtml(exactProductImage)}">

  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <!-- Crawler-Safe Human Redirect to Exact Blogger Product Details -->
  <script>
    (function() {
      try {
        var ua = (navigator.userAgent || '').toLowerCase();
        var isCrawler =
          ua.indexOf('facebookexternalhit') !== -1 ||
          ua.indexOf('facebot') !== -1 ||
          ua.indexOf('facebookcatalog') !== -1 ||
          ua.indexOf('meta-externalagent') !== -1 ||
          ua.indexOf('meta-externalfetcher') !== -1 ||
          ua.indexOf('whatsapp') !== -1 ||
          ua.indexOf('twitterbot') !== -1 ||
          ua.indexOf('linkedinbot') !== -1 ||
          ua.indexOf('telegrambot') !== -1 ||
          ua.indexOf('pinterest') !== -1 ||
          ua.indexOf('slackbot') !== -1 ||
          ua.indexOf('discordbot') !== -1 ||
          ua.indexOf('googlebot') !== -1 ||
          ua.indexOf('bingbot') !== -1 ||
          ua.indexOf('applebot') !== -1 ||
          ua.indexOf('yandex') !== -1 ||
          ua.indexOf('duckduckbot') !== -1;

        // Redirect normal human browser visitors to exact product on Blogger
        if (!isCrawler) {
          window.location.replace(${JSON.stringify(bloggerProductDestination)});
        }
      } catch (e) {}
    })();
  </script>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hind Siliguri", sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      line-height: 1.5;
      padding-bottom: 3rem;
    }
    .top-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 20;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .brand-link {
      color: #065f46;
      font-weight: 800;
      text-decoration: none;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .phone-link {
      color: #047857;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 700;
      background: #ecfdf5;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      border: 1px solid #a7f3d0;
    }
    .main-wrap {
      max-width: 540px;
      margin: 1.25rem auto;
      padding: 0 1rem;
    }
    .product-card {
      background: #ffffff;
      border-radius: 1.25rem;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
    }
    .img-container {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #f8fafc;
      overflow: hidden;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .badge-discount {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background: #e11d48;
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.6rem;
      border-radius: 0.5rem;
      box-shadow: 0 2px 6px rgba(225, 29, 72, 0.4);
    }
    .badge-cod {
      position: absolute;
      bottom: 0.75rem;
      left: 0.75rem;
      background: rgba(6, 78, 59, 0.9);
      color: #ecfdf5;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 0.4rem;
      backdrop-filter: blur(4px);
    }
    .info-container {
      padding: 1.25rem;
    }
    .meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.75rem;
    }
    .category-tag {
      background: #ecfdf5;
      color: #047857;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 0.35rem;
    }
    .rating-tag {
      color: #d97706;
      font-weight: 700;
    }
    .product-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
      margin-bottom: 0.25rem;
    }
    .product-subtitle {
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 1rem;
    }
    .price-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.875rem;
      padding: 0.875rem 1rem;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .offer-price {
      font-size: 1.75rem;
      font-weight: 900;
      color: #047857;
      letter-spacing: -0.02em;
    }
    .original-price {
      font-size: 0.95rem;
      color: #94a3b8;
      text-decoration: line-through;
      margin-left: 0.5rem;
    }
    .savings-badge {
      background: #fee2e2;
      color: #b91c1c;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 0.35rem;
    }

    /* Prominent Green WhatsApp Order Button */
    .btn-whatsapp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      background: #25D366;
      color: #ffffff;
      text-decoration: none;
      font-size: 1.1rem;
      font-weight: 900;
      padding: 0.95rem 1.25rem;
      border-radius: 0.875rem;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
      transition: all 0.2s ease;
      cursor: pointer;
      text-align: center;
      margin-bottom: 0.75rem;
    }
    .btn-whatsapp:hover, .btn-whatsapp:active {
      background: #20ba59;
      transform: translateY(-1px);
    }
    .btn-whatsapp svg {
      flex-shrink: 0;
    }

    /* Secondary Blogger Storefront Button */
    .btn-storefront {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      background: #ffffff;
      color: #065f46;
      border: 1.5px solid #065f46;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 700;
      padding: 0.8rem 1rem;
      border-radius: 0.875rem;
      transition: all 0.2s ease;
      text-align: center;
      margin-bottom: 1.25rem;
    }
    .btn-storefront:hover {
      background: #f0fdf4;
    }

    /* Assurances */
    .trust-box {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      color: #065f46;
      margin-bottom: 1.25rem;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.25rem;
    }
    .trust-item:last-child {
      margin-bottom: 0;
    }

    /* Description */
    .desc-section {
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
      margin-top: 0.5rem;
    }
    .desc-title {
      font-size: 0.9rem;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }
    .desc-text {
      font-size: 0.85rem;
      color: #475569;
      line-height: 1.6;
      white-space: pre-line;
    }
    .footer-note {
      text-align: center;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 1.5rem;
    }
  </style>
</head>
<body>
  <!-- Top Navigation Header -->
  <header class="top-header">
    <a href="${escapeHtml(bloggerShopUrl)}" class="brand-link">
      <span>🛍️</span>
      <span>${escapeHtml(shopNameBn)}</span>
    </a>
    <a href="tel:${escapeHtml(hotline.replace(/[^0-9]/g, ''))}" class="phone-link">
      📞 কল করুন: ${escapeHtml(hotline)}
    </a>
  </header>

  <!-- Product Landing Card -->
  <div class="main-wrap">
    <div class="product-card">
      <div class="img-container">
        <img src="${escapeHtml(exactProductImage)}" alt="${escapeHtml(nameBn)}" class="product-img" loading="eager">
        <div class="badge-cod">✓ ক্যাশ অন ডেলিভারি (পণ্য দেখে পেমেন্ট)</div>
      </div>

      <div class="info-container">
        <div class="meta-row">
          <span class="category-tag">${escapeHtml(product.categoryBn || 'প্রোডাক্ট')}</span>
          <span class="rating-tag">★ ${product.rating || '4.9'} (${product.reviewCount || 120}+ রিভিউ)</span>
        </div>

        <h1 class="product-title">${escapeHtml(nameBn)}</h1>
        ${nameEn ? `<div class="product-subtitle">${escapeHtml(nameEn)}</div>` : ''}

        <div class="price-box">
          <div>
            <span class="offer-price">${escapeHtml(priceFormatted)}</span>
            ${originalPriceFormatted ? `<span class="original-price">${escapeHtml(originalPriceFormatted)}</span>` : ''}
          </div>
          ${savingsFormatted ? `<span class="savings-badge">বাঁচবে ${escapeHtml(savingsFormatted)}</span>` : ''}
        </div>

        <!-- Prominent Green WhatsApp Order Button -->
        <a href="${escapeHtml(whatsappUrl)}" class="btn-whatsapp" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span>WhatsApp অর্ডার</span>
        </a>

        <!-- Secondary Action: Open Full Shop on Blogger -->
        <a href="${escapeHtml(bloggerShopUrl)}" class="btn-storefront">
          🛍️ মূল শপে আরো পণ্য দেখুন (Israt BD Shop) &rarr;
        </a>

        <!-- Trust Features -->
        <div class="trust-box">
          <div class="trust-item">
            <span>🚚</span>
            <span><strong>ক্যাশ অন ডেলিভারি:</strong> সারা বাংলাদেশে পণ্য হাতে পেয়ে টাকা দিন</span>
          </div>
          <div class="trust-item">
            <span>🔄</span>
            <span><strong>৭ দিনের গ্যারান্টি:</strong> যেকোনো সমস্যায় দ্রুত ফ্রি রিপ্লেসমেন্ট</span>
          </div>
          <div class="trust-item">
            <span>📞</span>
            <span><strong>হটলাইন সাপোর্ট:</strong> ${escapeHtml(hotline)}</span>
          </div>
        </div>

        <!-- Description -->
        <div class="desc-section">
          <div class="desc-title">পণ্যের বিবরণ:</div>
          <p class="desc-text">${escapeHtml(product.fullDescBn || product.shortDescBn || cleanDesc)}</p>
        </div>
      </div>
    </div>

    <div class="footer-note">
      © ${new Date().getFullYear()} ${escapeHtml(shopName)} | বাংলাদেশের বিশ্বস্ত অনলাইন শপ
    </div>
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

  // 1. Seed with demo products first as reliable baseline
  for (const p of DEMO_PRODUCTS) {
    productsMap.set(p.id, p);
  }

  // 2. Query Firestore store settings and live products
  let storeSettings: any = null;
  try {
    const sDoc = await getDoc(doc(db, 'settings', 'store'));
    if (sDoc.exists()) {
      storeSettings = sDoc.data();
    }
  } catch (err) {
    console.warn('Could not query store settings during static share build:', err);
  }

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
    const html = buildProductHtml(product, storeSettings);

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
  const fallbackHtml = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>Israt BD Shop | ইসরাত বিডি শপ</title>
  <meta name="description" content="Israt BD Shop - বাংলাদেশের বিশ্বস্ত অনলাইন শপ। সাশ্রয়ী মূল্যে সেরা পণ্য ও ক্যাশ অন ডেলিভারি!">
  <style>
    body { font-family: sans-serif; text-align: center; padding: 3rem 1rem; background: #f8fafc; color: #1e293b; }
    a { display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #047857; color: white; border-radius: 0.5rem; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <h2>Israt BD Shop | ইসরাত বিডি শপ</h2>
  <p>অনলাইন শপে যেতে নিচের বাটনে ক্লিক করুন:</p>
  <a href="https://isratbdshop.blogspot.com/">মূল শপ ওপেন করুন &rarr;</a>
</body>
</html>`;
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
