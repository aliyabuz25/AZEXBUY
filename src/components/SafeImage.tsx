import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: string;
  fallbackText?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  fallbackIcon = 'fa-regular fa-image',
  fallbackText = 'Şəkil yoxdur',
  containerClassName = '',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(Boolean(src));

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
      {loading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
          <i className="fa-solid fa-circle-notch animate-spin text-slate-300 text-sm"></i>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}`}
        {...props}
      />
    </div>
  );
};
