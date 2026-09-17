import React, { useState } from 'react';

interface AvatarProps {
  photoUrl?: string;
  nomPrenom: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  id?: string;
  border?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base font-bold',
  xl: 'w-20 h-20 text-xl font-bold',
  '2xl': 'w-28 h-28 text-2xl font-bold'
};

const gradients = [
  'from-blue-600 to-indigo-600',
  'from-teal-600 to-emerald-600',
  'from-violet-600 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-600 to-blue-600',
  'from-fuchsia-600 to-rose-600'
];

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  photoUrl,
  nomPrenom,
  size = 'md',
  className = '',
  id,
  border = true
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(nomPrenom);
  const gradient = getGradient(nomPrenom || 'User');
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  const hasValidPhoto = photoUrl && photoUrl.trim().length > 0 && !imgError;

  return (
    <div
      id={id}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden font-bold select-none ${sizeClass} ${
        border ? 'ring-2 ring-white shadow-xs' : ''
      } ${className}`}
    >
      {hasValidPhoto ? (
        <img
          src={photoUrl}
          alt={nomPrenom}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-2xl"
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center text-white bg-gradient-to-br ${gradient} rounded-2xl shadow-inner`}
        >
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
};
