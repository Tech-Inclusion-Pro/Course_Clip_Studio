import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { PinInput } from '@/components/auth/PinInput'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import logoSrc from '@/assets/logo.png'

type Mode = 'sign-in' | 'register'

export function SignInView(): JSX.Element {
  const userProfile = useAuthStore((s) => s.userProfile)
  const staySignedIn = useAuthStore((s) => s.staySignedIn)
  const setStaySignedIn = useAuthStore((s) => s.setStaySignedIn)
  const signIn = useAuthStore((s) => s.signIn)
  const register = useAuthStore((s) => s.register)

  const [mode, setMode] = useState<Mode>(userProfile ? 'sign-in' : 'register')
  const [pinError, setPinError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Registration fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pinLength, setPinLength] = useState<4 | 5 | 6>(4)
  const [regPin, setRegPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [regStep, setRegStep] = useState<'form' | 'pin' | 'confirm'>('form')

  async function handleSignIn(pin: string) {
    setPinError(false)
    setErrorMsg('')
    const ok = await signIn(pin)
    if (!ok) {
      setPinError(true)
      setErrorMsg('Incorrect PIN. Please try again.')
    }
  }

  async function handleRegister() {
    setErrorMsg('')
    if (!name.trim()) {
      setErrorMsg('Name is required.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    setRegStep('pin')
  }

  function handleRegPinComplete(pin: string) {
    setRegPin(pin)
    setRegStep('confirm')
  }

  async function handleConfirmPinComplete(pin: string) {
    setConfirmPin(pin)
    if (pin !== regPin) {
      setPinError(true)
      setErrorMsg('PINs do not match. Please try again.')
      setRegStep('pin')
      setRegPin('')
      setConfirmPin('')
      return
    }
    setPinError(false)
    setErrorMsg('')
    await register(
      { name: name.trim(), email: email.trim(), createdAt: new Date().toISOString() },
      pin,
      pinLength
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center gradient-primary">
      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoSrc} alt="Course Clip Studio" className="w-16 h-16 mb-3" />
          <h1 className="text-2xl font-[var(--font-weight-bold)] text-white">Course Clip Studio</h1>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-[var(--bg-surface)] p-8 shadow-xl">
          {mode === 'sign-in' && userProfile ? (
            <SignInPanel
              userProfile={userProfile}
              staySignedIn={staySignedIn}
              setStaySignedIn={setStaySignedIn}
              pinError={pinError}
              errorMsg={errorMsg}
              onSubmit={handleSignIn}
              onSwitchToRegister={() => {
                setMode('register')
                setErrorMsg('')
                setPinError(false)
              }}
            />
          ) : (
            <RegisterPanel
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              pinLength={pinLength}
              setPinLength={setPinLength}
              regStep={regStep}
              pinError={pinError}
              errorMsg={errorMsg}
              onSubmitForm={handleRegister}
              onPinComplete={handleRegPinComplete}
              onConfirmComplete={handleConfirmPinComplete}
              onBack={() => {
                if (regStep === 'confirm') {
                  setRegStep('pin')
                  setRegPin('')
                } else if (regStep === 'pin') {
                  setRegStep('form')
                }
                setPinError(false)
                setErrorMsg('')
              }}
              onSwitchToSignIn={
                userProfile
                  ? () => {
                      setMode('sign-in')
                      setErrorMsg('')
                      setPinError(false)
                    }
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sign In Panel ───

function SignInPanel({
  userProfile,
  staySignedIn,
  setStaySignedIn,
  pinError,
  errorMsg,
  onSubmit,
  onSwitchToRegister
}: {
  userProfile: { name: string; email: string }
  staySignedIn: boolean
  setStaySignedIn: (v: boolean) => void
  pinError: boolean
  errorMsg: string
  onSubmit: (pin: string) => void
  onSwitchToRegister: () => void
}): JSX.Element {
  const [pinLength, setPinLength] = useState<number>(4)

  // Load pin length on mount
  useState(() => {
    window.electronAPI.settings.get('pinLength').then((v) => {
      if (typeof v === 'number') setPinLength(v)
    })
  })

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Welcome back</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{userProfile.name}</p>
      </div>

      <div>
        <p className="text-xs text-[var(--text-tertiary)] text-center mb-3">Enter your PIN</p>
        <PinInput length={pinLength} onComplete={onSubmit} error={pinError} />
        {errorMsg && (
          <p className="text-xs text-[var(--color-danger-600)] text-center mt-2">{errorMsg}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">Stay signed in</span>
        <ToggleSwitch checked={staySignedIn} onChange={setStaySignedIn} label="Stay signed in" />
      </div>

      <div className="text-center">
        <button
          onClick={onSwitchToRegister}
          className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-brand)] cursor-pointer transition-colors"
        >
          Register new account
        </button>
      </div>
    </div>
  )
}

// ─── Register Panel ───

function RegisterPanel({
  name,
  setName,
  email,
  setEmail,
  pinLength,
  setPinLength,
  regStep,
  pinError,
  errorMsg,
  onSubmitForm,
  onPinComplete,
  onConfirmComplete,
  onBack,
  onSwitchToSignIn
}: {
  name: string
  setName: (v: string) => void
  email: string
  setEmail: (v: string) => void
  pinLength: 4 | 5 | 6
  setPinLength: (v: 4 | 5 | 6) => void
  regStep: 'form' | 'pin' | 'confirm'
  pinError: boolean
  errorMsg: string
  onSubmitForm: () => void
  onPinComplete: (pin: string) => void
  onConfirmComplete: (pin: string) => void
  onBack: () => void
  onSwitchToSignIn?: () => void
}): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {regStep === 'form' ? 'Create Account' : regStep === 'pin' ? 'Set Your PIN' : 'Confirm PIN'}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {regStep === 'form'
            ? 'Set up your local profile'
            : regStep === 'pin'
              ? `Choose a ${pinLength}-digit PIN for quick sign-in`
              : 'Enter your PIN again to confirm'}
        </p>
      </div>

      {regStep === 'form' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Your name"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              PIN Length
            </label>
            <div className="flex gap-2">
              {([4, 5, 6] as const).map((len) => (
                <button
                  key={len}
                  onClick={() => setPinLength(len)}
                  className={`
                    px-4 py-1.5 text-sm rounded-md border cursor-pointer transition-colors
                    ${pinLength === len
                      ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }
                  `}
                  aria-pressed={pinLength === len}
                >
                  {len} digits
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-[var(--color-danger-600)] text-center">{errorMsg}</p>
          )}

          <button
            onClick={onSubmitForm}
            className="w-full py-2.5 text-sm font-[var(--font-weight-medium)] text-white bg-[var(--brand-magenta)] rounded-lg hover:bg-[var(--brand-magenta-dark)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            Continue
          </button>
        </div>
      )}

      {regStep === 'pin' && (
        <div className="space-y-4">
          <PinInput length={pinLength} onComplete={onPinComplete} error={pinError} />
          {errorMsg && (
            <p className="text-xs text-[var(--color-danger-600)] text-center">{errorMsg}</p>
          )}
          <button
            onClick={onBack}
            className="w-full py-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          >
            Back
          </button>
        </div>
      )}

      {regStep === 'confirm' && (
        <div className="space-y-4">
          <PinInput length={pinLength} onComplete={onConfirmComplete} error={pinError} />
          {errorMsg && (
            <p className="text-xs text-[var(--color-danger-600)] text-center">{errorMsg}</p>
          )}
          <button
            onClick={onBack}
            className="w-full py-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
          >
            Back
          </button>
        </div>
      )}

      {onSwitchToSignIn && regStep === 'form' && (
        <div className="text-center">
          <button
            onClick={onSwitchToSignIn}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-brand)] cursor-pointer transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  )
}
