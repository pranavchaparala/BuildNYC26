import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

const baseInputClasses = `
  w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900
  placeholder:text-ink-300
  focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-shadow
`.trim();

export function Input({ label, error, hint, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      <input className={`${baseInputClasses} ${className}`} {...props} />
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-700">{label}</label>
      <textarea
        className={`${baseInputClasses} resize-none ${className}`}
        rows={4}
        {...props}
      />
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
