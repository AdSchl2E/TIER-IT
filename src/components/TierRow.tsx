import React, { useRef, useState } from 'react';
import DraggableImage from './DraggableImage';
import DropPlaceholder from './DropPlaceholder';
import { ImageItem } from '../hooks/useDragManager';
import { TrashIcon, ReturnIcon, EditIcon } from './Icons';

interface TierRowProps {
  tierId: string;
  tierName: string;
  tierColor: string;
  items: ImageItem[];
  onDragStart: (e: React.DragEvent, item: ImageItem, tierId: string, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, tierId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, tierId: string) => void;
  onDelete: (tierId: string) => void;
  onReturnToLibrary: (item: ImageItem, tierId: string) => void;
  onTierUpdate: (tierId: string, name: string, color: string) => void;
  draggedItemId: string | null;
  targetTierId: string | null;
  targetIndex: number | null;
  isDragOver?: boolean;
}

const TierRow: React.FC<TierRowProps> = ({
  tierId,
  tierName,
  tierColor,
  items,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onDelete,
  onReturnToLibrary,
  onTierUpdate,
  draggedItemId,
  targetTierId,
  targetIndex,
  isDragOver = false,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tierName);
  const [editColor, setEditColor] = useState(tierColor);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!rowRef.current || !draggedItemId) return;

    const rect = rowRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Calculate drop position based on mouse position
    let calculatedIndex = 0;
    const itemWidth = 88; // 80px + 8px gap
    
    if (items.length === 0) {
      calculatedIndex = 0;
    } else {
      calculatedIndex = Math.floor(x / itemWidth);
      calculatedIndex = Math.max(0, Math.min(calculatedIndex, items.length));
    }

    onDragOver(e, tierId);
    
    // Update target only if position changed
    if (targetTierId !== tierId || targetIndex !== calculatedIndex) {
      const dragOverEvent = new CustomEvent('tierDragOver', {
        detail: { tierId, index: calculatedIndex }
      });
      window.dispatchEvent(dragOverEvent);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, tierId);
  };

  const handleSaveEdit = () => {
    onTierUpdate(tierId, editName, editColor);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(tierName);
    setEditColor(tierColor);
    setIsEditing(false);
  };

  const isShowingPlaceholder = targetTierId === tierId && draggedItemId;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-4">
      <div className="flex">
        {/* Tier Label */}
        <div
          className="flex-shrink-0 w-32 flex flex-col items-center justify-center p-2 text-white relative group"
          style={{ backgroundColor: tierColor }}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2 w-full">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-2 py-1 text-sm text-gray-900 rounded"
                maxLength={30}
              />
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
              <div className="flex gap-1">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className="font-bold text-lg text-center"
              >
                {tierName}
              </div>
              <div className="absolute top-1 right-1 flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 bg-blue-500 hover:bg-blue-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => onDelete(tierId)}
                  className="p-1 bg-red-500 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tier Content Area */}
        <div
          ref={rowRef}
          onDragOver={handleDragOver}
          onDragLeave={onDragLeave}
          onDrop={handleDrop}
          className={`
            flex-1 min-h-[100px] p-3 flex flex-wrap items-start content-start gap-2
            transition-colors duration-200
            ${isDragOver ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-900'}
          `}
        >
          {items.length === 0 && !isShowingPlaceholder ? (
            <div className="text-gray-400 dark:text-gray-600 text-sm w-full flex items-center justify-center h-20">
              Drop images here
            </div>
          ) : (
            items.map((item, index) => (
              <React.Fragment key={item.id}>
                {isShowingPlaceholder && targetIndex === index && (
                  <DropPlaceholder isVisible={true} orientation="vertical" />
                )}
                <div className="relative group w-20 h-20">
                  <DraggableImage
                    item={item}
                    onDragStart={(e) => onDragStart(e, item, tierId, index)}
                    onDragEnd={onDragEnd}
                    isDragging={item.id === draggedItemId}
                  />
                  <button
                    onClick={() => onReturnToLibrary(item, tierId)}
                    className="absolute top-1 right-1 p-1 bg-blue-500 hover:bg-blue-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ReturnIcon />
                  </button>
                </div>
              </React.Fragment>
            ))
          )}
          {isShowingPlaceholder && targetIndex === items.length && (
            <DropPlaceholder isVisible={true} orientation="vertical" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TierRow;
