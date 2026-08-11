import { Switch as HSwitch } from "@headlessui/react";
import { cn } from "@/lib/utils";

interface SwitchProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    defaultChecked?: boolean;
    className?: string;
    disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, defaultChecked, className, disabled }: SwitchProps) {
    return (
        <HSwitch
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onCheckedChange}
            disabled={disabled}
            className={cn(
                "group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600 data-[unchecked]:bg-gray-200",
                className
            )}
        >
            <span
                aria-hidden="true"
                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5 group-data-[unchecked]:translate-x-0"
            />
        </HSwitch>
    );
}
