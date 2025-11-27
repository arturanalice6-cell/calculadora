import * as React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent ${className}`}
      {...props}
    />
  );
}

export default Textarea;
