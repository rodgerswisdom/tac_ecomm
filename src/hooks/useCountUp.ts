"use client"

import { useEffect, useState } from "react"

export function useCountUp(target: number, duration = 800) {
    const [value, setValue] = useState(0)

    useEffect(() => {
        let start = 0
        const increment = target / (duration / 16)

        const step = () => {
            start += increment
            if (start >= target) {
                setValue(target)
                return
            }
            setValue(Math.floor(start))
            requestAnimationFrame(step)
        }

        requestAnimationFrame(step)
    }, [target, duration])

    return value
}
