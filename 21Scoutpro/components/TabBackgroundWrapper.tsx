import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TabBackgroundWrapperProps {
  children: React.ReactNode;
}

export const TabBackgroundWrapper: React.FC<TabBackgroundWrapperProps> = ({ children }) => {
  const { isLight } = useTheme();
  
  return (
    <div className={`min-h-screen w-full relative ${isLight ? 'bg-gray-50' : 'bg-black'} overflow-hidden font-sans ${isLight ? 'text-gray-900' : 'text-white'}`}>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

