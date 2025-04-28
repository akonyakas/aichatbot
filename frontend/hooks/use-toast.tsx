"use client"

import { useState, useEffect } from "react"

type ToastProps = {
  title: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type Toast = ToastProps & {
  id: string
  visible: boolean
}

// Simple toast state management
const toasts: Toast[] = []
let listeners: Array<(toasts: Toast[]) => void> = []

const addToast = (toast: ToastProps) => {
  const id = Math.random().toString(36).substring(2, 9)
  const newToast = { ...toast, id, visible: true }
  toasts.push(newToast)
  listeners.forEach((listener) => listener([...toasts]))

  // Auto-dismiss
  setTimeout(() => {
    dismissToast(id)
  }, toast.duration || 3000)
}

const dismissToast = (id: string) => {
  const index = toasts.findIndex((t) => t.id === id)
  if (index !== -1) {
    toasts[index].visible = false
    listeners.forEach((listener) => listener([...toasts]))

    // Remove from array after animation
    setTimeout(() => {
      const removeIndex = toasts.findIndex((t) => t.id === id)
      if (removeIndex !== -1) {
        toasts.splice(removeIndex, 1)
        listeners.forEach((listener) => listener([...toasts]))
      }
    }, 300)
  }
}

export function useToasts() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts)

  useEffect(() => {
    listeners.push(setCurrentToasts)
    return () => {
      listeners = listeners.filter((listener) => listener !== setCurrentToasts)
    }
  }, [])

  return {
    toasts: currentToasts,
    dismissToast,
  }
}

export function toast(props: ToastProps) {
  addToast(props)
}

// Export a component for rendering toasts
export function Toaster() {
  const { toasts, dismissToast } = useToasts()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            p-4 rounded-lg shadow-lg transition-all duration-300 
            ${toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} 
            ${toast.variant === "destructive" ? "bg-red-600 text-white" : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"}
          `}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && <p className="text-sm opacity-90 mt-1">{toast.description}</p>}
            </div>
            <button onClick={() => dismissToast(toast.id)} className="ml-4 text-sm opacity-70 hover:opacity-100">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
