// Dynamic pricing based on timezone and location
export interface PricingConfig {
  basePrice: number
  currency: string
  timezone: string
  location: string
  exchangeRates: Record<string, number>
}

export interface PriceAdjustment {
  factor: number
  reason: string
}

// Currency exchange rates (mock data - in production, use real API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  CAD: 1.35,
  AUD: 1.52,
  NGN: 460.0,
  KES: 110.0,
  ZAR: 18.5,
  GHS: 6.2,
  EGP: 31.0
}

// Regional pricing adjustments
const REGIONAL_ADJUSTMENTS: Record<string, PriceAdjustment> = {
  'Africa': { factor: 0.8, reason: 'Regional pricing for African markets' },
  'Europe': { factor: 1.1, reason: 'Premium pricing for European markets' },
  'North America': { factor: 1.0, reason: 'Standard pricing' },
  'Asia': { factor: 0.9, reason: 'Competitive pricing for Asian markets' }
}

// Time-based pricing adjustments
const TIME_ADJUSTMENTS: Record<string, PriceAdjustment> = {
  'peak': { factor: 1.15, reason: 'Peak shopping hours' },
  'off-peak': { factor: 0.95, reason: 'Off-peak discount' },
  'holiday': { factor: 1.2, reason: 'Holiday premium pricing' }
}

export class DynamicPricing {
  private config: PricingConfig

  constructor(config: PricingConfig) {
    this.config = config
  }

  /**
   * Get user's timezone from browser
   */
  static getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  /**
   * Get user's location from timezone
   */
  static getLocationFromTimezone(timezone: string): string {
    const regionMap: Record<string, string> = {
      'Africa/': 'Africa',
      'Europe/': 'Europe',
      'America/': 'North America',
      'Asia/': 'Asia',
      'Australia/': 'Australia'
    }

    for (const [prefix, region] of Object.entries(regionMap)) {
      if (timezone.startsWith(prefix)) {
        return region
      }
    }
    return 'North America' // Default
  }

  /**
   * Get current time period for pricing
   */
  static getTimePeriod(): string {
    const hour = new Date().getHours()
    const day = new Date().getDay()
    
    // Check for holidays (simplified)
    const isHoliday = this.isHoliday()
    if (isHoliday) return 'holiday'
    
    // Peak hours: 10 AM - 2 PM and 6 PM - 9 PM
    if ((hour >= 10 && hour <= 14) || (hour >= 18 && hour <= 21)) {
      return 'peak'
    }
    
    return 'off-peak'
  }

  /**
   * Check if current date is a holiday (simplified)
   */
  private static isHoliday(): boolean {
    const now = new Date()
    const month = now.getMonth()
    const day = now.getDate()
    
    // Major shopping holidays
    const holidays = [
      { month: 11, day: 25 }, // Christmas
      { month: 0, day: 1 },   // New Year
      { month: 1, day: 14 },  // Valentine's Day
      { month: 4, day: 12 },  // Mother's Day (approximate)
      { month: 10, day: 24 }  // Black Friday (approximate)
    ]
    
    return holidays.some(holiday => holiday.month === month && holiday.day === day)
  }

  /**
   * Calculate dynamic price
   */
  calculatePrice(): {
    originalPrice: number
    adjustedPrice: number
    currency: string
    adjustments: PriceAdjustment[]
    exchangeRate: number
  } {
    const adjustments: PriceAdjustment[] = []
    let adjustedPrice = this.config.basePrice

    // Apply regional adjustment
    const region = DynamicPricing.getLocationFromTimezone(this.config.timezone)
    const regionalAdjustment = REGIONAL_ADJUSTMENTS[region]
    if (regionalAdjustment) {
      adjustedPrice *= regionalAdjustment.factor
      adjustments.push(regionalAdjustment)
    }

    // Apply time-based adjustment
    const timePeriod = DynamicPricing.getTimePeriod()
    const timeAdjustment = TIME_ADJUSTMENTS[timePeriod]
    if (timeAdjustment) {
      adjustedPrice *= timeAdjustment.factor
      adjustments.push(timeAdjustment)
    }

    // Apply currency conversion
    const exchangeRate = EXCHANGE_RATES[this.config.currency] || 1.0
    const finalPrice = adjustedPrice * exchangeRate

    return {
      originalPrice: this.config.basePrice,
      adjustedPrice: Math.round(finalPrice * 100) / 100,
      currency: this.config.currency,
      adjustments,
      exchangeRate
    }
  }

  /**
   * Format price for display
   */
  static formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  /**
   * Get price explanation for user
   */
  getPriceExplanation(): string {
    const pricing = this.calculatePrice()
    const explanations = pricing.adjustments.map(adj => adj.reason)
    
    if (explanations.length === 0) {
      return `Standard pricing in ${pricing.currency}`
    }
    
    return `Price adjusted for: ${explanations.join(', ')}`
  }
}

// Utility functions for easy use
export function getDynamicPrice(basePrice: number, currency: string = 'USD'): {
  price: number
  formattedPrice: string
  explanation: string
} {
  const timezone = DynamicPricing.getUserTimezone()
  const pricing = new DynamicPricing({
    basePrice,
    currency,
    timezone,
    location: DynamicPricing.getLocationFromTimezone(timezone),
    exchangeRates: EXCHANGE_RATES
  })

  const result = pricing.calculatePrice()
  
  return {
    price: result.adjustedPrice,
    formattedPrice: DynamicPricing.formatPrice(result.adjustedPrice, currency),
    explanation: pricing.getPriceExplanation()
  }
}

// Hook for React components
export function useDynamicPricing(basePrice: number, currency: string = 'USD') {
  return getDynamicPrice(basePrice, currency)
}
