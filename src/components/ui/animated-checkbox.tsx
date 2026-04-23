import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/utils"
import { cva, type VariantProps } from "class-variance-authority"

const checkboxVariants = cva(
  "peer shrink-0 rounded-md border transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-hair bg-white data-[state=checked]:bg-charcoal data-[state=checked]:border-charcoal",
        outline: "border-hair bg-transparent data-[state=checked]:border-ink data-[state=checked]:text-ink",
        ghost: "border-transparent bg-transparent hover:bg-cream data-[state=checked]:text-ink",
      },
      size: {
        default: "h-5 w-5",
        sm: "h-4 w-4",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, size, checked, onCheckedChange, ...props }, ref) => {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(checkboxVariants({ variant, size, className }))}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <CheckboxPrimitive.Indicator 
        className={cn("flex items-center justify-center text-current")}
        forceMount
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: -45 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <HugeiconsIcon 
                icon={Tick01Icon} 
                className={cn(
                  size === "sm" ? "w-2.5 h-2.5" : size === "lg" ? "w-4 h-4" : "w-3 h-3",
                  variant === "default" ? "text-white" : "text-ink"
                )} 
                strokeWidth={3} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = "AnimateCheckbox"

export { Checkbox }

