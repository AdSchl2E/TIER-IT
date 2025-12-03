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
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [actuallyDragging, setActuallyDragging] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const clearAllStates = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLongPressTriggered(false);
    setActuallyDragging(false);
  };

  const handleMouseDown = () => {
    if (!isMobile) return;
    
    timeoutRef.current = window.setTimeout(() => {
      setLongPressTriggered(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 200);
  };

  const handleMouseUp = () => {
    clearAllStates();
  };

  const handleTouchStart = () => {
    if (!isMobile) return;
    
    timeoutRef.current = window.setTimeout(() => {
      setLongPressTriggered(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 200);
  };

  const handleTouchEnd = () => {
    clearAllStates();
  };

  const handleDragStart = (e: React.DragEvent) => {
    setActuallyDragging(true);
    onDragStart(e, item);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd(e);
    clearAllStates();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset states when isDragging prop changes to false
  useEffect(() => {
    if (!isDragging) {
      clearAllStates();
    }
  }, [isDragging]);

  const showDraggingStyle = isDragging && actuallyDragging;

  return (
    <div
      ref={elementRef}
      draggable={!isMobile || longPressTriggered}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`
        w-20 h-20 rounded-lg overflow-hidden cursor-move
        transition-all duration-200 ease-out
        bg-white dark:bg-gray-800
        shadow-md hover:shadow-xl
        ${showDraggingStyle ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
        ${longPressTriggered && !actuallyDragging ? 'scale-110 ring-2 ring-green-400 z-50' : ''}
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
