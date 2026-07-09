import { create } from 'zustand'

export type ToastKind = 'info' | 'warn' | 'error' | 'success'

export type Toast = {
  id: number
  kind: ToastKind
  message: string
}

type ToastStore = {
  toasts: Toast[]
  push: (kind: ToastKind, message: string, durationMs?: number) => void
  dismiss: (id: number) => void
}

let nextId = 1

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  push: (kind, message, durationMs = 3000) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, durationMs)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Convenience shortcuts. */
export const toast = {
  info:    (msg: string) => useToast.getState().push('info', msg),
  warn:    (msg: string) => useToast.getState().push('warn', msg),
  error:   (msg: string) => useToast.getState().push('error', msg),
  success: (msg: string) => useToast.getState().push('success', msg),
}
