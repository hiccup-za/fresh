'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'fresh-settings'

function readShowTestIds(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.developer?.showTestIds === true
    }
  } catch {}
  return false
}

function apply(enabled: boolean) {
  if (enabled) {
    document.documentElement.setAttribute('data-show-test-ids', '')
  } else {
    document.documentElement.removeAttribute('data-show-test-ids')
  }
}

export function TestIdHighlighter() {
  useEffect(() => {
    apply(readShowTestIds())

    function onSettingsChanged() {
      apply(readShowTestIds())
    }

    window.addEventListener('fresh-settings-changed', onSettingsChanged)
    window.addEventListener('storage', onSettingsChanged)
    return () => {
      window.removeEventListener('fresh-settings-changed', onSettingsChanged)
      window.removeEventListener('storage', onSettingsChanged)
    }
  }, [])

  return null
}
