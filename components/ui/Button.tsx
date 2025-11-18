import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300",
    secondary:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-300",
    outline:
      "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-gray-200",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
