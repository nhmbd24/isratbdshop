import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from './config';
import { Product, Category, Banner, StoreSettings } from '../types';
import { DEMO_PRODUCTS } from '../data/products';

export const DEFAULT_SETTINGS: StoreSettings = {
  shopName: 'Israt BD Shop',
  shopNameBn: 'ইসরাত বিডি শপ',
  logo: '',
  whatsappNumber: '+8801712345678',
  phoneNumber: '01712-345678',
  facebookPage: 'https://facebook.com/isratbdshop',
  address: 'মিরপুর ১০, ঢাকা - ১২১৬, বাংলাদেশ',
  insideDhakaDeliveryCharge: 60,
  outsideDhakaDeliveryCharge: 120,
  freeDeliveryMinAmount: 3000,
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'fashion', name: 'Fashion & Sarees', nameBn: 'শাড়ি ও ফ্যাশন', icon: 'Shirt', isHidden: false, orderIndex: 1 },
  { id: 'electronics', name: 'Electronics & Gadgets', nameBn: 'গ্যাজেট ও টেক', icon: 'Smartphone', isHidden: false, orderIndex: 2 },
  { id: 'organic', name: 'Organic & Honey', nameBn: 'খাঁটি মধু ও ফুডস', icon: 'Leaf', isHidden: false, orderIndex: 3 },
  { id: 'lifestyle', name: 'Watch & Accessories', nameBn: 'ঘড়ি ও ব্যাগ', icon: 'Watch', isHidden: false, orderIndex: 4 },
  { id: 'home', name: 'Home & Kitchen', nameBn: 'হোম ও কিচেন', icon: 'Home', isHidden: false, orderIndex: 5 },
  { id: 'beauty', name: 'Beauty & Care', nameBn: 'বিউটি ও কেয়ার', icon: 'Heart', isHidden: false, orderIndex: 6 },
];

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    badge: '💥 স্পেশাল মেগা অফার - সীমিত সময়!',
    title: 'প্রিমিয়াম জামদানি ও উৎসব কালেকশন',
    subtitle: 'হাতে বোনা খাঁটি ঐতিহ্যবাহী শাড়ি ও পাঞ্জাবিতে আকর্ষণীয় ছাড়। সাথে পাচ্ছেন সারা বাংলাদেশে ক্যাশ অন ডেলিভারি!',
    ctaText: 'কালেকশন দেখুন',
    categoryTarget: 'fashion',
    bgGradient: 'from-rose-900 via-rose-800 to-amber-900',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    discountBadge: 'Up to ৫০% ছাড়',
    isHidden: false,
    orderIndex: 1,
  },
  {
    id: 'banner-2',
    badge: '⚡ ট্রেন্ডিং স্মার্ট গ্যাজেটস ২০২৬',
    title: 'স্মার্টওয়াচ, ইয়ারবাডস ও টেক এক্সেসরিজ',
    subtitle: 'অরিজিনাল ব্র্যান্ডের স্মার্ট গ্যাজেট দিয়ে আপনার জীবনকে করুন আরও স্মার্ট ও আধুনিক। ১ বছর রিপ্লেসমেন্ট ওয়ারেন্টি!',
    ctaText: 'গ্যাজেট দেখুন',
    categoryTarget: 'electronics',
    bgGradient: 'from-slate-900 via-teal-950 to-emerald-900',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80',
    discountBadge: 'শুরু মাত্র ৳৪৯৯ থেকে',
    isHidden: false,
    orderIndex: 2,
  },
  {
    id: 'banner-3',
    badge: '🌿 ১০০% অর্গানিক ও প্রাকৃতিক পণ্য',
    title: 'সুন্দরবনের খাঁটি কাঁচা মধু ও সরিষার তেল',
    subtitle: 'কোনো কেমিক্যাল বা প্রিজারভেটিভ ছাড়া সরাসরি সুন্দরবন থেকে মৌয়ালদের সংগ্রহ করা পুষ্টিকর প্রাকৃতিক মধু।',
    ctaText: 'অর্গানিক ফুড কিনুন',
    categoryTarget: 'organic',
    bgGradient: 'from-amber-950 via-amber-900 to-emerald-950',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1000&q=80',
    discountBadge: '১০০% বিশুদ্ধতার নিশ্চয়তা',
    isHidden: false,
    orderIndex: 3,
  },
];

