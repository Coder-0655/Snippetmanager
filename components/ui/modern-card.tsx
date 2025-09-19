"use client"

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  hover: { 
    y: -5,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  }
}

type CardVariant = 'default' | 'elevated' | 'glass' | 'gradient'

interface ModernCardProps {
  children?: React.ReactNode
  className?: string
  variant?: CardVariant
  animate?: boolean
  onClick?: () => void
}

const cardStyles = {
  default: "bg-card text-card-foreground border border-border",
  elevated: "bg-card text-card-foreground shadow-lg border border-border",
  glass: "bg-card/80 backdrop-blur-md text-card-foreground border border-border/50",
  gradient: "bg-gradient-to-br from-card to-card/90 text-card-foreground border border-border shadow-md"
}

export function ModernCard({ 
  children, 
  className = "", 
  variant = "default", 
  animate = false,
  onClick
}: ModernCardProps) {
  const baseStyles = "rounded-lg p-6 transition-colors"
  
  if (animate) {
    return (
      <motion.div
        className={cn(baseStyles, cardStyles[variant], className)}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(baseStyles, cardStyles[variant], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}