"use client"

import * as React from "react"
import { BrutalButton } from "./BrutalButton"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t-4 border-ink p-4 bg-surface print-hidden">
      <p className="font-bold text-sm">
        Page <span className="font-black text-lg">{currentPage}</span> of <span className="font-black text-lg">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <BrutalButton 
          variant="secondary" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Prev</span>
        </BrutalButton>
        <BrutalButton 
          variant="secondary" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={20} />
        </BrutalButton>
      </div>
    </div>
  )
}