// Helper to compress an image file for fast mobile upload
export function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.84
): Promise<{ blob: Blob; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    // Validate format
    const validExtensions = /\.(jpg|jpeg|png|webp)$/i;
    const isImage = file.type.startsWith('image/') || validExtensions.test(file.name);
    if (!isImage) {
      reject(new Error('অনুগ্রহ করে শুধুমাত্র JPG, JPEG, PNG অথবা WebP ফরম্যাটের ছবি নির্বাচন করুন।'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ফোন থেকে ছবির ফাইলটি রিড করা সম্ভব হয়নি।'));
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onerror = () => {
        // In case canvas image decoding fails, fallback to raw blob
        resolve({ blob: file, dataUrl: rawDataUrl });
      };
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ blob: file, dataUrl: rawDataUrl });
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedUrl = canvas.toDataURL('image/jpeg', quality);
                resolve({ blob, dataUrl: compressedUrl });
              } else {
                resolve({ blob: file, dataUrl: rawDataUrl });
              }
            },
            'image/jpeg',
            quality
          );
        } catch (e) {
          resolve({ blob: file, dataUrl: rawDataUrl });
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// Upload file to Firebase Storage with progress tracking, reasonable timeout, and reliable fallback
export async function uploadProductImage(
  file: File,
  folder = 'products',
  onProgress?: (percent: number) => void
): Promise<string> {
  // 1. Validation
  const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const extMatch = file.name.match(/\.(jpg|jpeg|png|webp)$/i);
  if (!validFormats.includes(file.type.toLowerCase()) && !extMatch) {
    throw new Error('শুধুমাত্র JPG, JPEG, PNG ও WebP ছবি গ্রহণযোগ্য।');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('ছবির সাইজ ১৫ মেগাবাইটের (15MB) কম হতে হবে।');
  }

  onProgress?.(10);

  // 2. Fast client-side compression for instant mobile readiness
  const { blob, dataUrl } = await compressImageFile(file);
  onProgress?.(30);

  // 3. Upload to Firebase Storage with strict 12s timeout
  const UPLOAD_TIMEOUT_MS = 12000;

  return new Promise<string>((resolve, reject) => {
    let isSettled = false;
    let timer: NodeJS.Timeout | null = null;

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const storageRef = ref(storage, `${folder}/${cleanFileName}`);

      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: blob.type || 'image/jpeg',
      });

      // Strict timeout to guarantee loading NEVER hangs indefinitely
      timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try {
            uploadTask.cancel();
          } catch (e) {
            // ignore
          }
          console.warn('Firebase Storage upload timed out after 12s. Fallback to optimized web image.');
          onProgress?.(100);
          resolve(dataUrl);
        }
      }, UPLOAD_TIMEOUT_MS);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0) {
            const rawProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 65; // from 30% to 95%
            onProgress?.(Math.min(96, Math.round(30 + rawProgress)));
          }
        },
        (error) => {
          if (isSettled) return;
          isSettled = true;
          if (timer) clearTimeout(timer);
          console.warn('Firebase Storage error encountered:', error);
          // If storage bucket is not available or blocked by CORS in preview, seamlessly use dataUrl
          if (dataUrl) {
            onProgress?.(100);
            resolve(dataUrl);
          } else {
            reject(new Error(`আপলোড ত্রুটি: ${error.message}`));
          }
        },
        async () => {
          if (isSettled) return;
          isSettled = true;
          if (timer) clearTimeout(timer);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.(100);
            resolve(downloadUrl);
          } catch (err: any) {
            onProgress?.(100);
            resolve(dataUrl);
          }
        }
      );
    } catch (err: any) {
      if (isSettled) return;
      isSettled = true;
      if (timer) clearTimeout(timer);
      console.warn('Failed to start storage task:', err);
      if (dataUrl) {
        onProgress?.(100);
        resolve(dataUrl);
      } else {
        reject(new Error(`আপলোড ব্যর্থ হয়েছে: ${err?.message || String(err)}`));
      }
    }
  });
}

