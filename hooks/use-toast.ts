"use client"

import { toast as sonnerToast } from "sonner"

// Toast types to match the existing API
type ToastVariant = "default" | "destructive"

interface ToastProps {
  title?: string
  description?: string
  variant?: ToastVariant
  action?: {
    label: string
    onClick: () => void
  }
}

// Main toast function using Sonner
function toast({ title, description, variant = "default", action }: ToastProps) {
  if (variant === "destructive") {
    return sonnerToast.error(title || "Error", {
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined
    })
  }
  
  return sonnerToast(title || "Notification", {
    description,
    action: action ? {
      label: action.label,
      onClick: action.onClick
    } : undefined
  })
}

// Hook that returns the toast methods
function useToast() {
  return {
    toast: Object.assign(toast, {
      success: (title: string, options?: { description?: string; action?: ToastProps['action'] }) =>
        sonnerToast.success(title, {
          description: options?.description,
          action: options?.action
        }),
        
      error: (title: string, options?: { description?: string; action?: ToastProps['action'] }) =>
        sonnerToast.error(title, {
          description: options?.description,
          action: options?.action
        }),
        
      loading: (title: string, options?: { description?: string }) =>
        sonnerToast.loading(title, {
          description: options?.description
        }),
        
      info: (title: string, options?: { description?: string; action?: ToastProps['action'] }) =>
        sonnerToast.info(title, {
          description: options?.description,
          action: options?.action
        }),
        
      warning: (title: string, options?: { description?: string; action?: ToastProps['action'] }) =>
        sonnerToast.warning(title, {
          description: options?.description,
          action: options?.action
        }),
        
      dismiss: (id?: string | number) => sonnerToast.dismiss(id)
    }),
    dismiss: (id?: string | number) => sonnerToast.dismiss(id)
  }
}

export { useToast, toast }

