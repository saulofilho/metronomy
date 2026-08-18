import React, { useState } from 'react';
import appIcon from '../assets/images/metronome_app_icon_1787060197591.jpg';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  return (
    <div
      id="app-logo-container"
      className={`relative overflow-hidden border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.35)] flex-shrink-0 bg-zinc-900 flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      {!imageError ? (
        <img
          src={appIcon}
          alt="Metrônomo Pro"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Fallback High-Contrast Vector Icon */
        <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center p-1">
          <svg
            viewBox="0 0 40 40"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Pyramid body */}
            <path
              d="M13 32L17 8H23L27 32H13Z"
              fill="#18181b"
              stroke="#06b6d4"
              strokeWidth="1.5"
            />
            {/* Scale lines */}
            <line x1="17" y1="16" x2="23" y2="16" stroke="#52525b" strokeWidth="1" />
            <line x1="16" y1="22" x2="24" y2="22" stroke="#52525b" strokeWidth="1" />
            {/* Glowing Pendulum Needle */}
            <line
              x1="20"
              y1="30"
              x2="26"
              y2="10"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Bob Weight */}
            <rect
              x="22"
              y="16"
              width="4"
              height="5"
              rx="1"
              fill="#22d3ee"
            />
            {/* Pivot */}
            <circle cx="20" cy="30" r="2" fill="#22d3ee" />
          </svg>
        </div>
      )}
    </div>
  );
};