// Backward-compatible alias
export async function uploadImage(file: File, folder = 'products'): Promise<string> {
  return uploadProductImage(file, folder);
}


// Seed initial products, categories, banners, settings if Firestore is empty
export async function seedInitialDataIfEmpty() {
  try {
    // 1. Check settings
    const settingsDoc = await getDoc(doc(db, 'settings', 'store_config'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'settings', 'store_config'), {
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Check categories
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), {
          ...cat,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 3. Check banners
    const bannerSnap = await getDocs(collection(db, 'banners'));
    if (bannerSnap.empty) {
      for (const b of DEFAULT_BANNERS) {
        await setDoc(doc(db, 'banners', b.id), {
          ...b,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 4. Check products
    const prodSnap = await getDocs(collection(db, 'products'));
    if (prodSnap.empty) {
      for (const p of DEMO_PRODUCTS) {
        const sanitizedSeed = sanitizeProductForFirestore({
          ...p,
          isHidden: false,
          isPopular: p.isFeatured || false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await setDoc(doc(db, 'products', p.id), sanitizedSeed);
      }
    }
  } catch (error) {
    console.error('Error during initial seed check:', error);
  }
}

/**
 * Sanitizes product data for Firestore setDoc/updateDoc:
 * - Strips any undefined fields, functions, non-serializable objects.
 * - Converts optional undefined/null values to safe defaults (empty string, empty array, false, 0).
 * - Ensures simple serializable values only (never Firebase Auth user / React objects).
 * - Saves only createdByUid / createdByEmail strings if admin info is available.
 */
export function sanitizeProductForFirestore(
  raw: Partial<Product> & { id: string },
  isNewProduct = false
): Record<string, any> {
  const cleanString = (val: unknown, fallback = ''): string => {
    if (typeof val === 'string') return val;
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return fallback;
  };

  const cleanNumber = (val: unknown, fallback = 0): number => {
    if (typeof val === 'number') return isNaN(val) ? fallback : val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  const cleanBoolean = (val: unknown, fallback = false): boolean => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return fallback;
  };

  const cleanStringArray = (val: unknown): string[] => {
    if (!Array.isArray(val)) return [];
    return val
      .map((item) => (typeof item === 'string' ? item.trim() : typeof item === 'number' ? String(item) : ''))
      .filter((item) => Boolean(item));
  };

  const cleanSpecsMap = (val: unknown): Record<string, string> => {
    if (!val || typeof val !== 'object' || Array.isArray(val)) return {};
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(val as Record<string, unknown>)) {
      if (typeof key === 'string' && key.trim()) {
        const cleanVal = cleanString(value, '').trim();
        if (cleanVal) {
          result[key.trim()] = cleanVal;
        }
      }
    }
    return result;
  };

  const cleanId = cleanString(raw.id, 'prod-' + Date.now());
  const cleanNameBn = cleanString(raw.nameBn, cleanString(raw.name, 'পণ্য')).trim();
  const cleanName = cleanString(raw.name, cleanNameBn).trim();

  const sanitized: Record<string, any> = {
    id: cleanId,
    name: cleanName || cleanNameBn || 'Product',
    nameBn: cleanNameBn || cleanName || 'পণ্য',
    category: cleanString(raw.category, 'fashion').trim(),
    categoryBn: cleanString(raw.categoryBn, 'শাড়ি ও ফ্যাশন').trim(),
    originalPrice: cleanNumber(raw.originalPrice, 0),
    offerPrice: cleanNumber(raw.offerPrice, 0),
    discountPercent: cleanNumber(raw.discountPercent, 0),
    rating: cleanNumber(raw.rating, 5.0),
    reviewCount: cleanNumber(raw.reviewCount, 1),
    image: cleanString(raw.image, '').trim(),
    additionalImages: cleanStringArray(raw.additionalImages),
    inStock: cleanBoolean(raw.inStock, true),
    stockCount: cleanNumber(raw.stockCount, 50),
    isFeatured: cleanBoolean(raw.isFeatured, false),
    isPopular: cleanBoolean(raw.isPopular, false),
    isHotDeal: cleanBoolean(raw.isHotDeal, false),
    isHidden: cleanBoolean(raw.isHidden, false),
    shortDesc: cleanString(raw.shortDesc, '').trim(),
    shortDescBn: cleanString(raw.shortDescBn, cleanNameBn).trim(),
    fullDescBn: cleanString(raw.fullDescBn, '').trim(),
    specifications: cleanSpecsMap(raw.specifications),
    availableSizes: cleanStringArray(raw.availableSizes),
    availableColors: cleanStringArray(raw.availableColors),
    warrantyDetails: cleanString(raw.warrantyDetails, '').trim(),
    guaranteeDetails: cleanString(raw.guaranteeDetails, '').trim(),
    expiryDetails: cleanString(raw.expiryDetails, '').trim(),
    deliveryInfo: cleanString(raw.deliveryInfo, '').trim(),
  };

  // Safe string timestamps
  if (typeof raw.createdAt === 'string' && raw.createdAt.trim()) {
    sanitized.createdAt = raw.createdAt.trim();
  }
  if (typeof raw.updatedAt === 'string' && raw.updatedAt.trim()) {
    sanitized.updatedAt = raw.updatedAt.trim();
  }

  // Safe admin audit metadata (strings only, NEVER auth/user objects)
  if (typeof raw.createdByUid === 'string' && raw.createdByUid.trim()) {
    sanitized.createdByUid = raw.createdByUid.trim();
  }
  if (typeof raw.createdByEmail === 'string' && raw.createdByEmail.trim()) {
    sanitized.createdByEmail = raw.createdByEmail.trim();
  }

  // Audit user from current auth session (strings only)
  try {
    const user = auth.currentUser;
    if (user?.uid) {
      if (isNewProduct && !sanitized.createdByUid) {
        sanitized.createdByUid = String(user.uid);
      }
      if (isNewProduct && user.email && !sanitized.createdByEmail) {
        sanitized.createdByEmail = String(user.email);
      }
      sanitized.updatedByUid = String(user.uid);
      if (user.email) {
        sanitized.updatedByEmail = String(user.email);
      }
    }
  } catch (e) {
    // Non-fatal if auth inspection fails
  }

  // Final check: Remove any residual key that has undefined value or function
  const finalDoc: Record<string, any> = {};
  for (const [k, v] of Object.entries(sanitized)) {
    if (v !== undefined && typeof v !== 'function' && typeof v !== 'symbol') {
      finalDoc[k] = v;
    }
  }

  return finalDoc;
}

// Real-time Listeners
export function subscribeToProducts(callback: (products: Product[]) => void) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((d) => {
        prods.push({ id: d.id, ...d.data() } as Product);
      });
      callback(prods);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToCategories(callback: (categories: Category[]) => void) {
  const path = 'categories';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((d) => {
        cats.push({ id: d.id, ...d.data() } as Category);
      });
      cats.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      callback(cats);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToBanners(callback: (banners: Banner[]) => void) {
  const path = 'banners';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const banners: Banner[] = [];
      snapshot.forEach((d) => {
        banners.push({ id: d.id, ...d.data() } as Banner);
      });
      banners.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      callback(banners);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToSettings(callback: (settings: StoreSettings) => void) {
  const path = 'settings';
  return onSnapshot(
    doc(db, path, 'store_config'),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as StoreSettings);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${path}/store_config`);
    }
  );
}

// Product CRUD
export async function saveProduct(product: Partial<Product> & { id: string }) {
  const path = 'products';
  if (!product || !product.id) {
    throw new Error('পণ্য আইডি (Product ID) পাওয়া যায়নি।');
  }

  try {
    const docRef = doc(db, path, product.id);
    const existing = await getDoc(docRef);
    const now = new Date().toISOString();
    const isNew = !existing.exists();

    // Sanitize and purge any undefined values, functions, or complex auth objects
    const sanitized = sanitizeProductForFirestore(product, isNew);

    if (!isNew) {
      sanitized.updatedAt = now;
      const existingData = existing.data();
      if (!sanitized.createdAt && existingData?.createdAt) {
        sanitized.createdAt = existingData.createdAt;
      }
      if (!sanitized.createdByUid && existingData?.createdByUid) {
        sanitized.createdByUid = existingData.createdByUid;
      }
      if (!sanitized.createdByEmail && existingData?.createdByEmail) {
        sanitized.createdByEmail = existingData.createdByEmail;
      }
      await setDoc(docRef, sanitized, { merge: true });
    } else {
      sanitized.createdAt = sanitized.createdAt || now;
      sanitized.updatedAt = now;
      await setDoc(docRef, sanitized);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${product.id}`);
  }
}

export async function deleteProduct(productId: string) {
  const path = 'products';
  if (!productId || typeof productId !== 'string') {
    throw new Error('পণ্য আইডি (Product ID) অনুপস্থিত।');
  }

  try {
    const docRef = doc(db, path, productId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const allImages = [data?.image, ...(data?.additionalImages || [])].filter(Boolean);
      for (const imgUrl of allImages) {
        if (typeof imgUrl === 'string' && imgUrl.includes('firebasestorage.googleapis.com')) {
          try {
            const storageFileRef = ref(storage, imgUrl);
            await deleteObject(storageFileRef);
          } catch (storageErr) {
            console.warn('Storage image cleanup non-fatal warning:', storageErr);
          }
        }
      }
    }

    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${productId}`);
    throw error;
  }
}

// Category CRUD
export async function saveCategory(category: Category) {
  const path = 'categories';
  try {
    const docRef = doc(db, path, category.id);
    await setDoc(docRef, {
      ...category,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${category.id}`);
  }
}

export async function deleteCategory(categoryId: string) {
  const path = 'categories';
  if (!categoryId || typeof categoryId !== 'string') {
    throw new Error('ক্যাটাগরি আইডি (Category ID) অনুপস্থিত।');
  }

  try {
    const docRef = doc(db, path, categoryId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const imgUrl = data?.image;
      if (typeof imgUrl === 'string' && imgUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const storageFileRef = ref(storage, imgUrl);
          await deleteObject(storageFileRef);
        } catch (storageErr) {
          console.warn('Storage category image cleanup non-fatal warning:', storageErr);
        }
      }
    }

    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${categoryId}`);
    throw error;
  }
}

// Banner CRUD
export async function saveBanner(banner: Banner) {
  const path = 'banners';
  try {
    const docRef = doc(db, path, banner.id);
    await setDoc(docRef, {
      ...banner,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${banner.id}`);
  }
}

export async function deleteBanner(bannerId: string) {
  const path = 'banners';
  if (!bannerId || typeof bannerId !== 'string') {
    throw new Error('ব্যানার আইডি (Banner ID) অনুপস্থিত।');
  }

  try {
    const docRef = doc(db, path, bannerId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      const imgUrl = data?.image;
      if (typeof imgUrl === 'string' && imgUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const storageFileRef = ref(storage, imgUrl);
          await deleteObject(storageFileRef);
        } catch (storageErr) {
          console.warn('Storage banner image cleanup non-fatal warning:', storageErr);
        }
      }
    }

    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${bannerId}`);
    throw error;
  }
}

// Settings CRUD
export async function saveSettings(settings: StoreSettings) {
  const path = 'settings';
  try {
    await setDoc(doc(db, path, 'store_config'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/store_config`);
  }
}
