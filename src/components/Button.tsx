import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: ReactNode;
}

const variantClasses = {
  primary:
    "bg-foreground text-background hover:bg-zinc-800",
  secondary:
    "border border-zinc-200 bg-white text-foreground hover:bg-zinc-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700",
};

export default function Button({
  variant = "primary",
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium
        transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
