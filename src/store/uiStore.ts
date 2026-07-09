import { create } from 'zustand'

export type Scene =
  | 'lobby'
  | 'tourboard'
  | 'deck'
  | 'match'
  | 'final'
  | 'result'

export type Overlay = null | 'rules' | 'stats' | 'cardDetail' | 'settings'

type UIState = {
  scene: Scene
  overlay: Overlay
  overlayFocusId: string | null
  setScene: (s: Scene) => void
  openOverlay: (o: Overlay, focusId?: string | null) => void
  closeOverlay: () => void
}

export const useUI = create<UIState>((set) => ({
  scene: 'lobby',
  overlay: null,
  overlayFocusId: null,
  setScene: (scene) => set({ scene }),
  openOverlay: (overlay, focusId = null) => set({ overlay, overlayFocusId: focusId }),
  closeOverlay: () => set({ overlay: null, overlayFocusId: null }),
}))
