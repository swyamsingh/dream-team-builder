import React from 'react';
import clsx from 'clsx';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  fullWidth?: boolean;
  autoGrow?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, fullWidth, autoGrow, rows = 3, onChange, ...rest }, ref
) {
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (autoGrow) {
      e.currentTarget.style.height = 'auto';
      e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
    }
    onChange?.(e);
  }
  return (
    <textarea
      ref={ref}
      rows={rows}
      onChange={handleChange}
      className={clsx(
        'rounded-md border border-border bg-surface px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed resize-y',
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    />
  );
});

export default TextArea;
