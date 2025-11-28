import * as React from "react";
import { cn } from "@/utils";

export const Skeleton = ({ className, ...props }) => (
  <div 
    className={cn("animate-pulse rounded-md bg-muted", className)} 
    {...props}
  />
);

export default Skeleton;
