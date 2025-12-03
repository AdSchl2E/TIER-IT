import React from 'react';

interface DropPlaceholderProps {
  isVisible: boolean;
  orientation?: 'vertical' | 'horizontal';
}

const DropPlaceholder: React.FC<DropPlaceholderProps> = ({ 
  isVisible, 
  orientation = 'vertical' 
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={`
        bg-blue-500 rounded-sm transition-all duration-150
        ${orientation === 'vertical' ? 'w-1 h-20' : 'w-20 h-1'}
      `}
    />
  );
};

export default DropPlaceholder;
