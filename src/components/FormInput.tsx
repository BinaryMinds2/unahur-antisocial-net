import type { InputHTMLAttributes, ReactNode } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
  rightElement?: ReactNode
}

export default function FormInput({
  label,
  error,
  id,
  className = '',
  icon,
  rightElement,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-1 text-left">
      <label
        htmlFor={id}
        className="block font-mono text-xs font-bold uppercase tracking-wider text-matrix-muted"
      >
        [ {label} ]
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-matrix-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-lg border border-matrix-border bg-matrix-bg/80 ${
            icon ? 'pl-10' : 'px-3'
          } ${rightElement ? 'pr-10' : ''} px-3 py-2 font-mono text-sm text-matrix-text placeholder-matrix-muted/40 transition-all focus:border-matrix-accent focus:outline-none focus:ring-1 focus:ring-matrix-accent focus:shadow-[0_0_15px_rgba(16,185,129,0.25)] ${
            error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/30' : ''
          } ${className}`}
          {...props}
        />
        {rightElement}
      </div>
      {error && (
        <span className="block font-mono text-xs text-red-400">
          ! {error}
        </span>
      )}
    </div>
  )
}