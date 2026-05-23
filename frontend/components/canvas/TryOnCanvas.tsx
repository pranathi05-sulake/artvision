'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { fabric } from 'fabric';
import { useAppStore, CanvasPlacement } from '@/lib/store';
import { generateId } from '@/lib/utils';
import { ZoomIn, ZoomOut, RotateCcw, Trash2, Eye, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TryOnCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [opacity, setOpacity] = useState(100);
  const [selectedPopup, setSelectedPopup] = useState<{ x: number; y: number } | null>(null);

  const {
    roomImage,
    selectedPlacementId,
    roomAnalysis,
    lightSources,
    placedFurniture,
    placedDecor,
    paintColor,
    designMode,
    setSelectedPlacement,
    updatePlacement,
    removePlacement,
    setIsCanvasReady,
  } = useAppStore();

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: '#1a1a1a',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;
    setIsCanvasReady(true);

    canvas.on('selection:created', (e) => {
      const obj = e.selected?.[0];
      if (obj && obj.data?.placementId) {
        setSelectedPlacement(obj.data.placementId);
        setOpacity(Math.round((obj.opacity || 1) * 100));
        const bound = obj.getBoundingRect();
        setSelectedPopup({ x: bound.left + bound.width / 2, y: bound.top - 10 });
      }
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected?.[0];
      if (obj && obj.data?.placementId) {
        setSelectedPlacement(obj.data.placementId);
        setOpacity(Math.round((obj.opacity || 1) * 100));
        const bound = obj.getBoundingRect();
        setSelectedPopup({ x: bound.left + bound.width / 2, y: bound.top - 10 });
      }
    });

    canvas.on('selection:cleared', () => {
      setSelectedPlacement(null);
      setSelectedPopup(null);
    });

    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (obj && obj.data?.placementId) {
        const bound = obj.getBoundingRect();
        setSelectedPopup({ x: bound.left + bound.width / 2, y: bound.top - 10 });
      }
    });

    canvas.on('object:modified', (e) => {
      const obj = e.target;
      if (obj && obj.data?.placementId) {
        updatePlacement(obj.data.placementId, {
          position: { x: obj.left || 0, y: obj.top || 0 },
          size: {
            width: (obj.width || 100) * (obj.scaleX || 1),
            height: (obj.height || 100) * (obj.scaleY || 1),
          },
          rotation: obj.angle || 0,
        });
        const bound = obj.getBoundingRect();
        setSelectedPopup({ x: bound.left + bound.width / 2, y: bound.top - 10 });
      }
    });

    const handleResize = () => {
      canvas.setWidth(container.clientWidth);
      canvas.setHeight(container.clientHeight);
      canvas.renderAll();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [setIsCanvasReady, setSelectedPlacement, updatePlacement]);

  // Load room image
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !roomImage) return;

    fabric.Image.fromURL(roomImage, (img) => {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const scale = Math.min(
        canvasWidth / (img.width || 1),
        canvasHeight / (img.height || 1)
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - (img.width || 0) * scale) / 2,
        top: (canvasHeight - (img.height || 0) * scale) / 2,
        selectable: false,
        evented: false,
        data: { type: 'room-image' },
      });

      const existingRoom = canvas.getObjects().find((o) => o.data?.type === 'room-image');
      if (existingRoom) canvas.remove(existingRoom);

      canvas.add(img);
      canvas.sendToBack(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, [roomImage]);

  // Render light glow overlays
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    // Remove existing light overlays
    const existingLights = canvas.getObjects().filter((o) => o.data?.type === 'light-glow');
    existingLights.forEach((l) => canvas.remove(l));

    // Add new light glows
    lightSources.forEach((light) => {
      const tempToColor: Record<number, string> = {
        2700: 'rgba(255, 180, 50, 0.25)',
        4000: 'rgba(255, 240, 220, 0.2)',
        5000: 'rgba(200, 220, 255, 0.18)',
      };
      const glowColor = tempToColor[light.colorTemp] || 'rgba(255, 200, 100, 0.2)';

      const glow = new fabric.Circle({
        left: light.position.x - light.glowRadius,
        top: light.position.y - light.glowRadius,
        radius: light.glowRadius,
        fill: new fabric.Gradient({
          type: 'radial',
          coords: {
            x1: light.glowRadius,
            y1: light.glowRadius,
            x2: light.glowRadius,
            y2: light.glowRadius,
            r1: 0,
            r2: light.glowRadius,
          },
          colorStops: [
            { offset: 0, color: glowColor },
            { offset: 1, color: 'rgba(0,0,0,0)' },
          ],
        }),
        opacity: light.intensity / 100,
        selectable: false,
        evented: false,
        data: { type: 'light-glow', lightId: light.id },
      });

      canvas.add(glow);
    });

    canvas.renderAll();
  }, [lightSources]);

  // Handle drag and drop - supports art, furniture, and decor
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const canvas = fabricRef.current;
      if (!canvas) return;

      const rawData = e.dataTransfer.getData('application/json');
      if (!rawData) return;

      const data = JSON.parse(rawData);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (data.type === 'furniture') {
        // Place furniture as a text/emoji object on canvas
        const placementId = generateId();
        const text = new fabric.Text(data.imageUrl, {
          left: x - 30,
          top: y - 30,
          fontSize: 60,
          cornerColor: '#3b82f6',
          cornerStyle: 'circle',
          cornerSize: 10,
          transparentCorners: false,
          borderColor: '#3b82f6',
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.3)',
            blur: 12,
            offsetX: 2,
            offsetY: 5,
          }),
          data: { placementId, type: 'furniture', name: data.name },
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();

        useAppStore.getState().addFurniture({
          id: placementId,
          item: { id: data.id, name: data.name, category: 'seating', imageUrl: data.imageUrl, widthM: data.widthM, heightM: data.heightM },
          position: { x, y },
          scale: 1,
          rotation: 0,
          zIndex: 0,
          opacity: 95,
        });
      } else if (data.type === 'decor') {
        // Place decor as emoji on canvas
        const placementId = generateId();
        const text = new fabric.Text(data.imageUrl, {
          left: x - 20,
          top: y - 20,
          fontSize: 44,
          cornerColor: '#3b82f6',
          cornerStyle: 'circle',
          cornerSize: 8,
          transparentCorners: false,
          borderColor: '#3b82f6',
          shadow: new fabric.Shadow({
            color: 'rgba(0,0,0,0.2)',
            blur: 8,
            offsetX: 1,
            offsetY: 3,
          }),
          data: { placementId, type: 'decor', name: data.name },
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();

        useAppStore.getState().addDecor({
          id: placementId,
          item: { id: data.id, name: data.name, category: data.category, imageUrl: data.imageUrl },
          position: { x, y },
          scale: 1,
          flipped: false,
          opacity: 100,
        });
      } else {
        // Default: artwork image
        fabric.Image.fromURL(data.imageUrl, (img) => {
          const placementId = generateId();
          const targetWidth = 200;
          const scale = targetWidth / (img.width || 1);

          img.set({
            left: x - targetWidth / 2,
            top: y - ((img.height || 100) * scale) / 2,
            scaleX: scale,
            scaleY: scale,
            opacity: 0.93,
            cornerColor: '#3b82f6',
            cornerStyle: 'circle',
            cornerSize: 10,
            transparentCorners: false,
            borderColor: '#3b82f6',
            borderDashArray: [4, 4],
            shadow: new fabric.Shadow({
              color: 'rgba(0,0,0,0.4)',
              blur: 18,
              offsetX: 3,
              offsetY: 8,
            }),
            data: { placementId, artworkId: data.id, type: 'artwork' },
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();

          const newPlacement: CanvasPlacement = {
            id: placementId,
            artworkId: data.id,
            artworkUrl: data.imageUrl,
            artworkTitle: data.title || data.name,
            frame: useAppStore.getState().currentFrame,
            position: { x: img.left || 0, y: img.top || 0 },
            size: {
              width: (img.width || 100) * scale,
              height: (img.height || 100) * scale,
            },
            rotation: 0,
            realWorldSize: { widthCm: 60, heightCm: 90 },
          };

          useAppStore.getState().addPlacement(newPlacement);
          setSelectedPlacement(placementId);
          setOpacity(93);
          const bound = img.getBoundingRect();
          setSelectedPopup({ x: bound.left + bound.width / 2, y: bound.top - 10 });
        }, { crossOrigin: 'anonymous' });
      }
    },
    [setSelectedPlacement]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Opacity handler
  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    const canvas = fabricRef.current;
    if (!canvas || !selectedPlacementId) return;
    const obj = canvas.getObjects().find((o) => o.data?.placementId === selectedPlacementId);
    if (obj) {
      obj.set('opacity', newOpacity / 100);
      canvas.renderAll();
    }
  };

  // Delete selected (works for art, furniture, decor)
  const handleDeleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas || !selectedPlacementId) return;
    const obj = canvas.getObjects().find((o) => o.data?.placementId === selectedPlacementId);
    if (obj) {
      canvas.remove(obj);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
    // Remove from appropriate store
    removePlacement(selectedPlacementId);
    useAppStore.getState().removeFurniture(selectedPlacementId);
    useAppStore.getState().removeDecor(selectedPlacementId);
    setSelectedPlacement(null);
    setSelectedPopup(null);
  };

  // Zoom controls
  const handleZoomIn = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const newZoom = Math.min(zoom * 1.2, 3);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.renderAll();
  };

  const handleZoomOut = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const newZoom = Math.max(zoom / 1.2, 0.5);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.renderAll();
  };

  const handleResetView = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(1);
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    setZoom(1);
    canvas.renderAll();
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <canvas ref={canvasRef} />

      {/* Floating toolbar on selected artwork */}
      {selectedPlacementId && selectedPopup && (
        <div
          className="absolute z-30 flex items-center gap-1.5 bg-card/95 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-xl -translate-x-1/2 -translate-y-full pointer-events-auto"
          style={{ left: selectedPopup.x, top: selectedPopup.y - 8 }}
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="range"
            min="10"
            max="100"
            value={opacity}
            onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
            className="w-20 h-1 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
            title={`Opacity: ${opacity}%`}
          />
          <span className="text-[10px] text-muted-foreground w-7 text-right">{opacity}%</span>
          <div className="w-px h-5 bg-border mx-1" />
          <button
            onClick={handleDeleteSelected}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
            aria-label="Delete artwork"
            title="Remove from wall"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Paint color indicator */}
      {designMode === 'paint' && (
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-sm flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full border border-border"
            style={{ backgroundColor: paintColor }}
          />
          <span className="text-xs text-muted-foreground">Click wall to paint</span>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-sm">
        <Button variant="ghost" size="icon" onClick={handleZoomIn} aria-label="Zoom in">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground px-2 min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon" onClick={handleZoomOut} aria-label="Zoom out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleResetView} aria-label="Reset view">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Room Info Badge */}
      {roomAnalysis && (
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-sm">
          <p className="text-xs font-medium capitalize">
            {roomAnalysis.room_type} • {roomAnalysis.room_style} Style
          </p>
          <div className="flex gap-1 mt-1">
            {roomAnalysis.dominant_colors.map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!roomImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">Upload a room photo to get started</p>
            <p className="text-sm mt-1">Use the Upload panel on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}
