"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from 'framer-motion';
import { cn } from "../../utils/cn";

export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
	({ className, ...props }, ref) => (
		<TabsPrimitive.List ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-surfaceAlt p-1 text-muted-subtle", className)} {...props} />
	)
);
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
	({ className, ...props }, ref) => (
		<TabsPrimitive.Trigger
			ref={ref}
			className={cn(
				"inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
				className
			)}
			{...props}
		/>
	)
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
	({ className, children, ...props }, ref) => (
		<TabsPrimitive.Content ref={ref} className={cn("mt-3 focus-visible:outline-none", className)} {...props}>
			<motion.div
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: 4 }}
				transition={{ duration: 0.25, ease: 'easeOut' }}
			>
				{children}
			</motion.div>
		</TabsPrimitive.Content>
	)
);
TabsContent.displayName = TabsPrimitive.Content.displayName;
