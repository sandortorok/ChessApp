import type { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function AuthInput({
  label,
  error,
  helperText,
  id,
  ...props
}: AuthInputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-200 mb-2"
      >
        {label}
      </label>
      <div className="relative group">
        <input
          id={id}
          {...props}
          className={`block w-full rounded-xl bg-gray-800/50 border ${
            error ? 'border-red-500' : 'border-gray-700'
          } px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/50 focus:outline-none transition-all duration-200`}
        />
        <div className="absolute inset-0 rounded-xl bg-teal-500/0 group-hover:bg-teal-500/5 pointer-events-none transition-colors" />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-gray-400 mt-1">{helperText}</p>
      )}
    </div>
  );
}
