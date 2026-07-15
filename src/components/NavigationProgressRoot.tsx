"use client"

import { Suspense } from "react"
import { NavigationProgress } from "@/components/NavigationProgress"

export function NavigationProgressRoot() {
  return (
    <Suspense fallback={null}>
      <NavigationProgress />
    </Suspense>
  )
}
