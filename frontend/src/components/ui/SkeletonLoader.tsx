import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'title' | 'card' | 'avatar' | 'button' | 'hero' | 'custom';
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number; // For text variant
  rounded?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  lines = 1,
  rounded = false,
}) => {
  const getSkeletonClasses = () => {
    const baseClasses = 'bg-mono-200 animate-skeleton-pulse';
    const roundedClasses = rounded ? 'rounded-full' : 'rounded';
    
    switch (variant) {
      case 'text':
        return `${baseClasses} h-4 ${roundedClasses}`;
      case 'title':
        return `${baseClasses} h-8 ${roundedClasses}`;
      case 'card':
        return `${baseClasses} h-48 w-full rounded-2xl`;
      case 'avatar':
        return `${baseClasses} w-12 h-12 rounded-full`;
      case 'button':
        return `${baseClasses} h-12 w-32 rounded-xl`;
      case 'hero':
        return `${baseClasses} w-full aspect-hero rounded-2xl`;
      case 'custom':
        return `${baseClasses} ${roundedClasses}`;
      default:
        return `${baseClasses} h-4 ${roundedClasses}`;
    }
  };

  const getInlineStyles = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  // For multiple text lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, index) => {
          // Make last line shorter for more realistic appearance
          const isLastLine = index === lines - 1;
          const lineWidth = isLastLine ? '75%' : '100%';
          
          return (
            <div
              key={index}
              className={getSkeletonClasses()}
              style={{ 
                ...getInlineStyles(), 
                width: width || lineWidth 
              }}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`${getSkeletonClasses()} ${className}`}
      style={getInlineStyles()}
    />
  );
};

// Specialized skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card-mono p-6 ${className}`}>
    <SkeletonLoader variant="title" width="60%" className="mb-4" />
    <SkeletonLoader variant="text" lines={3} className="mb-4" />
    <div className="flex justify-between items-center">
      <SkeletonLoader variant="text" width="40%" />
      <SkeletonLoader variant="button" width="80px" height="32px" />
    </div>
  </div>
);

export const SkeletonNavigation: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex space-x-8 ${className}`}>
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="flex items-center space-x-2">
        <SkeletonLoader variant="custom" width="20px" height="20px" rounded />
        <SkeletonLoader variant="text" width="80px" />
      </div>
    ))}
  </div>
);

export const SkeletonHero: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`hero-mono text-center ${className}`}>
    <div className="container-mono">
      <SkeletonLoader variant="hero" className="mb-8" />
      <SkeletonLoader variant="title" width="60%" className="mb-4 mx-auto" />
      <SkeletonLoader variant="text" width="40%" className="mb-8 mx-auto" />
      <SkeletonLoader variant="button" width="160px" height="48px" className="mx-auto" />
    </div>
  </div>
);

export const SkeletonRecipeGrid: React.FC<{ count?: number; className?: string }> = ({ 
  count = 8, 
  className = '' 
}) => (
  <div className={`grid-mono-cards ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonAccordion: React.FC<{ panels?: number; className?: string }> = ({ 
  panels = 4, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: panels }, (_, index) => (
      <div key={index} className="accordion-mono">
        <div className="accordion-header-mono">
          <SkeletonLoader variant="text" width="30%" />
          <SkeletonLoader variant="custom" width="20px" height="20px" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;