"use client";
import * as React from "react";
import { cn } from "../../utils/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("animate-pulse rounded-md bg-surfaceAlt/70", className)} {...props} />;
}
