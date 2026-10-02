import { Product, StoreSettings } from '../types';

export const DEFAULT_WHATSAPP_NUMBER = '+8801712345678';
export const DEFAULT_SHOP_PHONE = '01712-345678';
export const DEFAULT_SHOP_NAME = 'Israt BD Shop | ইসরাত বিডি শপ';
export const PUBLIC_BLOGGER_URL = 'https://isratbdshop.blogspot.com/';
export const GITHUB_PAGES_SHARE_BASE = 'https://nhmbd24.github.io/isratbdshop/share';

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

export function getProductShareUrl(productId: string): string {
  // Pre-rendered static HTML share page on GitHub Pages with server-readable Open Graph tags.
  // Facebook crawlers read the static OG tags and product image.
  // Human visitors are automatically redirected to https://isratbdshop.blogspot.com/#product-ID
  return `${GITHUB_PAGES_SHARE_BASE}/${encodeURIComponent(productId)}.html`;
}

export function generateDirectWhatsAppUrl(
  product: Product,
  whatsappNumber?: string,
  shopName?: string,
  selectedSize?: string,
  selectedColor?: string
): string {
  // Use WhatsApp number from Admin Settings, never hardcode
  const rawNumber = (whatsappNumber && whatsappNumber.trim()) || DEFAULT_WHATSAPP_NUMBER;
  let cleanPhone = rawNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
    cleanPhone = '88' + cleanPhone;
  }
  const storeName = shopName || 'ইসরাত বিডি শপ';

  // Safe Blogger hash deep-link that never triggers Blogger 404
  const productDirectUrl = `https://isratbdshop.blogspot.com/#product-${encodeURIComponent(product.id)}`;

  const variantParts = [
    selectedSize ? `সাইজ: ${selectedSize}` : '',
    selectedColor ? `কালার: ${selectedColor}` : '',
  ].filter(Boolean);
  const variantStr = variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';

  const originalPrice = product.originalPrice > 0 ? product.originalPrice : product.offerPrice;

  const lines = [
    storeName,
    '',
    `পণ্যের নাম: ${product.nameBn || product.name}${variantStr}`,
    `মূল্য: ${formatBDT(originalPrice)}`,
    `অফার মূল্য: ${formatBDT(product.offerPrice)}`,
    `ক্যাটাগরি: ${product.categoryBn || product.category}`,
    `পণ্যের লিংক: ${productDirectUrl}`,
    '',
    'আমি এই পণ্যটি অর্ডার করতে চাই।'
  ];

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export function generateProductWhatsAppUrl(
  product: Product,
  quantity = 1,
  selectedSize?: string,
  selectedColor?: string,
  whatsappNumber?: string,
  shopName?: string
): string {
  return generateDirectWhatsAppUrl(
    product,
    whatsappNumber,
    shopName,
    selectedSize,
    selectedColor
  );
}

export function openFacebookShare(product?: Product, customUrl?: string, shopName = DEFAULT_SHOP_NAME): void {
  let urlToShare = customUrl;
  if (!urlToShare) {
    urlToShare = product?.id ? getProductShareUrl(product.id) : PUBLIC_BLOGGER_URL;
  }

  const quote = product
    ? `${product.nameBn} - ${formatBDT(product.offerPrice)} | ${shopName}`
    : `${shopName} - বাংলাদেশের বিশ্বস্ত অনলাইন শপ। সাশ্রয়ী মূল্যে সেরা পণ্য ও ক্যাশ অন ডেলিভারি!`;

  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}&quote=${encodeURIComponent(quote)}`;
  window.open(shareUrl, '_blank', 'width=600,height=500');
}
