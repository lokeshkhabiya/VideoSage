"use client"

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionSectionProps {
  children: ReactNode
  className?: string
  [key: string]: any
}

export default function MotionSection({ children, className, ...props }: MotionSectionProps) {
  return (
    <motion.section className={className} {...props}>
      {children}
    </motion.section>
  )
} 