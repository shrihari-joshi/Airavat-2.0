import React, { FC } from "react";
import clsx from "clsx";

const Input = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  defaultValue,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  required = false, 
  success = false,
  error = false,
  hint,
}) => {
  const inputClasses = clsx(
    "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3",
    "dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30",
    className,
    {
      "text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700": disabled,
      "text-error-800 border-error-500 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500": error,
      "text-success-500 border-success-400 focus:ring-success-500/10 dark:text-success-400 dark:border-success-500": success,
      "bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800": !error && !success && !disabled,
    }
  );

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required} 
        className={inputClasses}
      />

      {/* Optional Hint Text */}
      {hint && (
        <p
          className={clsx("mt-1.5 text-xs", {
            "text-error-500": error,
            "text-success-500": success,
            "text-gray-500": !error && !success,
          })}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
