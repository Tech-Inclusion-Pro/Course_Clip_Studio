import { create } from 'zustand'
import type { UserProfile } from '@/types/auth'

interface AuthState {
  userProfile: UserProfile | null
  isAuthenticated: boolean
  staySignedIn: boolean
  onboardingComplete: boolean
  authLoaded: boolean

  loadAuthState: () => Promise<void>
  register: (profile: UserProfile, pin: string, pinLength: number) => Promise<void>
  signIn: (pin: string) => Promise<boolean>
  signOut: () => Promise<void>
  setStaySignedIn: (v: boolean) => void
  setOnboardingComplete: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  userProfile: null,
  isAuthenticated: false,
  staySignedIn: false,
  onboardingComplete: false,
  authLoaded: false,

  loadAuthState: async () => {
    try {
      const userProfile = (await window.electronAPI.settings.get('userProfile')) as UserProfile | null
      const staySignedIn = ((await window.electronAPI.settings.get('staySignedIn')) as boolean) ?? false
      const sessionActive = ((await window.electronAPI.settings.get('sessionActive')) as boolean) ?? false
      const onboardingComplete = ((await window.electronAPI.settings.get('onboardingComplete')) as boolean) ?? false

      const isAuthenticated = !!userProfile && staySignedIn && sessionActive

      set({
        userProfile,
        staySignedIn,
        onboardingComplete,
        isAuthenticated,
        authLoaded: true
      })
    } catch (err) {
      console.error('Failed to load auth state:', err)
      set({ authLoaded: true })
    }
  },

  register: async (profile, pin, pinLength) => {
    await window.electronAPI.settings.set('userProfile', profile)
    await window.electronAPI.settings.set('pinLength', pinLength)
    await window.electronAPI.settings.set('sessionActive', true)
    await window.electronAPI.secrets.set('userPin', pin)

    set({
      userProfile: profile,
      isAuthenticated: true,
      onboardingComplete: false
    })
  },

  signIn: async (pin) => {
    const storedPin = await window.electronAPI.secrets.get('userPin')
    if (storedPin === pin) {
      await window.electronAPI.settings.set('sessionActive', true)
      set({ isAuthenticated: true })
      return true
    }
    return false
  },

  signOut: async () => {
    await window.electronAPI.settings.set('sessionActive', false)
    set({ isAuthenticated: false })
  },

  setStaySignedIn: (v) => {
    set({ staySignedIn: v })
    window.electronAPI.settings.set('staySignedIn', v)
  },

  setOnboardingComplete: () => {
    set({ onboardingComplete: true })
    window.electronAPI.settings.set('onboardingComplete', true)
  }
}))
