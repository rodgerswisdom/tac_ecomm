// Shipping integration utilities

export interface ShippingAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export interface ShippingItem {
  name: string
  sku: string
  quantity: number
  weight: number // in pounds
  value: number // in USD
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

export interface ShippingRate {
  service: string
  carrier: string
  rate: number
  currency: string
  estimatedDays: number
  serviceCode: string
}

export interface ShippingLabel {
  trackingNumber: string
  labelUrl: string
  trackingUrl: string
  estimatedDelivery: string
}

export interface Shipment {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'exception'
  trackingNumber?: string
  carrier?: string
  service?: string
  estimatedDelivery?: string
  actualDelivery?: string
  events: ShippingEvent[]
}

export interface ShippingEvent {
  timestamp: string
  status: string
  location: string
  description: string
}

// ShipEngine Integration
export class ShipEngineService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.shipengine.com/v1'
  }

  async getRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    items: ShippingItem[]
  ): Promise<ShippingRate[]> {
    try {
      const requestData = {
        shipment: {
          ship_to: this.formatAddress(toAddress),
          ship_from: this.formatAddress(fromAddress),
          packages: items.map(item => ({
            weight: {
              value: item.weight,
              unit: 'pound'
            },
            dimensions: item.dimensions ? {
              length: item.dimensions.length,
              width: item.dimensions.width,
              height: item.dimensions.height,
              unit: 'inch'
            } : undefined
          }))
        },
        rate_options: {
          carrier_ids: ['se-123456', 'se-789012'], // UPS, FedEx
          service_codes: ['ups_ground', 'fedex_ground', 'ups_2nd_day_air', 'fedex_2_day']
        }
      }

      // Mock API call
      const response = await this.simulateApiCall('/rates', requestData)
      
      return response.rates.map((rate: any) => ({
        service: rate.service_type,
        carrier: rate.carrier_friendly_name,
        rate: parseFloat(rate.shipping_amount.amount),
        currency: rate.shipping_amount.currency,
        estimatedDays: this.getEstimatedDays(rate.service_type),
        serviceCode: rate.service_code
      }))
    } catch (error) {
      console.error('Error getting shipping rates:', error)
      return this.getFallbackRates()
    }
  }

  async createShipment(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    items: ShippingItem[],
    serviceCode: string
  ): Promise<Shipment> {
    try {
      const requestData = {
        shipment: {
          ship_to: this.formatAddress(toAddress),
          ship_from: this.formatAddress(fromAddress),
          packages: items.map(item => ({
            weight: {
              value: item.weight,
              unit: 'pound'
            },
            dimensions: item.dimensions ? {
              length: item.dimensions.length,
              width: item.dimensions.width,
              height: item.dimensions.height,
              unit: 'inch'
            } : undefined
          })),
          service_code: serviceCode
        }
      }

      const response = await this.simulateApiCall('/shipments', requestData)
      
      return {
        id: response.shipment_id,
        status: 'processing',
        trackingNumber: response.tracking_number,
        carrier: response.carrier_id,
        service: response.service_code,
        estimatedDelivery: this.calculateEstimatedDelivery(response.service_code),
        events: []
      }
    } catch (error) {
      throw new Error('Failed to create shipment')
    }
  }

  async getTrackingInfo(trackingNumber: string): Promise<Shipment> {
    try {
      const response = await this.simulateApiCall(`/tracking?tracking_number=${trackingNumber}`, {})
      
      return {
        id: response.shipment_id,
        status: this.mapTrackingStatus(response.status),
        trackingNumber: trackingNumber,
        carrier: response.carrier_id,
        service: response.service_code,
        estimatedDelivery: response.estimated_delivery_date,
        actualDelivery: response.actual_delivery_date,
        events: response.tracking_events.map((event: any) => ({
          timestamp: event.occurred_at,
          status: event.status_code,
          location: event.city + ', ' + event.state,
          description: event.description
        }))
      }
    } catch (error) {
      throw new Error('Failed to get tracking information')
    }
  }

  private formatAddress(address: ShippingAddress): any {
    return {
      name: `${address.firstName} ${address.lastName}`,
      company_name: address.company,
      address_line1: address.address1,
      address_line2: address.address2,
      city_locality: address.city,
      state_province: address.state,
      postal_code: address.postalCode,
      country_code: address.country,
      phone: address.phone
    }
  }

  private getEstimatedDays(serviceType: string): number {
    const estimates: Record<string, number> = {
      'ups_ground': 5,
      'fedex_ground': 5,
      'ups_2nd_day_air': 2,
      'fedex_2_day': 2,
      'ups_next_day_air': 1,
      'fedex_standard_overnight': 1
    }
    return estimates[serviceType] || 7
  }

  private calculateEstimatedDelivery(serviceCode: string): string {
    const days = this.getEstimatedDays(serviceCode)
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + days)
    return deliveryDate.toISOString().split('T')[0]
  }

  private mapTrackingStatus(status: string): Shipment['status'] {
    const statusMap: Record<string, Shipment['status']> = {
      'in_transit': 'shipped',
      'delivered': 'delivered',
      'exception': 'exception',
      'pending': 'pending'
    }
    return statusMap[status] || 'pending'
  }

  private getFallbackRates(): ShippingRate[] {
    return [
      {
        service: 'Standard Shipping',
        carrier: 'UPS',
        rate: 9.99,
        currency: 'USD',
        estimatedDays: 5,
        serviceCode: 'ups_ground'
      },
      {
        service: 'Express Shipping',
        carrier: 'FedEx',
        rate: 19.99,
        currency: 'USD',
        estimatedDays: 2,
        serviceCode: 'fedex_2_day'
      },
      {
        service: 'Overnight Shipping',
        carrier: 'UPS',
        rate: 39.99,
        currency: 'USD',
        estimatedDays: 1,
        serviceCode: 'ups_next_day_air'
      }
    ]
  }

  private async simulateApiCall(endpoint: string, data: any): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (endpoint.includes('/rates')) {
      return {
        rates: [
          {
            service_type: 'UPS Ground',
            carrier_friendly_name: 'UPS',
            shipping_amount: { amount: '9.99', currency: 'USD' },
            service_code: 'ups_ground'
          },
          {
            service_type: 'FedEx 2-Day',
            carrier_friendly_name: 'FedEx',
            shipping_amount: { amount: '19.99', currency: 'USD' },
            service_code: 'fedex_2_day'
          }
        ]
      }
    } else if (endpoint.includes('/shipments')) {
      return {
        shipment_id: 'SHIP-' + Math.random().toString(36).substr(2, 9),
        tracking_number: '1Z' + Math.random().toString(36).substr(2, 16).toUpperCase(),
        carrier_id: 'ups',
        service_code: data.shipment.service_code
      }
    } else if (endpoint.includes('/tracking')) {
      return {
        shipment_id: 'SHIP-' + Math.random().toString(36).substr(2, 9),
        status: 'in_transit',
        carrier_id: 'ups',
        service_code: 'ups_ground',
        estimated_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tracking_events: [
          {
            occurred_at: new Date().toISOString(),
            status_code: 'in_transit',
            city: 'New York',
            state: 'NY',
            description: 'Package is in transit'
          }
        ]
      }
    }
    
    return {}
  }
}

