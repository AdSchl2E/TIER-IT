import React, { useState, useEffect, useRef } from 'react';
import { ImageItem } from '../hooks/useDragManager';

interface DraggableImageProps {
  item: ImageItem;
  onDragStart: (e: React.DragEvent, item: ImageItem) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  item,
  onDragStart,
  onDragEnd,
  isDragging = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [canDrag, setCanDrag] = useState(false);
  const pressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = () => {
    if (!isMobile) return;
    
    setIsPressing(true);
    pressTimerRef.current = window.setTimeout(() => {
      setCanDrag(true);
      setIsPressing(false);
      // Vibration feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 150); // Reduced from default ~500ms to 150ms
  };

  const handleTouchEnd = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setIsPressing(false);
    setCanDrag(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isMobile && !canDrag) {
      e.preventDefault();
      return;
    }
    onDragStart(e, item);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={(e) => {
        onDragEnd(e);
        handleTouchEnd();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`
        w-20 h-20 rounded-lg overflow-hidden cursor-move
        transition-all duration-200 ease-out
        bg-white dark:bg-gray-800
        shadow-md hover:shadow-xl
        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
        ${isPressing ? 'scale-95 ring-2 ring-blue-400' : ''}
        ${canDrag ? 'ring-2 ring-green-400' : ''}
      `}
    >
      <img
        src={item.url}
        alt={item.file?.name || 'Image'}
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />
    </div>
  );
};

export default DraggableImage;
