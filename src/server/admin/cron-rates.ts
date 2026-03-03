'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const API_KEY = process.env.EXCHANGE_RATE_API_KEY; // Free tier from: https://www.exchangerate-api.com/

export async function syncExchangeRates() {
    try {
        // 1. Get current auto-sync setting
        const settings = await (prisma as any).settings.upsert({
            where: { id: "singleton" },
            update: {},
            create: { id: "singleton" },
        });

        if (!settings.autoSyncRates) {
            console.log('Auto-sync is disabled in settings.');
            return { success: false, message: 'Auto-sync is disabled.' };
        }

        if (!API_KEY) {
            console.warn('EXCHANGE_RATE_API_KEY is missing.');
            return { success: false, message: 'API key missing.' };
        }

        // 2. Fetch rates from API
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
        const data = await response.json();

        if (data.result !== 'success') {
            throw new Error(`API error: ${JSON.stringify(data)}`);
        }

        const { KES, EUR } = data.conversion_rates;

        // 3. Update database
        await (prisma as any).settings.update({
            where: { id: "singleton" },
            data: {
                usdToKesRate: KES,
                usdToEurRate: EUR,
                lastRatesSyncAt: new Date(),
            }
        });

        console.log(`Rates synced: USD=1, KES=${KES}, EUR=${EUR}`);
        revalidatePath('/admin/settings');
        revalidatePath('/'); // Global update

        return { success: true, rates: { KES, EUR } };
    } catch (error) {
        console.error('Exchange rate sync failed:', error);
        return { success: false, error: 'Failed to sync rates' };
    }
}
