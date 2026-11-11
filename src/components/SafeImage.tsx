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
  fallbackIcon = 'fa-solid fa-image-slash',
  fallbackText = 'Şəkil yüklənmədi',
  containerClassName = '',
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!src || error) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 select-none ${containerClassName}`}
        title={alt || 'Image unavailable'}
      >
        <div className="w-9 h-9 rounded-full bg-slate-200/80 flex items-center justify-center mb-1 text-slate-500 shadow-2xs">
          <i className={`${fallbackIcon} text-base`}></i>
        </div>
        <span className="text-[10px] font-medium text-slate-400 tracking-tight text-center px-1">
          {fallbackText}
        </span>
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
