"use client";
import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover/90 shadow-sm',
  secondary: 'bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-hover/90',
  tertiary: 'bg-surface/60 text-white hover:bg-surface',
  destructive: 'bg-error text-white hover:bg-error-dark',
  ghost: 'bg-transparent hover:bg-surface/60 text-white',
  outline: 'border border-border text-white hover:bg-surface/40'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  fullWidth,
  className,
  children,
  disabled,
  ...rest
}) => {
  return (
    <button
      className={clsx(
        base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        loading && 'relative text-transparent [&>*]:invisible',
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {icon && !loading && <span className='shrink-0' aria-hidden>{icon}</span>}
      <span className='whitespace-nowrap'>{children}</span>
      {loading && (
        <span className='absolute inset-0 flex items-center justify-center'>
          <Spinner size={size} />
        </span>
      )}
    </button>
  );
};

const spinnerSize: Record<ButtonSize, string> = {
  sm: 'h-3 w-3 border-2',
  md: 'h-4 w-4 border-2',
  lg: 'h-5 w-5 border-[3px]'
};

const Spinner: React.FC<{ size: ButtonSize }> = ({ size }) => (
  <span
    className={clsx(
      'inline-block animate-spin rounded-full border-current border-t-transparent',
      spinnerSize[size]
    )}
    role='status'
    aria-label='Loading'
  />
);

export default Button;
