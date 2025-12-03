import React, { useState, useCallback, useEffect } from 'react';
import TierRow from './TierRow';
import { TierData, ImageItem } from '../hooks/useDragManager';

interface TierListProps {
  tiers: TierData[];
  onTiersUpdate: (tiers: TierData[]) => void;
  onDeleteTier: (tierId: string) => void;
  onReturnToLibrary: (item: ImageItem, tierId: string) => void;
  draggedItemId: string | null;
  onDragStart: (item: ImageItem, sourceType: 'tier', tierId: string, index: number) => void;
  onDragEnd: () => void;
  onUpdateTarget: (tierId: string | null, index: number | null) => void;
  targetTierId: string | null;
  targetIndex: number | null;
  draggedItem: ImageItem | null;
  sourceType: 'library' | 'tier';
  sourceTierId: string | null;
  sourceIndex: number | null;
}

const TierList: React.FC<TierListProps> = ({
  tiers,
  onTiersUpdate,
  onDeleteTier,
  onReturnToLibrary,
  draggedItemId,
  onDragStart,
  onDragEnd,
  onUpdateTarget,
  targetTierId,
  targetIndex,
  draggedItem,
  sourceType,
  sourceTierId,
  sourceIndex,
}) => {
  const [dragOverTierId, setDragOverTierId] = useState<string | null>(null);

  useEffect(() => {
    const handleTierDragOver = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { tierId, index } = customEvent.detail;
      onUpdateTarget(tierId, index);
    };

    window.addEventListener('tierDragOver', handleTierDragOver);
    return () => window.removeEventListener('tierDragOver', handleTierDragOver);
  }, [onUpdateTarget]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, item: ImageItem, tierId: string, index: number) => {
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(item, 'tier', tierId, index);
    },
    [onDragStart]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, tierId: string) => {
      e.preventDefault();
      setDragOverTierId(tierId);
    },
    []
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTierId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetTierId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverTierId(null);

      if (!draggedItem || targetIndex === null) return;

      const newTiers = [...tiers];
      const targetTierIndex = newTiers.findIndex(t => t.id === targetTierId);
      if (targetTierIndex === -1) return;

      // Remove from source
      if (sourceType === 'tier' && sourceTierId) {
        const sourceTierIndex = newTiers.findIndex(t => t.id === sourceTierId);
        if (sourceTierIndex !== -1 && sourceIndex !== null) {
          newTiers[sourceTierIndex].items = newTiers[sourceTierIndex].items.filter(
            (_, idx) => idx !== sourceIndex
          );
        }
      }

      // Insert at target position
      const targetTier = newTiers[targetTierIndex];
      const insertIndex = Math.min(targetIndex, targetTier.items.length);
      
      targetTier.items = [
        ...targetTier.items.slice(0, insertIndex),
        draggedItem,
        ...targetTier.items.slice(insertIndex),
      ];

      onTiersUpdate(newTiers);
      onDragEnd();
    },
    [draggedItem, targetIndex, tiers, sourceType, sourceTierId, sourceIndex, onTiersUpdate, onDragEnd]
  );

  const handleTierUpdate = useCallback(
    (tierId: string, name: string, color: string) => {
      const newTiers = tiers.map(tier =>
        tier.id === tierId ? { ...tier, name, color } : tier
      );
      onTiersUpdate(newTiers);
    },
    [tiers, onTiersUpdate]
  );

  return (
    <div className="w-full">
      {tiers.map((tier) => (
        <TierRow
          key={tier.id}
          tierId={tier.id}
          tierName={tier.name}
          tierColor={tier.color}
          items={tier.items}
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDelete={onDeleteTier}
          onReturnToLibrary={onReturnToLibrary}
          onTierUpdate={handleTierUpdate}
          draggedItemId={draggedItemId}
          targetTierId={targetTierId}
          targetIndex={targetIndex}
          isDragOver={dragOverTierId === tier.id}
        />
      ))}
    </div>
  );
};

export default TierList;
