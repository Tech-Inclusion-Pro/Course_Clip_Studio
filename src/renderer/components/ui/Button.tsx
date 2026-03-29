import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] active:bg-[var(--color-brand-800)]',
  secondary:
    'bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
  danger:
    'bg-[var(--color-danger-600)] text-white hover:bg-[var(--color-danger-500)] active:bg-[var(--color-danger-600)]'
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center gap-2
          min-tap-target rounded-[var(--radius-md)]
          font-[var(--font-weight-medium)]
          transition-colors duration-[var(--duration-fast)]
          cursor-pointer select-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
