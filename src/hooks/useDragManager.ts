import { useState, useCallback } from 'react';

export interface ImageItem {
  id: string;
  url: string;
  file: File;
}

export interface TierData {
  id: string;
  name: string;
  color: string;
  items: ImageItem[];
}

interface DragState {
  draggedItem: ImageItem | null;
  sourceType: 'library' | 'tier';
  sourceTierId: string | null;
  sourceIndex: number | null;
  targetTierId: string | null;
  targetIndex: number | null;
}

export const useDragManager = () => {
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    sourceType: 'library',
    sourceTierId: null,
    sourceIndex: null,
    targetTierId: null,
    targetIndex: null,
  });

  const startDrag = useCallback((
    item: ImageItem,
    sourceType: 'library' | 'tier',
    sourceTierId?: string,
    sourceIndex?: number
  ) => {
    setDragState({
      draggedItem: item,
      sourceType,
      sourceTierId: sourceTierId || null,
      sourceIndex: sourceIndex !== undefined ? sourceIndex : null,
      targetTierId: null,
      targetIndex: null,
    });
  }, []);

  const updateTarget = useCallback((tierId: string | null, index: number | null) => {
    setDragState(prev => ({
      ...prev,
      targetTierId: tierId,
      targetIndex: index,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      draggedItem: null,
      sourceType: 'library',
      sourceTierId: null,
      sourceIndex: null,
      targetTierId: null,
      targetIndex: null,
    });
  }, []);

  const clearTarget = useCallback(() => {
    setDragState(prev => ({
      ...prev,
      targetTierId: null,
      targetIndex: null,
    }));
  }, []);

  return {
    dragState,
    startDrag,
    updateTarget,
    endDrag,
    clearTarget,
  };
};
