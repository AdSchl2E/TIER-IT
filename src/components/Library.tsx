import React, { useRef, useState } from 'react';
import DraggableImage from './DraggableImage';
import { ImageItem } from '../hooks/useDragManager';
import { PlusIcon, TrashIcon } from './Icons';

interface LibraryProps {
  images: ImageItem[];
  onImagesAdd: (files: FileList) => void;
  onImageDelete: (imageId: string) => void;
  onDragStart: (e: React.DragEvent, item: ImageItem) => void;
  onDragEnd: (e: React.DragEvent) => void;
  draggedItemId: string | null;
}

const Library: React.FC<LibraryProps> = ({
  images,
  onImagesAdd,
  onImageDelete,
  onDragStart,
  onDragEnd,
  draggedItemId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showButtonsForId, setShowButtonsForId] = useState<string | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const dragStartedRef = useRef(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImagesAdd(e.target.files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageTap = (imageId: string) => {
    // Don't show buttons if a drag just occurred
    if (dragStartedRef.current) {
      dragStartedRef.current = false;
      return;
    }
    
    // Clear existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Show buttons for this image
    setShowButtonsForId(imageId);
    
    // Hide after 2 seconds
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowButtonsForId(null);
    }, 2000);
  };

  return (
    <div className="w-full h-fit bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 lg:p-6 fixed bottom-0 left-0 right-0 z-50 lg:sticky lg:top-4 lg:bottom-auto lg:left-auto lg:right-auto">
      {/* Desktop: Vertical layout with header */}
      <div className="hidden lg:flex flex-col gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Library
        </h2>
        <button
          onClick={handleButtonClick}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <PlusIcon />
          Add Images
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Mobile: Horizontal header with button */}
      <div className="flex lg:hidden items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Library
        </h2>
        <button
          onClick={handleButtonClick}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2 text-sm"
        >
          <PlusIcon />
          Add
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Desktop: Grid layout with vertical scroll */}
      <div className="hidden lg:grid grid-cols-3 gap-2 min-h-[200px] max-h-[calc(100vh-240px)] overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900 rounded-lg scrollbar-custom auto-rows-max">
        {images.length === 0 ? (
          <div className="col-span-3 text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No images yet. Click "Add Images" to get started.
          </div>
        ) : (
          images.map((item) => (
            <div key={item.id} className="relative group w-20 h-20">
              <DraggableImage
                item={item}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                isDragging={item.id === draggedItemId}
              />
              <button
                onClick={() => onImageDelete(item.id)}
                className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Mobile: Horizontal scroll with single row */}
      <div className="flex lg:hidden gap-2 overflow-x-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-lg scrollbar-custom">
        {images.length === 0 ? (
          <div className="w-full text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
            No images yet
          </div>
        ) : (
          images.map((item) => (
            <div 
              key={item.id} 
              className="relative w-20 h-20 flex-shrink-0"
              onClick={() => handleImageTap(item.id)}
            >
              <DraggableImage
                item={item}
                onDragStart={(e) => {
                  dragStartedRef.current = true;
                  onDragStart(e, item);
                }}
                onDragEnd={(e) => {
                  onDragEnd(e);
                  setTimeout(() => {
                    dragStartedRef.current = false;
                  }, 100);
                }}
                isDragging={item.id === draggedItemId}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageDelete(item.id);
                }}
                className={`absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-opacity ${
                  showButtonsForId === item.id ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;
