// ─── i18n Initialization ───
// The old i18next setup has been replaced by the AI-driven locale store.
// This file is kept as a no-op entry point for backward compatibility.
// All translations now flow through useLocaleStore / useT().

import { useLocaleStore } from '@/stores/useLocaleStore'

// Initialize with English on load
useLocaleStore.getState()
