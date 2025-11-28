import React from 'react';
import { cn } from "@/utils";

// Componentes genéricos de Card
export const Card = ({ className = '', children, ...props }) => {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={cn("p-6 pb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
    {children}
  </div>
);
