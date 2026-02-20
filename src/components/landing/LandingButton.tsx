"use client";

import type { AnchorHTMLAttributes, ReactNode, FC } from "react";

interface LandingButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}

export const LandingButton: FC<LandingButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out rounded-xl focus:outline-none focus:ring-2 focus:ring-brandGreen focus:ring-offset-2 focus:ring-offset-appBg";

  const variants = {
    primary:
      "bg-brandGreen hover:bg-brandGreenHover text-black px-8 py-3.5 shadow-[0_0_20px_rgba(0,210,106,0.3)] hover:shadow-[0_0_25px_rgba(0,210,106,0.5)] transform hover:-translate-y-0.5",
    outline:
      "bg-transparent border border-panelBorder hover:border-brandGreen text-white px-6 py-3 hover:bg-brandGreen/10",
  };

  return (
    <a
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};
