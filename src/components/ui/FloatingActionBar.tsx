"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingActionBarProps {
  isVisible: boolean
  selectedCount: number
  onClear: () => void
  children: React.ReactNode
}

export function FloatingActionBar({ isVisible, selectedCount, onClear, children }: FloatingActionBarProps) {
  // Respect reduced motion
  const isReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={isReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          animate={isReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={isReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 print-hidden"
        >
          <div className="bg-ink text-white border-4 border-black p-4 shadow-[8px_8px_0_#FDE047] flex items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="bg-yellow text-ink font-black px-3 py-1 text-lg">
                {selectedCount} Selected
              </span>
              <button 
                onClick={onClear}
                className="text-white hover:text-red font-bold underline text-sm focus-visible:ring-4 focus-visible:ring-white outline-none px-1"
              >
                Clear Selection
              </button>
            </div>
            
            <div className="h-8 w-1 bg-white/20 mx-2" />
            
            <div className="flex items-center gap-3">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
