import React, { useState } from 'react';

/**
 * Optimizes external image URLs (Unsplash, Google UserContent) by dynamically
 * requesting next-gen WebP/AVIF formats, optimal dimensions, and compression.
 */
export function optimizeImageUrl(url: string | undefined | null, targetWidth: number = 800): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Unsplash CDN optimization: WebP/AVIF auto-format, quality 75, target width
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const u = new URL(trimmed);
      u.searchParams.set('auto', 'format');
      if (!u.searchParams.has('q') || Number(u.searchParams.get('q')) > 75) {
        u.searchParams.set('q', '75');
      }
      const currentW = Number(u.searchParams.get('w'));
      if (!currentW || currentW > targetWidth) {
        u.searchParams.set('w', String(targetWidth));
      }
      return u.toString();
    } catch {
      return trimmed;
    }
  }

  // Google lh3 UserContent optimization: dynamic width and modern WebP (-rw)
  if (trimmed.includes('lh3.googleusercontent.com') && !trimmed.includes('=w')) {
    return `${trimmed}=w${targetWidth}-rw`;
  }

  return trimmed;
}

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: string;
  fallbackText?: string;
  containerClassName?: string;
  targetWidth?: number;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackIcon = 'fa-regular fa-image',
  fallbackText = 'Şəkil yoxdur',
  containerClassName = '',
  targetWidth = 600,
  loading = 'lazy',
  decoding = 'async',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loadingState, setLoadingState] = useState(Boolean(src));

  const optimizedSrc = optimizeImageUrl(src, targetWidth);
  const isInvalid = !src || typeof src !== 'string' || !src.trim() || src.includes('1542838132-92c53300491e');

  if (isInvalid || error) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-slate-100/90 text-slate-400 p-3 select-none ${containerClassName}`}
        title={alt || fallbackText}
      >
        <div className="w-11 h-11 rounded-full bg-slate-200/80 border border-slate-300/60 flex items-center justify-center mb-1.5 text-slate-400 shadow-2xs">
          <i className={`${fallbackIcon} text-lg opacity-75`}></i>
        </div>
        {fallbackText ? (
          <span className="text-[11px] font-semibold text-slate-400 tracking-tight text-center px-1">
            {fallbackText}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${containerClassName}`}>
      {loadingState && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
          <i className="fa-solid fa-circle-notch animate-spin text-slate-300 text-sm"></i>
        </div>
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        referrerPolicy="no-referrer"
        onLoad={() => setLoadingState(false)}
        onError={() => {
          setError(true);
          setLoadingState(false);
        }}
        className={`${className} ${loadingState ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}`}
        {...props}
      />
    </div>
  );
};
