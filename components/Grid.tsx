import React, { CSSProperties, ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
  minWidth?: string;
  className?: string;
  style?: CSSProperties;
  equalHeight?: boolean;
  masonry?: boolean;
}

const Grid: React.FC<GridProps> = ({
  children,
  columns = 3,
  gap = 1,
  minWidth = '250px',
  className = '',
  style,
  equalHeight = false,
  masonry = false
}) => {
  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: masonry 
      ? `repeat(auto-fill, minmax(${minWidth}, 1fr))`
      : `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
    gap: `${gap}rem`,
    alignItems: equalHeight ? 'stretch' : 'start',
    ...style
  };

  if (masonry) {
    return (
      <div 
        className={`masonry-grid ${className}`}
        style={gridStyle}
      >
        {children}
      </div>
    );
  }

  return (
    <div 
      className={`uniform-grid ${className}`}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

interface GridItemProps {
  children: ReactNode;
  span?: number;
  className?: string;
  style?: CSSProperties;
  aspectRatio?: '16/9' | '1/1' | '4/3';
}

const GridItem: React.FC<GridItemProps> = ({
  children,
  span = 1,
  className = '',
  style,
  aspectRatio
}) => {
  const itemStyle: CSSProperties = {
    gridColumn: `span ${span}`,
    ...style
  };

  const aspectClass = aspectRatio === '16/9' 
    ? 'aspect-16-9' 
    : aspectRatio === '1/1' 
      ? 'aspect-1-1' 
      : aspectRatio === '4/3' 
        ? 'aspect-4-3' 
        : '';

  return (
    <div 
      className={`grid-item ${aspectClass} ${className}`}
      style={itemStyle}
    >
      {children}
    </div>
  );
};

interface CardProps {
  children: ReactNode;
  image?: string;
  alt?: string;
  className?: string;
  contentClassName?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  image,
  alt = '',
  className = '',
  contentClassName = ''
}) => {
  return (
    <div className={`uniform-card ${className}`}>
      {image && (
        <img 
          src={image} 
          alt={alt} 
          className="uniform-card-image img-cover"
          loading="lazy"
        />
      )}
      <div className={`uniform-card-content ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

export { Grid, GridItem, Card };