// EasyPost Integration (Alternative)
export class EasyPostService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = 'https://api.easypost.com/v2'
  }

  async getRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    items: ShippingItem[]
  ): Promise<ShippingRate[]> {
    // Similar implementation to ShipEngine
    // Mock implementation for now
    return [
      {
        service: 'USPS Ground',
        carrier: 'USPS',
        rate: 7.99,
        currency: 'USD',
        estimatedDays: 7,
        serviceCode: 'usps_ground'
      }
    ]
  }

  async createShipment(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    items: ShippingItem[],
    serviceCode: string
  ): Promise<Shipment> {
    // Mock implementation
    return {
      id: 'SHIP-' + Math.random().toString(36).substr(2, 9),
      status: 'processing',
      trackingNumber: 'USPS' + Math.random().toString(36).substr(2, 16).toUpperCase(),
      carrier: 'usps',
      service: serviceCode,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      events: []
    }
  }
}

// Main Shipping Service
export class ShippingService {
  private shipEngine?: ShipEngineService
  private easyPost?: EasyPostService

  constructor() {
    if (process.env.SHIPENGINE_API_KEY) {
      this.shipEngine = new ShipEngineService(process.env.SHIPENGINE_API_KEY)
    }
    if (process.env.EASYPOST_API_KEY) {
      this.easyPost = new EasyPostService(process.env.EASYPOST_API_KEY)
    }
  }

  async getShippingRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    items: ShippingItem[]
  ): Promise<ShippingRate[]> {
    if (this.shipEngine) {
      return this.shipEngine.getRates(fromAddress, toAddress, items)
    } else if (this.easyPost) {
      return this.easyPost.getRates(fromAddress, toAddress, items)
    } else {
      // Fallback rates
      return [
        {
          service: 'Standard Shipping',
          carrier: 'Standard',
          rate: 9.99,
          currency: 'USD',
          estimatedDays: 5,
          serviceCode: 'standard'
        }
      ]
    }
  }

  async createShipment(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    items: ShippingItem[],
    serviceCode: string
  ): Promise<Shipment> {
    if (this.shipEngine) {
      return this.shipEngine.createShipment(fromAddress, toAddress, items, serviceCode)
    } else if (this.easyPost) {
      return this.easyPost.createShipment(fromAddress, toAddress, items, serviceCode)
    } else {
      throw new Error('No shipping service configured')
    }
  }

  async trackShipment(trackingNumber: string): Promise<Shipment> {
    if (this.shipEngine) {
      return this.shipEngine.getTrackingInfo(trackingNumber)
    } else {
      // Mock tracking for fallback
      return {
        id: 'SHIP-' + Math.random().toString(36).substr(2, 9),
        status: 'shipped',
        trackingNumber: trackingNumber,
        carrier: 'standard',
        service: 'standard',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        events: [
          {
            timestamp: new Date().toISOString(),
            status: 'shipped',
            location: 'Warehouse',
            description: 'Package has been shipped'
          }
        ]
      }
    }
  }
}

// Utility functions
export function calculateShippingCost(weight: number, distance: string = 'domestic'): number {
  const baseRate = distance === 'domestic' ? 5.99 : 15.99
  const weightRate = weight > 1 ? (weight - 1) * 2 : 0
  return baseRate + weightRate
}

export function getEstimatedDeliveryDays(service: string): number {
  const estimates: Record<string, number> = {
    'standard': 5,
    'express': 2,
    'overnight': 1,
    'international': 10
  }
  return estimates[service] || 7
}

// React hook for shipping
export function useShipping() {
  const shippingService = new ShippingService()

  const getRates = async (
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    items: ShippingItem[]
  ) => {
    return shippingService.getShippingRates(fromAddress, toAddress, items)
  }

  const createShipment = async (
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    items: ShippingItem[],
    serviceCode: string
  ) => {
    return shippingService.createShipment(fromAddress, toAddress, items, serviceCode)
  }

  const trackShipment = async (trackingNumber: string) => {
    return shippingService.trackShipment(trackingNumber)
  }

  return {
    getRates,
    createShipment,
    trackShipment
  }
}
