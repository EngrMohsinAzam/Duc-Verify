import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark focus:ring-primary/30",
  secondary:
    "bg-surface text-text-primary border border-border hover:bg-background focus:ring-primary/20",
  danger:
    "bg-error text-white hover:bg-error/90 focus:ring-error/30",
  ghost:
    "text-secondary hover:bg-background hover:text-text-primary",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", fullWidth, className = "", children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
