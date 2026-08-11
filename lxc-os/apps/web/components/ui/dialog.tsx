import React, { createContext, useContext, Fragment, useState } from "react";
import { Dialog as HDialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const DialogContext = createContext<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}>({});

export function Dialog({ 
    children, 
    open: controlledOpen, 
    onOpenChange: setControlledOpen 
}: { 
    children: React.ReactNode, 
    open?: boolean, 
    onOpenChange?: (open: boolean) => void 
}) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const onOpenChange = (val: boolean) => {
        if (isControlled) {
            setControlledOpen?.(val);
        } else {
            setUncontrolledOpen(val);
        }
    };

    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
}

export function DialogTrigger({ children, asChild }: { children: React.ReactElement, asChild?: boolean }) {
    const { onOpenChange } = useContext(DialogContext);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: any) => {
                (children as React.ReactElement<any>).props.onClick?.(e);
                onOpenChange?.(true);
            }
        });
    }

    return (
        <button onClick={() => onOpenChange?.(true)}>
            {children}
        </button>
    );
}

export function DialogContent({ children, className }: { children: React.ReactNode, className?: string }) {
    const { open, onOpenChange } = useContext(DialogContext);

    return (
        <Transition appear show={!!open} as={Fragment}>
            <HDialog as="div" className="relative z-[100]" onClose={() => onOpenChange?.(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <HDialog.Panel className={cn("w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all", className)}>
                                {children}
                            </HDialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </HDialog>
        </Transition>
    );
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return <HDialog.Title as="h3" className={cn("text-lg font-medium leading-6 text-gray-900 dark:text-gray-100", className)}>{children}</HDialog.Title>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode, className?: string }) {
    return <HDialog.Description className={cn("text-sm text-gray-500 dark:text-gray-400 mt-2", className)}>{children}</HDialog.Description>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("mt-6 flex justify-end space-x-2", className)}>{children}</div>;
}
