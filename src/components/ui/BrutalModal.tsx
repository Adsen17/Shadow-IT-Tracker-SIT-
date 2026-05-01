"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export interface BrutalModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BrutalModal({ isOpen, onClose, title, children }: BrutalModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = "unset"
    }
    
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Respect reduced motion
  const isReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-ink/50 z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              animate={isReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={isReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white border-4 border-ink shadow-brutal-lg w-full max-w-lg pointer-events-auto flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b-4 border-ink bg-primary text-white">
                <h2 className="text-xl font-black tracking-tight">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1 border-2 border-transparent hover:border-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
