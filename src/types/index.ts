export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  originalPrice: number;
  offerPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  image: string;
  additionalImages?: string[];
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  isHotDeal?: boolean;
  isPopular?: boolean;
  isHidden?: boolean;
  shortDesc: string;
  shortDescBn: string;
  fullDescBn: string;
  specifications: { [key: string]: string };
  availableSizes?: string[];
  availableColors?: string[];
  warrantyDetails?: string;
  guaranteeDetails?: string;
  expiryDetails?: string;
  deliveryInfo?: string;
  createdAt?: string;
  updatedAt?: string;
  createdByUid?: string;
  createdByEmail?: string;
  updatedByUid?: string;
  updatedByEmail?: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  image?: string;
  isHidden?: boolean;
  orderIndex?: number;
}

export interface Banner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  categoryTarget: string;
  bgGradient: string;
  image: string;
  discountBadge: string;
  isHidden?: boolean;
  orderIndex?: number;
}

export interface StoreSettings {
  shopName: string;
  shopNameBn: string;
  logo: string;
  whatsappNumber: string;
  phoneNumber: string;
  facebookPage: string;
  address: string;
  insideDhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  freeDeliveryMinAmount: number;
  updatedAt?: string;
}
