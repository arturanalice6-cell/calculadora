import React from 'react';

export const Input = ({
  type = "text",
  value,
  onChange,
  disabled = false,
  placeholder = "",
  className = '',
  ...props
}) => {
  const baseClasses =
    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`${baseClasses} ${disabled ? "opacity-50 bg-gray-100 cursor-not-allowed" : ""} ${className}`}
      {...props}
    />
  );
};
