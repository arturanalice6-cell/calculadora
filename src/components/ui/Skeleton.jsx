import * as React from "react";

export const Skeleton = ({ className, ...props }) => (
  <div className={`animate-pulse bg-gray-300 rounded ${className}`} {...props}></div>
);

export default Skeleton;
