"use client"

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionSectionProps extends HTMLMotionProps<"section"> {
  children: ReactNode
  className?: string
}

export default function MotionSection({ children, className, ...props }: MotionSectionProps) {
  return (
    <motion.section className={className} {...props}>
      {children}
    </motion.section>
  )
}