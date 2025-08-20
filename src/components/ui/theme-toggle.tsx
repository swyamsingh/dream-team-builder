"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	function toggle() { setTheme(theme === 'dark' ? 'light' : 'dark'); }
	return (
		<Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
			<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
		</Button>
	);
}
