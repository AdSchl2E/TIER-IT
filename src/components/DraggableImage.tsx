import React from 'react';
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
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragEnd={onDragEnd}
      className={`
        w-20 h-20 rounded-lg overflow-hidden cursor-move
        transition-all duration-200 ease-out
        bg-white dark:bg-gray-800
        shadow-md hover:shadow-xl
        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
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
