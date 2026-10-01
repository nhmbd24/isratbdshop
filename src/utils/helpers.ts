import { Product, StoreSettings } from '../types';

export const DEFAULT_WHATSAPP_NUMBER = '+8801712345678';
export const DEFAULT_SHOP_PHONE = '01712-345678';
export const DEFAULT_SHOP_NAME = 'Israt BD Shop | ইসরাত বিডি শপ';

export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
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

  const baseUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?product=${encodeURIComponent(product.id)}`
      : '';

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
    `পণ্যের লিংক: ${baseUrl}`,
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
  const urlToShare = customUrl || window.location.href;
  const quote = product
    ? `Check out ${product.nameBn} on ${shopName} at only ${formatBDT(product.offerPrice)}!`
    : `Shop premium lifestyle & authentic products at ${shopName}!`;

  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}&quote=${encodeURIComponent(quote)}`;
  window.open(shareUrl, '_blank', 'width=600,height=500');
}
