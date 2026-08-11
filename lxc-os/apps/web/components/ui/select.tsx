"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"

interface SelectContextValue {
    value?: string
    onValueChange?: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export function Select({
    children,
    value,
    onValueChange,
    defaultValue,
}: {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
}) {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)

    const activeValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            if (value === undefined) {
                setInternalValue(newValue)
            }
            onValueChange?.(newValue)
            setOpen(false)
        },
        [onValueChange, value]
    )

    return (
        <SelectContext.Provider
            value={{
                value: activeValue,
                onValueChange: handleValueChange,
                open,
                setOpen,
            }}
        >
            <div className="relative w-full">{children}</div>
        </SelectContext.Provider>
    )
}

export function SelectTrigger({
    children,
    className,
    disabled,
}: {
    children: React.ReactNode
    className?: string
    disabled?: boolean
}) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    return (
        <button
            type="button"
            onClick={() => !disabled && context.setOpen(!context.open)}
            disabled={disabled}
            className={cn(
                "flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm transition-all hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white",
                disabled && "cursor-not-allowed opacity-50",
                className
            )}
        >
            {children}
            <ChevronDown
                className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-200",
                    context.open && "rotate-180 text-indigo-500"
                )}
            />
        </button>
    )
}

export function SelectValue({
    placeholder,
    className,
    children,
}: {
    placeholder?: string
    className?: string
    children?: React.ReactNode
}) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectValue must be used within Select")

    return (
        <span className={cn("block truncate", !context.value && "text-gray-400", className)}>
            {children || context.value || placeholder}
        </span>
    )
}

export function SelectContent({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectContent must be used within Select")

    return (
        <AnimatePresence>
            {context.open && (
                <>
                    <div
                        className="fixed inset-0 z-[110]"
                        onClick={() => context.setOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className={cn(
                            "absolute z-[120] mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950",
                            className
                        )}
                    >
                        <div className="max-h-60 overflow-y-auto p-1">
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export function SelectItem({
    children,
    value,
    className,
    disabled,
}: {
    children: React.ReactNode
    value: string
    className?: string
    disabled?: boolean
}) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectItem must be used within Select")

    const isSelected = context.value === value

    return (
        <button
            type="button"
            onClick={() => !disabled && context.onValueChange?.(value)}
            disabled={disabled}
            className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                "hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
                isSelected
                    ? "bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300",
                disabled && "cursor-not-allowed opacity-50",
                className
            )}
        >
            <span className="truncate">{children}</span>
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
        </button>
    )
}
