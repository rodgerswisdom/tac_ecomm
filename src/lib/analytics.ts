/**
 * Google Analytics 4 Tracking Utilities
 *
 * Uses Next.js @next/third-parties sendGAEvent for type-safe event tracking.
 * All tracking automatically respects production/development environments.
 */

import { sendGAEvent } from '@next/third-parties/google';

// Type definitions for GA4 events
export type GAEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export type EcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_brand?: string;
  item_variant?: string;
  discount?: number;
};

export type Product = {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  image?: string;
  slug?: string;
};

export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  originalPrice?: number;
  category?: string;
};

export type Order = {
  id: string;
  total: number;
  tax?: number;
  shipping?: number;
  currency?: string;
  items: CartItem[];
  coupon?: string;
};

/**
 * Core tracking function - sends events to GA4 using Next.js sendGAEvent
 */
export const trackEvent = (eventName: string, params?: Record<string, any>): void => {
  // 💡 Prevent logging events during local development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[GA4 Debug] Event: ${eventName}`, params);
    return;
  }

  try {
    sendGAEvent('event', eventName, params);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Track page views
 */
export const trackPageView = (url: string, title?: string): void => {
  trackEvent('page_view', {
    page_path: url,
    page_title: title,
  });
};

/**
 * Convert product to GA4 item format
 */
const productToItem = (product: Product, quantity: number = 1): EcommerceItem => {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? product.originalPrice - product.price
    : 0;

  return {
    item_id: String(product.id),
    item_name: product.name,
    price: product.price,
    quantity,
    item_category: product.category,
    item_brand: 'TAC Accessories',
    discount: discount > 0 ? discount : undefined,
  };
};

/**
 * Convert cart item to GA4 item format
 */
const cartItemToItem = (item: CartItem): EcommerceItem => {
  const discount = item.originalPrice && item.originalPrice > item.price
    ? item.originalPrice - item.price
    : 0;

  return {
    item_id: String(item.id),
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    item_category: item.category,
    item_brand: 'TAC Accessories',
    discount: discount > 0 ? discount : undefined,
  };
};

/**
 * Track product detail view
 * Fire this when a user views a product page
 */
export const trackViewItem = (product: Product): void => {
  trackEvent('view_item', {
    currency: 'KES',
    value: product.price,
    items: [productToItem(product)],
  });
};

/**
 * Track add to cart event
 * Fire this when a user adds an item to their cart
 */
export const trackAddToCart = (product: Product, quantity: number = 1): void => {
  trackEvent('add_to_cart', {
    currency: 'KES',
    value: product.price * quantity,
    items: [productToItem(product, quantity)],
  });
};

/**
 * Track remove from cart event
 * Fire this when a user removes an item from their cart
 */
export const trackRemoveFromCart = (product: Product | CartItem, quantity: number = 1): void => {
  const item = 'quantity' in product 
    ? cartItemToItem(product)
    : productToItem(product, quantity);

  trackEvent('remove_from_cart', {
    currency: 'KES',
    value: item.price * item.quantity,
    items: [item],
  });
};

/**
 * Track begin checkout event
 * Fire this when a user starts the checkout process
 */
export const trackBeginCheckout = (items: CartItem[], total: number, coupon?: string): void => {
  trackEvent('begin_checkout', {
    currency: 'KES',
    value: total,
    coupon,
    items: items.map(cartItemToItem),
  });
};

/**
 * Track purchase completion
 * Fire this when an order is successfully completed
 */
export const trackPurchase = (order: Order): void => {
  trackEvent('purchase', {
    transaction_id: order.id,
    value: order.total,
    tax: order.tax || 0,
    shipping: order.shipping || 0,
    currency: order.currency || 'KES',
    coupon: order.coupon,
    items: order.items.map(cartItemToItem),
  });
};

/**
 * Track search events
 * Fire this when a user performs a search
 */
export const trackSearch = (searchTerm: string, resultsCount?: number): void => {
  trackEvent('search', {
    search_term: searchTerm,
    ...(resultsCount !== undefined && { results_count: resultsCount }),
  });
};

/**
 * Track view item list (collection/category view)
 * Fire this when a user views a collection or category page
 */
export const trackViewItemList = (
  listName: string,
  items: Product[],
  listId?: string
): void => {
  trackEvent('view_item_list', {
    item_list_id: listId,
    item_list_name: listName,
    items: items.slice(0, 10).map((product, index) => ({
      ...productToItem(product),
      index,
    })),
  });
};

/**
 * Track item list click
 * Fire this when a user clicks on a product in a list
 */
export const trackSelectItem = (
  product: Product,
  listName: string,
  index: number
): void => {
  trackEvent('select_item', {
    item_list_name: listName,
    items: [{
      ...productToItem(product),
      index,
    }],
  });
};

/**
 * Track custom events
 * Use this for any custom tracking needs
 */
export const trackCustomEvent = (
  eventName: string,
  category: string,
  label?: string,
  value?: number
): void => {
  trackEvent(eventName, {
    event_category: category,
    event_label: label,
    value,
  });
};

/**
 * Track user engagement
 * Fire this for important user interactions
 */
export const trackEngagement = (
  action: string,
  category: string,
  label?: string
): void => {
  trackEvent('engagement', {
    engagement_type: action,
    engagement_category: category,
    engagement_label: label,
  });
};

/**
 * Track newsletter signup
 */
export const trackNewsletterSignup = (method: string = 'footer'): void => {
  trackEvent('sign_up', {
    method,
  });
};

/**
 * Track social share
 */
export const trackShare = (
  contentType: string,
  itemId: string,
  method: string
): void => {
  trackEvent('share', {
    content_type: contentType,
    item_id: itemId,
    method,
  });
};

/**
 * Track wishlist add
 */
export const trackAddToWishlist = (product: Product): void => {
  trackEvent('add_to_wishlist', {
    currency: 'KES',
    value: product.price,
    items: [productToItem(product)],
  });
};

/**
 * Track form submission
 */
export const trackFormSubmit = (formName: string, formId?: string): void => {
  trackEvent('form_submit', {
    form_name: formName,
    form_id: formId,
  });
};

/**
 * Track video play
 */
export const trackVideoPlay = (videoTitle: string, videoUrl: string): void => {
  trackEvent('video_start', {
    video_title: videoTitle,
    video_url: videoUrl,
  });
};

/**
 * Track file download
 */
export const trackDownload = (fileName: string, fileType: string): void => {
  trackEvent('file_download', {
    file_name: fileName,
    file_extension: fileType,
  });
};

