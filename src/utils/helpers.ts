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

  const variantParts = [
    selectedSize ? `সাইজ: ${selectedSize}` : '',
    selectedColor ? `কালার: ${selectedColor}` : '',
  ].filter(Boolean);
  const variantStr = variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';

  const originalPrice = product.originalPrice > 0 ? product.originalPrice : product.offerPrice;
  const shareUrl = getProductShareUrl(product.id);

  const lines = [
    storeName,
    '',
    `পণ্যের নাম: ${product.nameBn || product.name}${variantStr}`,
    `মূল্য: ${formatBDT(originalPrice)}`,
    `অফার মূল্য: ${formatBDT(product.offerPrice)}`,
    `ক্যাটাগরি: ${product.categoryBn || product.category}`,
    `পণ্য লিংক: ${shareUrl}`,
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

/**
 * Open Facebook Share Dialog.
 * The encoded 'u' parameter is guaranteed to be:
 * https://nhmbd24.github.io/isratbdshop/share/PRODUCT_ID.html
 */
export function openFacebookShare(product?: Product, customUrl?: string, shopName = DEFAULT_SHOP_NAME): void {
  const urlToShare = customUrl || (product?.id ? getProductShareUrl(product.id) : PUBLIC_BLOGGER_URL);

  const quote = product
    ? `${product.nameBn || product.name} - ${formatBDT(product.offerPrice)} | ${shopName}`
    : `${shopName} - বাংলাদেশের বিশ্বস্ত অনলাইন শপ। সাশ্রয়ী মূল্যে সেরা পণ্য ও ক্যাশ অন ডেলিভারি!`;

  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}&quote=${encodeURIComponent(quote)}`;
  if (typeof window !== 'undefined') {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  }
}

/**
 * Native Navigator Share helper (Mobile & Supported Browsers).
 * Shares the exact same GitHub Pages product share URL:
 * https://nhmbd24.github.io/isratbdshop/share/PRODUCT_ID.html
 */
export async function shareProductWithNavigator(
  product: Product,
  shopName = DEFAULT_SHOP_NAME
): Promise<boolean> {
  const shareUrl = getProductShareUrl(product.id);
  const title = `${product.nameBn || product.name} - ${formatBDT(product.offerPrice)} | ${shopName}`;
  const text = `${product.nameBn || product.name} - অফার মূল্য: ${formatBDT(product.offerPrice)} | ইসরাত বিডি শপ`;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
        url: shareUrl,
      });
      return true;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User cancelled native share sheet, do not open fallback popup
        return true;
      }
      console.warn('navigator.share rejected, using fallback:', err);
    }
  }
  return false;
}

/**
 * Universal product share handler used by all product Share buttons:
 * - Uses navigator.share() with GitHub Pages URL when available on mobile/supported devices.
 * - Otherwise opens Facebook sharer with u=https://nhmbd24.github.io/isratbdshop/share/PRODUCT_ID.html
 */
export async function handleProductShare(
  product: Product,
  shopName?: string
): Promise<void> {
  const handled = await shareProductWithNavigator(product, shopName);
  if (!handled) {
    openFacebookShare(product, undefined, shopName);
  }
}

