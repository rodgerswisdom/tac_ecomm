"use client"

import { useEffect, useState } from "react"

export function useCountUp(target: number, duration = 800, decimals = 0) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        let startTimestamp: number | null = null
        const endValue = target

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)
            
            const currentValue = progress * endValue
            setValue(Number(currentValue.toFixed(decimals)))

            if (progress < 1) {
                requestAnimationFrame(step)
            }
        }

        requestAnimationFrame(step)
    }, [target, duration, decimals])

    return value
}
