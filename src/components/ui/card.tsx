"use client";
import * as React from "react";
import { cn } from "../../utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn("rounded-lg border border-border bg-surface p-4 shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={cn("mb-3 space-y-1", className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
	<h3 className={cn("font-semibold leading-none tracking-tight text-sm", className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
	<p className={cn("text-xs text-muted-subtle", className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={cn("text-sm", className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
	<div className={cn("mt-4 flex items-center gap-2", className)} {...props} />
);
