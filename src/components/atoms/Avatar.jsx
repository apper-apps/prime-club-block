import React, { forwardRef, useState } from "react";
import { cn } from "@/utils/cn";

const sizes = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm', 
  lg: 'h-10 w-10 text-base',
  xl: 'h-12 w-12 text-lg',
  '2xl': 'h-16 w-16 text-xl'
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const Avatar = forwardRef(({ 
  src, 
  alt, 
  size = 'md', 
  className, 
  name,
  ...props 
}, ref) => {
  const [showImage, setShowImage] = useState(true)

  const handleImageError = () => {
    setShowImage(false)
  }

  const hasValidSrc = src && typeof src === 'string' && src.trim() !== ''

  return (
    <div
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden',
        sizes[size],
        className
      )}
      {...props}
    >
{hasValidSrc && showImage ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover rounded-full transition-opacity duration-300"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <span className={cn(
          'font-medium text-gray-600',
          sizes[size]
        )}>
          {getInitials(name)}
        </span>
      )}
    </div>
  )
})

Avatar.displayName = 'Avatar'

export default Avatar