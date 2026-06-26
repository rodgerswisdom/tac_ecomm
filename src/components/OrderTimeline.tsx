"use client"

import { OrderStatus } from "@prisma/client"
import { Check, X, Package, Truck, CheckCircle2, Clock, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import {
  getOrderTimelineSteps,
  isStepCompleted,
  isStepCurrent,
} from "@/lib/order-utils"
import { cn } from "@/lib/utils"

// Icon mapping for each order status
const STEP_ICON_MAP: Record<OrderStatus, LucideIcon> = {
  [OrderStatus.PENDING]: Package,
  [OrderStatus.CONFIRMED]: CheckCircle2,
  [OrderStatus.PROCESSING]: Package,
  [OrderStatus.SHIPPED]: Truck,
  [OrderStatus.DELIVERED]: CheckCircle2,
  [OrderStatus.CANCELLED]: X,
  [OrderStatus.REFUNDED]: X,
}

// Step state types
type StepState = 'cancelled' | 'refunded' | 'completed' | 'current' | 'pending'

// Color classes for each step state
const STEP_COLORS: Record<StepState, string> = {
  cancelled: 'bg-red-500 text-white',
  refunded: 'bg-orange-500 text-white',
  completed: 'bg-green-500 text-white',
  current: 'bg-blue-500 text-white',
  pending: 'bg-gray-200 text-gray-400',
}

// Line colors for connecting steps
const LINE_COLORS = {
  completed: 'bg-green-500',
  default: 'bg-gray-200',
} as const

/**
 * Determine the current state of a timeline step
 */
const getStepState = (
  status: OrderStatus,
  stepStatus: OrderStatus,
  isCancelled: boolean,
  isRefunded: boolean
): StepState => {
  if (isCancelled && stepStatus === OrderStatus.CANCELLED) return 'cancelled'
  if (isRefunded && stepStatus === OrderStatus.REFUNDED) return 'refunded'
  if (isStepCompleted(status, stepStatus)) return 'completed'
  if (isStepCurrent(status, stepStatus)) return 'current'
  return 'pending'
}

/**
 * Get the appropriate icon component for a timeline step
 */
const getStepIconComponent = (
  status: OrderStatus,
  stepStatus: OrderStatus,
  isCancelled: boolean,
  isRefunded: boolean
): LucideIcon => {
  const stepState = getStepState(status, stepStatus, isCancelled, isRefunded)
  
  if (stepState === 'completed') return Check
  if (stepState === 'current') return Clock
  
  return STEP_ICON_MAP[stepStatus] || Clock
}

/**
 * Get the color class for a timeline step
 */
const getStepColorClass = (
  status: OrderStatus,
  stepStatus: OrderStatus,
  isCancelled: boolean,
  isRefunded: boolean
): string => {
  const stepState = getStepState(status, stepStatus, isCancelled, isRefunded)
  return STEP_COLORS[stepState]
}

/**
 * Get the color class for the connecting line between steps
 */
const getLineColorClass = (
  status: OrderStatus,
  steps: ReturnType<typeof getOrderTimelineSteps>,
  index: number
): string => {
  if (index === steps.length - 1) return ""
  
  const [currentStep, nextStep] = [steps[index], steps[index + 1]]
  if (!currentStep || !nextStep) return LINE_COLORS.default
  
  const bothCompleted =
    isStepCompleted(status, currentStep.status) &&
    isStepCompleted(status, nextStep.status)
  
  return bothCompleted ? LINE_COLORS.completed : LINE_COLORS.default
}

interface OrderTimelineProps {
  status: OrderStatus
  className?: string
}

export function OrderTimeline({ status, className }: OrderTimelineProps) {
  const steps = getOrderTimelineSteps(status)
  const isCancelled = status === OrderStatus.CANCELLED
  const isRefunded = status === OrderStatus.REFUNDED

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <div className="space-y-8">
          {steps.map((step, index) => {
            const completed = isStepCompleted(status, step.status)
            const current = isStepCurrent(status, step.status)
            const IconComponent = getStepIconComponent(status, step.status, isCancelled, isRefunded)
            const stepColorClass = getStepColorClass(status, step.status, isCancelled, isRefunded)
            const lineColorClass = getLineColorClass(status, steps, index)

            return (
              <div key={step.status} className="relative">
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-md",
                      stepColorClass
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                  </motion.div>

                  <div className="flex-1 pt-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                    >
                      <h4
                        className={cn(
                          "text-sm font-semibold",
                          completed || current
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </h4>
                      <p
                        className={cn(
                          "text-xs",
                          completed || current
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60"
                        )}
                      >
                        {step.description}
                      </p>
                    </motion.div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className={cn(
                      "absolute left-5 top-10 h-8 w-0.5 -translate-x-1/2 origin-top",
                      lineColorClass
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface OrderTimelineCompactProps {
  status: OrderStatus
  className?: string
}

export function OrderTimelineCompact({
  status,
  className,
}: OrderTimelineCompactProps) {
  const steps = getOrderTimelineSteps(status)
  const isCancelled = status === OrderStatus.CANCELLED
  const isRefunded = status === OrderStatus.REFUNDED

  // Helper function to determine circle styling based on step state
  const getCircleClass = (
    completed: boolean,
    current: boolean,
    isCancelled: boolean,
    isRefunded: boolean
  ): string => {
    if (!completed && !current) {
      return "bg-muted text-muted-foreground"
    }
    
    if (isCancelled) return "bg-red-500 text-white"
    if (isRefunded) return "bg-orange-500 text-white"
    return "bg-primary text-primary-foreground"
  }

  // Helper function to determine connecting line styling
  const getLineClass = (
    completed: boolean,
    isCancelled: boolean,
    isRefunded: boolean
  ): string => {
    if (!completed) return "bg-muted"
    
    if (isCancelled) return "bg-red-300"
    if (isRefunded) return "bg-orange-300"
    return "bg-primary"
  }

  // Helper function to extract first word from label
  const getShortLabel = (label: string): string => {
    return label.split(" ")[0]
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center w-full">
        {steps.map((step, index) => {
          const completed = isStepCompleted(status, step.status)
          const current = isStepCurrent(status, step.status)
          const stepNumber = index + 1
          const isLastStep = index === steps.length - 1

          const circleColor = getCircleClass(completed, current, isCancelled, isRefunded)
          const lineActiveColor = getLineClass(completed, isCancelled, isRefunded)

          return (
            <div key={step.status} className={cn("flex items-center", !isLastStep ? "flex-1" : "flex-initial")}>
              {/* Step Circle */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold shadow-sm",
                    circleColor
                  )}
                >
                  {completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <span className="mt-2 hidden text-xs text-muted-foreground sm:block max-w-[80px] text-center truncate">
                  {getShortLabel(step.label)}
                </span>
              </div>

              {/* Connecting Line */}
              {!isLastStep && (
                <div
                  className={cn(
                    "h-0.5 mx-2 flex-1 min-w-[20px]",
                    completed ? lineActiveColor : "bg-muted"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
