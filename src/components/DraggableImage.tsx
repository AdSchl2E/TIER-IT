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
  const [pressProgress, setPressProgress] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const pressStartTime = useRef<number>(0);

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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLongPressTriggered(false);
    setActuallyDragging(false);
    setPressProgress(0);
  };

  const handleMouseDown = () => {
    if (!isMobile) return;
    
    pressStartTime.current = Date.now();
    setPressProgress(0);
    
    // Update progress every 16ms (60fps)
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - pressStartTime.current;
      const progress = Math.min(elapsed / 500, 1); // 500ms duration
      setPressProgress(progress);
    }, 16);
    
    timeoutRef.current = window.setTimeout(() => {
      setLongPressTriggered(true);
      setPressProgress(1);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleMouseUp = () => {
    clearAllStates();
  };

  const handleTouchStart = () => {
    if (!isMobile) return;
    
    pressStartTime.current = Date.now();
    setPressProgress(0);
    
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - pressStartTime.current;
      const progress = Math.min(elapsed / 500, 1);
      setPressProgress(progress);
    }, 16);
    
    timeoutRef.current = window.setTimeout(() => {
      setLongPressTriggered(true);
      setPressProgress(1);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
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
  const borderOpacity = pressProgress;

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
        ${longPressTriggered && !actuallyDragging ? 'scale-110 z-50' : ''}
      `}
      style={{
        boxShadow: pressProgress > 0 && !actuallyDragging
          ? `0 0 0 ${2 + pressProgress * 2}px rgba(34, 197, 94, ${borderOpacity})` 
          : undefined
      }}
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
