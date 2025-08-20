"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-fg hover:bg-primary/90",
				secondary: "bg-surfaceAlt text-foreground hover:bg-surfaceAlt/80",
				outline: "border border-border bg-transparent hover:bg-surfaceAlt",
				ghost: "hover:bg-surfaceAlt",
				destructive: "bg-error text-error-light hover:bg-error/90",
				link: "text-primary underline-offset-4 hover:underline"
			},
			size: {
				sm: "h-8 px-3 text-xs",
				md: "h-9 px-4",
				lg: "h-10 px-6 text-base",
				icon: "h-9 w-9"
			}
		},
		defaultVariants: {
			variant: "default",
			size: "md"
		}
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size }), loading && "relative text-transparent [&>*]:invisible", className)}
				ref={ref}
				disabled={loading || props.disabled}
				{...props}
			>
				{children}
				{loading && (
					<span className="absolute inset-0 flex items-center justify-center">
						<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
					</span>
				)}
			</Comp>
		);
	}
);
Button.displayName = "Button";

export { buttonVariants };
