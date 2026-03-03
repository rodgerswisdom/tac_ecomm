// SMS Utility using Africa's Talking or Twilio
// Default: Mocked implementation with clear structure for integration

export interface SMSConfig {
    apiKey: string
    username: string // For Africa's Talking
    from: string // Sender ID
    provider: 'africastalking' | 'twilio' | 'mock'
}

export interface SMSData {
    to: string | string[] // Single or multiple numbers
    message: string
}

export interface SMSResponse {
    success: boolean
    messageId?: string
    error?: string
    recipientsCount?: number
}

export class SMSService {
    private config: SMSConfig

    constructor(config: SMSConfig) {
        this.config = config
    }

    async sendSMS(data: SMSData): Promise<SMSResponse> {
        const recipients = Array.isArray(data.to) ? data.to : [data.to]

        // Basic phone number validation/cleaning
        const cleanedRecipients = recipients.map(r => {
            // Ensure number starts with + or 254 (for Kenya)
            let phone = r.trim().replace(/\s+/g, '')
            if (phone.startsWith('0')) phone = '254' + phone.slice(1)
            if (!phone.startsWith('+')) phone = '+' + phone.replace(/^\+/, '')
            return phone
        })

        try {
            if (this.config.provider === 'africastalking' && this.isConfigValid()) {
                return this.sendViaAfricasTalking(cleanedRecipients, data.message)
            } else if (this.config.provider === 'twilio' && this.isConfigValid()) {
                return this.sendViaTwilio(cleanedRecipients, data.message)
            } else {
                return this.simulateSMS(cleanedRecipients, data.message)
            }
        } catch (error) {
            console.error('SMS Service Error:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    private isConfigValid(): boolean {
        return !!(this.config.apiKey && this.config.apiKey !== 'your-api-key')
    }

    private async sendViaAfricasTalking(recipients: string[], message: string): Promise<SMSResponse> {
        // Integration logic for Africa's Talking HTTP API
        const res = await fetch('https://api.africastalking.com/version1/messaging', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'apikey': this.config.apiKey
            },
            body: new URLSearchParams({
                username: this.config.username,
                to: recipients.join(','),
                message: message,
                from: this.config.from || ''
            })
        })

        if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`Africa's Talking API Error: ${res.status} ${errorText}`)
        }

        const result = await res.json()
        // AT returns a nested object with SMSMessageData.Recipients
        const successCount = result?.SMSMessageData?.Recipients?.filter((r: any) => r.status === 'Success')?.length ?? 0

        return {
            success: successCount > 0,
            messageId: result?.SMSMessageData?.Recipients?.[0]?.messageId,
            recipientsCount: successCount
        }
    }

    private async sendViaTwilio(recipients: string[], message: string): Promise<SMSResponse> {
        // Integration logic for Twilio API (simplified for 1 recipient for now, or loop for bulk)
        // Twilio usually requires specific SID and AuthToken which we'd put in config
        throw new Error('Twilio integration not fully implemented')
    }

    private async simulateSMS(recipients: string[], message: string): Promise<SMSResponse> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))

        console.log('--- SMS SIMULATION ---')
        console.log(`To: ${recipients.join(', ')}`)
        console.log(`Message: ${message}`)
        console.log('-----------------------')

        return {
            success: true,
            messageId: 'mock-sms-' + Math.random().toString(36).slice(2, 11),
            recipientsCount: recipients.length
        }
    }
}

export function getSMSConfig(): SMSConfig {
    return {
        apiKey: process.env.SMS_API_KEY || 'your-api-key',
        username: process.env.SMS_USERNAME || 'sandbox',
        from: process.env.SMS_SENDER_ID || '',
        provider: (process.env.SMS_PROVIDER as any) || 'mock'
    }
}
