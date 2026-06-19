import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, id, className = "", ...props }, ref) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`h-11 w-full rounded-xl border bg-surface px-3 text-text-primary outline-none transition-colors placeholder:text-text-secondary/70 focus:ring-2 focus:ring-primary/20 ${
            error
              ? "border-error focus:border-error"
              : "border-border focus:border-primary"
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1.5 text-xs text-text-secondary">{hint}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
