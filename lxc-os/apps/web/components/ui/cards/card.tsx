import * as React from "react";
import {
    Card as BaseCard,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    type CardProps as BaseCardProps,
} from "@/components/ui/card";

export interface DashboardCardProps extends Omit<BaseCardProps, "title"> {
    title?: React.ReactNode;
    description?: React.ReactNode;
    headerExtra?: React.ReactNode;
    footer?: React.ReactNode;
}

export function DashboardCard({
    title,
    description,
    headerExtra,
    footer,
    children,
    ...props
}: DashboardCardProps) {
    return (
        <BaseCard {...props}>
            {(title || description || headerExtra) && (
                <CardHeader>
                    <div>
                        {title && <CardTitle>{title}</CardTitle>}
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    {headerExtra && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            {headerExtra}
                        </div>
                    )}
                </CardHeader>
            )}

            <CardContent>{children}</CardContent>

            {footer && (
                <div className="mt-3 border-t border-white/10 pt-3 text-xs text-gray-400">
                    {footer}
                </div>
            )}
        </BaseCard>
    );
}


