import React from 'react';
import { Platform } from '../types';

interface PlatformIconProps {
  platform: Platform;
  className?: string;
  size?: number;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = 'w-5 h-5', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  switch (platform) {
    case 'slack':
      return (
        <svg
          viewBox="0 0 122.8 122.8"
          className={className}
          style={style}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9z" fill="#E01E5A" />
          <path d="M32.2 77.6c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#E01E5A" />
          <path d="M45.1 25.8c-7.1 0-12.9-5.8-12.9-12.9S38 0 45.1 0s12.9 5.8 12.9 12.9v12.9H45.1z" fill="#36C5F0" />
          <path d="M45.1 32.2c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58 0 52.2 0 45.1s5.8-12.9 12.9-12.9h32.2z" fill="#36C5F0" />
          <path d="M97 45.1c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.1z" fill="#2EB67D" />
          <path d="M90.6 45.1c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C77.7 5.8 83.5 0 90.6 0s12.9 5.8 12.9 12.9v32.2z" fill="#2EB67D" />
          <path d="M77.7 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9z" fill="#ECB22E" />
          <path d="M77.7 90.6c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.2c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.7z" fill="#ECB22E" />
        </svg>
      );

    case 'telegram':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          style={style}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.93 3.48a1.5 1.5 0 0 0-1.63-.3L2.83 10.37a1.5 1.5 0 0 0-.08 2.76l4.9 2.05 1.76 5.37a1.5 1.5 0 0 0 2.45.62l3.07-2.73 4.8 3.52a1.5 1.5 0 0 0 2.37-.89l3.14-15.6a1.5 1.5 0 0 0-.31-1.49ZM8.96 14.1l9.9-6.9-7.9 7.85-.29 3.03-1.71-3.98Z"
            fill="#229ED9"
          />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg
          viewBox="0 0 24 24"
          className={className}
          style={style}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M17.5 14.39c-.28-.14-1.65-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.29-.73.9-.9 1.09-.16.19-.33.21-.61.07-.28-.14-1.19-.44-2.27-1.4-.84-.75-1.41-1.68-1.57-1.96-.17-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.1-.19.05-.35-.02-.5-.08-.14-.64-1.55-.88-2.12-.23-.56-.47-.48-.64-.49-.17-.01-.36-.01-.55-.01-.19 0-.5.07-.76.35-.26.29-1 1-1 2.42s1.02 2.8 1.17 3c.14.19 2.01 3.07 4.88 4.31.68.29 1.21.47 1.63.6.69.22 1.32.19 1.82.11.55-.08 1.65-.67 1.89-1.33.23-.65.23-1.21.16-1.33-.07-.11-.25-.18-.53-.32zM12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.08-1.33C8.53 21.52 10.22 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"
            fill="#25D366"
          />
        </svg>
      );

    case 'discord':
      return (
        <svg
          viewBox="0 0 127.14 96.36"
          className={className}
          style={style}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,0,72.37,72.37,0,0,0,45.64,6.83,97.34,97.34,0,0,0,19.41,8.07C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.69,1.76,1.37,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.07-12.69,11.45-12.69S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5.07-12.69,11.44-12.69S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"
            fill="#5865F2"
          />
        </svg>
      );
  }
};

export const getPlatformBadgeStyle = (platform: Platform) => {
  switch (platform) {
    case 'slack':
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        name: 'Slack',
      };
    case 'telegram':
      return {
        bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        dot: 'bg-sky-400',
        name: 'Telegram',
      };
    case 'whatsapp':
      return {
        bg: 'bg-green-500/10 text-green-400 border-green-500/30',
        dot: 'bg-green-400',
        name: 'WhatsApp',
      };
    case 'discord':
      return {
        bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        dot: 'bg-indigo-400',
        name: 'Discord',
      };
  }
};
