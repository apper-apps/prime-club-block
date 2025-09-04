import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  children, 
  className, 
  variant = "default",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-white border border-gray-200 shadow-sm",
    elevated: "bg-white border border-gray-200 shadow-md",
    gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg"
  };

  return (
    <div
      ref={ref}
className={cn(
        "rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.01]",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;