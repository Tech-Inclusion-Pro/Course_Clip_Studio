import { useRef, useState, useCallback, useEffect } from 'react'

interface PinInputProps {
  length: number
  onComplete: (pin: string) => void
  error?: boolean
  disabled?: boolean
}

export function PinInput({ length, onComplete, error = false, disabled = false }: PinInputProps): JSX.Element {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const [shake, setShake] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  // Reset when length changes
  useEffect(() => {
    setValues(Array(length).fill(''))
    refs.current[0]?.focus()
  }, [length])

  // Trigger shake on error
  useEffect(() => {
    if (error) {
      setShake(true)
      setValues(Array(length).fill(''))
      const timer = setTimeout(() => {
        setShake(false)
        refs.current[0]?.focus()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [error, length])

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (disabled) return
      const digit = value.replace(/\D/g, '').slice(-1)
      const next = [...values]
      next[index] = digit
      setValues(next)

      if (digit && index < length - 1) {
        refs.current[index + 1]?.focus()
      }

      if (digit && index === length - 1 && next.every((v) => v !== '')) {
        onComplete(next.join(''))
      }
    },
    [values, length, onComplete, disabled]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !values[index] && index > 0) {
        refs.current[index - 1]?.focus()
      }
    },
    [values]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      if (disabled) return
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (!pasted) return

      const next = Array(length).fill('')
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i]
      }
      setValues(next)

      if (pasted.length >= length) {
        onComplete(next.join(''))
      } else {
        refs.current[pasted.length]?.focus()
      }
    },
    [length, onComplete, disabled]
  )

  return (
    <div
      className={`flex gap-2 justify-center ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          aria-label={`PIN digit ${i + 1}`}
          className={`
            w-12 h-14 text-center text-xl font-[var(--font-weight-bold)]
            rounded-lg border-2 bg-[var(--bg-surface)] text-[var(--text-primary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
            transition-colors
            ${error
              ? 'border-[var(--color-danger-600)]'
              : 'border-[var(--border-default)]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
      ))}
    </div>
  )
}
