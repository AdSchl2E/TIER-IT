import React, { useState, useCallback, useRef, useEffect } from 'react';
import Library from './components/Library';
import TierList from './components/TierList';
import { useDragManager, ImageItem, TierData } from './hooks/useDragManager';
import { useTheme } from './context/ThemeContext';
import { compressImage } from './utils/imageCompression';
import { SunIcon, MoonIcon, PlusIcon, DownloadIcon, AppIcon, SaveIcon, LoadIcon, ShareIcon } from './components/Icons';

const initialTiers: TierData[] = [
  { id: 's', name: 'S', color: '#ff7f7f', items: [] },
  { id: 'a', name: 'A', color: '#ffbf7f', items: [] },
  { id: 'b', name: 'B', color: '#ffdf7f', items: [] },
  { id: 'c', name: 'C', color: '#bfff7f', items: [] },
  { id: 'd', name: 'D', color: '#7fffbf', items: [] },
  { id: 'e', name: 'E', color: '#7fbfff', items: [] },
];

function App() {
  const [libraryImages, setLibraryImages] = useState<ImageItem[]>(() => {
    const saved = localStorage.getItem('tierit-library');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse library from localStorage:', e);
      }
    }
    return [];
  });
  
  const [tiers, setTiers] = useState<TierData[]>(() => {
    const saved = localStorage.getItem('tierit-tiers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tiers from localStorage:', e);
      }
    }
    return initialTiers;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { dragState, startDrag, updateTarget, endDrag } = useDragManager();
  const tierListRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever libraryImages or tiers change
  useEffect(() => {
    // Save only id and url (base64) to localStorage
    const imagesToSave = libraryImages.map(({ id, url }) => ({ id, url }));
    localStorage.setItem('tierit-library', JSON.stringify(imagesToSave));
  }, [libraryImages]);

  useEffect(() => {
    // Save only necessary tier data (id, url for items)
    const tiersToSave = tiers.map(tier => ({
      ...tier,
      items: tier.items.map(({ id, url }) => ({ id, url }))
    }));
    localStorage.setItem('tierit-tiers', JSON.stringify(tiersToSave));
  }, [tiers]);

  const handleImagesAdd = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const newImages: ImageItem[] = [];
    const totalFiles = fileArray.length;

    setIsLoading(true);
    setLoadingProgress(0);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      try {
        const compressedFile = await compressImage(file, 200, 0.7);
        
        // Convert to base64 for localStorage persistence
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedFile);
        });
        
        newImages.push({
          id: `${Date.now()}-${Math.random()}`,
          url: base64,
          file: compressedFile,
        });
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        newImages.push({
          id: `${Date.now()}-${Math.random()}`,
          url: base64,
          file,
        });
      }
      
      // Update progress
      setLoadingProgress(Math.round(((i + 1) / totalFiles) * 100));
    }

    setLibraryImages((prev) => [...prev, ...newImages]);
    setIsLoading(false);
    setLoadingProgress(0);
  }, []);

  const handleLibraryDragStart = useCallback(
    (e: React.DragEvent, item: ImageItem) => {
      e.dataTransfer.effectAllowed = 'move';
      startDrag(item, 'library');
    },
    [startDrag]
  );

  const handleTierDragStart = useCallback(
    (item: ImageItem, sourceType: 'tier', tierId: string, index: number) => {
      startDrag(item, sourceType, tierId, index);
    },
    [startDrag]
  );

  const handleDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleTiersUpdate = useCallback(
    (updatedTiers: TierData[]) => {
      setTiers(updatedTiers);

      // Remove from library if source was library
      if (dragState.sourceType === 'library' && dragState.draggedItem) {
        setLibraryImages((prev) =>
          prev.filter((img) => img.id !== dragState.draggedItem!.id)
        );
      }
    },
    [dragState.sourceType, dragState.draggedItem]
  );

  const handleAddTier = useCallback(() => {
    const newTier: TierData = {
      id: `tier-${Date.now()}`,
      name: 'New',
      color: '#999999',
      items: [],
    };
    setTiers((prev) => [...prev, newTier]);
  }, []);

  const handleDeleteTier = useCallback((tierId: string) => {
    setTiers((prev) => {
      const tier = prev.find(t => t.id === tierId);
      if (tier && tier.items.length > 0) {
        // Return items to library
        setLibraryImages((lib) => [...lib, ...tier.items]);
      }
      return prev.filter(t => t.id !== tierId);
    });
  }, []);

  const handleReturnToLibrary = useCallback((item: ImageItem, tierId: string) => {
    setTiers((prev) => 
      prev.map(tier => 
        tier.id === tierId 
          ? { ...tier, items: tier.items.filter(img => img.id !== item.id) }
          : tier
      )
    );
    setLibraryImages((prev) => [...prev, item]);
  }, []);

  const handleImageDelete = useCallback((imageId: string) => {
    setLibraryImages((prev) => prev.filter(img => img.id !== imageId));
  }, []);

  const handleExportImage = useCallback(async () => {
    if (!tierListRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(tierListRef.current, {
        backgroundColor: theme === 'dark' ? '#030712' : '#f3f4f6',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `tierlist-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Error exporting image');
    }
  }, [theme]);

  const handleSaveTierList = useCallback(() => {
    const data = {
      tiers,
      libraryImages,
      savedAt: new Date().toISOString(),
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `tierlist-save-${Date.now()}.json`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [tiers, libraryImages]);

  const handleLoadTierList = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.tiers && Array.isArray(data.tiers)) {
          setTiers(data.tiers);
        }
        if (data.libraryImages && Array.isArray(data.libraryImages)) {
          setLibraryImages(data.libraryImages);
        }
      } catch (error) {
        console.error('Error loading tier list:', error);
        alert('Error loading tier list file');
      }
    };
    
    input.click();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200 pb-40 lg:pb-8">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-2xl w-80 max-w-[90vw]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Loading Images...
            </h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300 ease-out rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
              {loadingProgress}% complete
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <AppIcon />
            TierIt
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleSaveTierList}
              className="px-3 lg:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <SaveIcon />
              <span className="hidden lg:inline">Save</span>
            </button>
            <button
              onClick={handleLoadTierList}
              className="px-3 lg:px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <LoadIcon />
              <span className="hidden lg:inline">Load</span>
            </button>
            <button
              onClick={handleExportImage}
              className="px-3 lg:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <ShareIcon />
              <span className="hidden lg:inline">Share</span>
            </button>
            <button
              onClick={toggleTheme}
              className="px-3 lg:px-4 py-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              <span className="hidden lg:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>

        {/* Main Layout: Library Left + TierList Right (Desktop) / Library Bottom (Mobile) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* TierList - Top on Mobile, Right on Desktop */}
          <div className="flex-1 order-2 lg:order-2">
            <div ref={tierListRef}>
              <TierList
                tiers={tiers}
                onTiersUpdate={handleTiersUpdate}
                onDeleteTier={handleDeleteTier}
                onReturnToLibrary={handleReturnToLibrary}
                draggedItemId={dragState.draggedItem?.id || null}
                onDragStart={handleTierDragStart}
                onDragEnd={handleDragEnd}
                onUpdateTarget={updateTarget}
                targetTierId={dragState.targetTierId}
                targetIndex={dragState.targetIndex}
                draggedItem={dragState.draggedItem}
                sourceType={dragState.sourceType}
                sourceTierId={dragState.sourceTierId}
                sourceIndex={dragState.sourceIndex}
              />
            </div>
            
            {/* Add Tier Button */}
            <button
              onClick={handleAddTier}
              className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
            >
              <PlusIcon />
              Add Tier
            </button>
          </div>

          {/* Library - Bottom on Mobile (fixed), Left on Desktop */}
          <div className="w-full lg:w-[330px] flex-shrink-0 order-1 lg:order-1">
            <Library
              images={libraryImages}
              onImagesAdd={handleImagesAdd}
              onImageDelete={handleImageDelete}
              onDragStart={handleLibraryDragStart}
              onDragEnd={handleDragEnd}
              draggedItemId={dragState.draggedItem?.id || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
