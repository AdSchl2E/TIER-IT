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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) return;
    
    timeoutRef.current = window.setTimeout(() => {
      setLongPressTriggered(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Simulate drag start
      if (elementRef.current) {
        const dragEvent = new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
        });
        elementRef.current.dispatchEvent(dragEvent);
      }
    }, 200);
  };

  const handleMouseUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLongPressTriggered(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    timeoutRef.current = window.setTimeout(() => {
      setLongPressTriggered(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 200);
  };

  const handleTouchEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setTimeout(() => setLongPressTriggered(false), 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      draggable={!isMobile || longPressTriggered}
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={(e) => {
        onDragEnd(e);
        setLongPressTriggered(false);
      }}
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
        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
        ${longPressTriggered ? 'scale-110 z-50' : ''}
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
