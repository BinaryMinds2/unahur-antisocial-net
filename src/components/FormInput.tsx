import type { InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function FormInput({
  label,
  error,
  id,
  className = '',
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
      <input
        id={id}
        className={`w-full rounded border border-matrix-border bg-matrix-bg px-3 py-2 font-mono text-sm text-matrix-text placeholder-matrix-muted/40 transition-all focus:border-matrix-accent focus:outline-none focus:ring-2 focus:ring-matrix-accent/50 ${
          error ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/30' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="block font-mono text-xs text-red-400">
          ! {error}
        </span>
      )}
    </div>
  )
}