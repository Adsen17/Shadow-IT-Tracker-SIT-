"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { FolderOpen } from "lucide-react"

export function EmptyState({ title, description, action }: { title: string, description: string, action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center border-4 border-ink border-dashed bg-white m-4"
    >
      <div className="w-20 h-20 bg-yellow border-4 border-ink shadow-[4px_4px_0_#111] flex items-center justify-center mb-6 text-ink">
        <FolderOpen size={40} />
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{title}</h3>
      <p className="text-muted font-bold max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  )
}
