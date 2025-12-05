// SEO and accessibility utilities

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  siteName?: string
  locale?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export interface ProductSEO extends SEOConfig {
  type: 'product'
  price?: number
  currency?: string
  availability?: 'in_stock' | 'out_of_stock' | 'preorder'
  condition?: 'new' | 'used' | 'refurbished'
  brand?: string
  sku?: string
  category?: string
  rating?: number
  reviewCount?: number
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export class SEOService {
  private defaultConfig: Partial<SEOConfig>

  constructor(defaultConfig: Partial<SEOConfig> = {}) {
    this.defaultConfig = {
      siteName: 'Tac Accessories',
      locale: 'en_US',
      type: 'website',
      ...defaultConfig
    }
  }

  /**
   * Generate meta tags for a page
   */
  generateMetaTags(config: SEOConfig): Record<string, string> {
    const fullConfig = { ...this.defaultConfig, ...config }
    
    return {
      title: fullConfig.title,
      description: fullConfig.description,
      keywords: fullConfig.keywords?.join(', ') || '',
      'og:title': fullConfig.title,
      'og:description': fullConfig.description,
      'og:image': fullConfig.image || '/og-image.jpg',
      'og:url': fullConfig.url || '',
      'og:type': fullConfig.type || 'website',
      'og:site_name': fullConfig.siteName || 'Tac Accessories',
      'og:locale': fullConfig.locale || 'en_US',
      'twitter:card': 'summary_large_image',
      'twitter:title': fullConfig.title,
      'twitter:description': fullConfig.description,
      'twitter:image': fullConfig.image || '/og-image.jpg',
      'twitter:site': '@tacaccessories',
      'twitter:creator': '@tacaccessories'
    }
  }

  /**
   * Generate structured data for a product
   */
  generateProductStructuredData(product: ProductSEO): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: product.image,
      url: product.url,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'Tac Accessories'
      },
      sku: product.sku,
      category: product.category,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: `https://schema.org/${product.availability || 'InStock'}`,
        condition: `https://schema.org/${product.condition || 'NewCondition'}`,
        seller: {
          '@type': 'Organization',
          name: 'Tac Accessories'
        }
      },
      aggregateRating: product.rating && product.reviewCount ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount
      } : undefined
    }
  }

  /**
   * Generate structured data for breadcrumbs
   */
  generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    }
  }

  /**
   * Generate structured data for organization
   */
  generateOrganizationStructuredData(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Tac Accessories',
      description: 'Afrocentric jewelry and accessories celebrating African heritage',
      url: 'https://tacaccessories.com',
      logo: 'https://tacaccessories.com/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-TAC-ACCESSORIES',
        contactType: 'customer service',
        availableLanguage: ['English', 'French', 'Swahili']
      },
      sameAs: [
        'https://facebook.com/tacaccessories',
        'https://instagram.com/tacaccessories',
        'https://twitter.com/tacaccessories'
      ]
    }
  }

  /**
   * Generate structured data for website
   */
  generateWebsiteStructuredData(): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Tac Accessories',
      description: 'Afrocentric jewelry and accessories celebrating African heritage',
      url: 'https://tacaccessories.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://tacaccessories.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  }

  /**
   * Generate sitemap data
   */
  generateSitemapData(pages: Array<{
    url: string
    lastModified: string
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
    priority: number
  }>): string {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    
    return sitemap
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: https://tacaccessories.com/sitemap.xml

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /auth/
`
  }
}

// Accessibility utilities
export class AccessibilityService {
  /**
   * Generate ARIA labels for common elements
   */
  static generateAriaLabels = {
    navigation: (currentPage?: string) => ({
      'aria-label': 'Main navigation',
      'aria-current': currentPage ? 'page' : undefined
    }),
    
    button: (action: string, context?: string) => ({
      'aria-label': context ? `${action} ${context}` : action
    }),
    
    form: (purpose: string) => ({
      'aria-label': `${purpose} form`,
      role: 'form'
    }),
    
    search: () => ({
      'aria-label': 'Search products',
      'aria-describedby': 'search-help'
    }),
    
    cart: (itemCount: number) => ({
      'aria-label': `Shopping cart with ${itemCount} items`,
      'aria-live': 'polite'
    }),
    
    product: (name: string, price: string) => ({
      'aria-label': `Product: ${name}, Price: ${price}`
    }),
    
    rating: (rating: number, maxRating: number = 5) => ({
      'aria-label': `${rating} out of ${maxRating} stars`,
      role: 'img'
    })
  }

  /**
   * Generate focus management utilities
   */
  static focusManagement = {
    trapFocus: (element: HTMLElement) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
      
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus()
              e.preventDefault()
            }
          }
        }
      }
      
      element.addEventListener('keydown', handleTabKey)
      firstElement?.focus()
      
      return () => {
        element.removeEventListener('keydown', handleTabKey)
      }
    },
    
    restoreFocus: (previousElement: HTMLElement | null) => {
      if (previousElement) {
        previousElement.focus()
      }
    }
  }

  /**
   * Generate keyboard navigation utilities
   */
  static keyboardNavigation = {
    handleArrowKeys: (
      elements: HTMLElement[],
      onSelect: (element: HTMLElement, index: number) => void
    ) => {
      let currentIndex = 0
      
      return (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault()
            currentIndex = Math.min(currentIndex + 1, elements.length - 1)
            onSelect(elements[currentIndex], currentIndex)
            break
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault()
            currentIndex = Math.max(currentIndex - 1, 0)
            onSelect(elements[currentIndex], currentIndex)
            break
          case 'Home':
            e.preventDefault()
            currentIndex = 0
            onSelect(elements[currentIndex], currentIndex)
            break
          case 'End':
            e.preventDefault()
            currentIndex = elements.length - 1
            onSelect(elements[currentIndex], currentIndex)
            break
        }
      }
    },
    
    handleEscape: (callback: () => void) => {
      return (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          callback()
        }
      }
    }
  }

  /**
   * Generate screen reader utilities
   */
  static screenReader = {
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', priority)
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = message
      
      document.body.appendChild(announcement)
      
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    },
    
    hideFromScreenReader: (element: HTMLElement) => {
      element.setAttribute('aria-hidden', 'true')
    },
    
    showToScreenReader: (element: HTMLElement) => {
      element.removeAttribute('aria-hidden')
    }
  }
}

// Utility functions
export function getDefaultSEOConfig(): Partial<SEOConfig> {
  return {
    siteName: 'TAC Accessories',
    locale: 'en_US',
    type: 'website',
    keywords: [
      'afrocentric jewelry',
      'african accessories',
      'handcrafted jewelry',
      'cultural jewelry',
      'african heritage',
      'gold jewelry',
      'bronze jewelry',
      'emerald jewelry',
      'luxury accessories'
    ]
  }
}

// React hook for SEO
export function useSEO() {
  const seoService = new SEOService(getDefaultSEOConfig())

  const generateMetaTags = (config: SEOConfig) => {
    return seoService.generateMetaTags(config)
  }

  const generateProductStructuredData = (product: ProductSEO) => {
    return seoService.generateProductStructuredData(product)
  }

  const generateBreadcrumbStructuredData = (breadcrumbs: BreadcrumbItem[]) => {
    return seoService.generateBreadcrumbStructuredData(breadcrumbs)
  }

  return {
    generateMetaTags,
    generateProductStructuredData,
    generateBreadcrumbStructuredData
  }
}

// Common SEO configurations
export const SEO_PRESETS = {
  home: {
    title: 'Tac Accessories - Afrocentric Jewelry & Accessories',
    description: 'Discover our exquisite collection of handcrafted Afrocentric jewelry and accessories. Celebrating African heritage through modern luxury.',
    keywords: ['afrocentric jewelry', 'african accessories', 'handcrafted jewelry', 'cultural jewelry']
  },
  
  products: {
    title: 'Products - Tac Accessories',
    description: 'Browse our complete collection of Afrocentric jewelry and accessories. From gold necklaces to bronze bracelets, find your perfect piece.',
    keywords: ['afrocentric jewelry', 'gold jewelry', 'bronze jewelry', 'emerald jewelry']
  },
  
  about: {
    title: 'About Us - Tac Accessories',
    description: 'Learn about Tac Accessories and our mission to celebrate African heritage through beautiful, handcrafted jewelry and accessories.',
    keywords: ['about tac accessories', 'african heritage', 'handcrafted jewelry', 'cultural mission']
  },
  
  contact: {
    title: 'Contact Us - Tac Accessories',
    description: 'Get in touch with Tac Accessories. We\'re here to help with your jewelry needs and answer any questions about our products.',
    keywords: ['contact tac accessories', 'customer service', 'jewelry support']
  }
}
