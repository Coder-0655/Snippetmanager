"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'

interface ModernButtonProps extends ButtonProps {
  animate?: boolean
}

export function ModernButton({ 
  children, 
  className, 
  animate = false,
  ...props 
}: ModernButtonProps) {
  if (animate) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="inline-block"
      >
        <Button 
          className={cn("shadow-md hover:shadow-lg transition-shadow", className)} 
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }

  return (
    <Button className={className} {...props}>
      {children}
    </Button>
  );
}