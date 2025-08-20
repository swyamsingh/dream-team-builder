"use client";
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { AnimatePresence, motion } from 'framer-motion';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Viewport
			ref={ref}
			className={cn("fixed top-4 right-4 z-50 flex max-h-screen w-80 flex-col gap-2 outline-none", className)}
			{...props}
		/>
	)
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
	"group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-md transition-all",
	{
		variants: {
			variant: {
				default: "border-border bg-surface text-foreground",
				success: "border-green-600/30 bg-green-600/15 text-green-200",
				error: "border-error/40 bg-error/15 text-error-light",
				warning: "border-amber-500/40 bg-amber-500/15 text-amber-200",
				info: "border-blue-500/40 bg-blue-500/15 text-blue-200"
			}
		},
		defaultVariants: { variant: "default" }
	}
);

export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>, VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastProps>(({ className, variant, ...props }, ref) => {
	return (
		<ToastPrimitives.Root asChild ref={ref} {...props}>
			<motion.div
				initial={{ x: 50, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: 50, opacity: 0 }}
				transition={{ type: 'spring', stiffness: 300, damping: 25 }}
				className={cn(toastVariants({ variant }), className)}
			/>
		</ToastPrimitives.Root>
	);
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Title ref={ref} className={cn("text-sm font-medium", className)} {...props} />
	)
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Description ref={ref} className={cn("text-xs opacity-80", className)} {...props} />
	)
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(
	({ className, ...props }, ref) => (
		<ToastPrimitives.Close ref={ref} className={cn("absolute right-2 top-2 rounded p-1 text-xs opacity-70 transition-opacity hover:opacity-100", className)} {...props} />
	)
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose };

// Simple imperative toast queue
interface QueueItem { id: number; title?: string; description?: string; variant?: ToastProps['variant']; }
let listeners: React.Dispatch<React.SetStateAction<QueueItem[]>>[] = [];
let idCounter = 0;
export function pushToast(t: Omit<QueueItem,'id'>) {
	const item: QueueItem = { id: ++idCounter, ...t };
	listeners.forEach(l => l(q => [...q, item]));
	setTimeout(()=>dismissToast(item.id), 3800);
}
export function dismissToast(id: number) {
	listeners.forEach(l => l(q => q.filter(i=>i.id!==id)));
}

export const ToastOutlet: React.FC = () => {
	const [items,setItems] = React.useState<QueueItem[]>([]);
	React.useEffect(()=>{ listeners.push(setItems); return ()=>{ listeners = listeners.filter(l=>l!==setItems); }; },[]);
	return (
		<>
			<AnimatePresence initial={false}>
				{items.map(i => (
					<Toast key={i.id} open onOpenChange={(o)=>{ if(!o) dismissToast(i.id); }} variant={i.variant}>
						{i.title && <ToastTitle>{i.title}</ToastTitle>}
						{i.description && <ToastDescription>{i.description}</ToastDescription>}
						<ToastClose onClick={()=>dismissToast(i.id)}>×</ToastClose>
					</Toast>
				))}
			</AnimatePresence>
		</>
	);
};

export function useToast() { return { push: pushToast }; }
