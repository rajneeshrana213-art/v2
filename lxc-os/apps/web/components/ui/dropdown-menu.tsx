"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const DropdownMenuContext = React.createContext<{
    open: boolean
    setOpen: (open: boolean) => void
    align?: "start" | "end" | "center"
}>({
    open: false,
    setOpen: () => { },
})

export function DropdownMenu({
    children,
    open: openProp,
    onOpenChange,
}: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isOpen = openProp !== undefined ? openProp : internalOpen

    const setOpen = React.useCallback((open: boolean) => {
        setInternalOpen(open)
        onOpenChange?.(open)
    }, [onOpenChange])

    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen, setOpen])

    return (
        <DropdownMenuContext.Provider value={{ open: isOpen, setOpen }}>
            <div className="relative inline-block" ref={containerRef}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

export function DropdownMenuTrigger({
    children,
    asChild,
    className,
}: {
    children: React.ReactNode
    asChild?: boolean
    className?: string
}) {
    const { open, setOpen } = React.useContext(DropdownMenuContext)

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                children.props.onClick?.(e)
                setOpen(!open)
            },
            "data-state": open ? "open" : "closed",
        })
    }

    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn("", className)}
            data-state={open ? "open" : "closed"}
        >
            {children}
        </button>
    )
}

export function DropdownMenuContent({
    children,
    align = "end",
    className,
}: {
    children: React.ReactNode
    align?: "start" | "end" | "center"
    className?: string
}) {
    const { open } = React.useContext(DropdownMenuContext)

    const alignClasses = {
        start: "left-0 origin-top-left",
        center: "left-1/2 -translate-x-1/2 origin-top",
        end: "right-0 origin-top-right",
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                        "absolute z-[100] min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white p-1 text-gray-950 shadow-lg dark:border-white/10 dark:bg-gray-900 dark:text-gray-50",
                        alignClasses[align],
                        className
                    )}
                >
                    <div className="flex flex-col gap-0.5">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export function DropdownMenuItem({
    children,
    className,
    onClick,
    disabled,
    asChild
}: {
    children: React.ReactNode
    className?: string
    onClick?: (e: React.MouseEvent) => void
    disabled?: boolean
    asChild?: boolean
}) {
    const { setOpen } = React.useContext(DropdownMenuContext)

    const handleSelect = (e: React.MouseEvent) => {
        if (disabled) return
        onClick?.(e)
        setOpen(false)
    }

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                (children as React.ReactElement<any>).props.onClick?.(e)
                handleSelect(e)
            },
            className: cn(
                "relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300 focus:bg-indigo-50 focus:text-indigo-600 dark:focus:bg-indigo-900/40 dark:focus:text-indigo-300",
                disabled && "pointer-events-none opacity-50",
                className,
                (children as React.ReactElement<any>).props.className
            )
        })
    }

    return (
        <div
            onClick={handleSelect}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                "hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300",
                "focus:bg-indigo-50 focus:text-indigo-600 dark:focus:bg-indigo-900/40 dark:focus:text-indigo-300",
                disabled && "pointer-events-none opacity-50",
                className
            )}
        >
            {children}
        </div>
    )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
    return (
        <div className={cn("-mx-1 my-1 h-px bg-gray-100 dark:bg-white/5", className)} />
    )
}
