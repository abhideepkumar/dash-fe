import { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'base' | 'lowest' | 'low' | 'high';
}

export function GlassCard({ children, className, variant = 'lowest', ...props }: GlassCardProps) {
  const variantStyles = {
    base: "bg-surface/80",
    lowest: "bg-white/80 dark:bg-surface-container-lowest/80",
    low: "bg-surface-container-low/80",
    high: "bg-surface-container-high/80",
  };

  return (
    <div 
      className={cn(
        "backdrop-blur-xl border border-outline-variant/20 rounded-xl shadow-[0_40px_60px_rgba(0,0,0,0.02)] transition-all",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
