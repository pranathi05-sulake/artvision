import { create } from 'zustand';
import { RoomAnalysis, Artwork } from './api';

export interface FrameConfig {
  style: string;
  color: string;
  thickness: 'thin' | 'medium' | 'thick';
  matColor: string | null;
  matWidth: number | null;
  glassFinish: 'none' | 'glossy' | 'matte' | 'anti-reflective' | 'museum';
}

export interface LightingConfig {
  timeOfDay: number;
  lightSource: string;
  colorTemperature: number;
  intensity: number;
}

export interface CanvasPlacement {
  id: string;
  artworkId: string;
  artworkUrl: string;
  artworkTitle: string;
  frame: FrameConfig;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  realWorldSize: { widthCm: number; heightCm: number };
}

export type DesignMode = 'art' | 'furniture' | 'paint' | 'lighting' | 'decor' | 'theme' | 'webcam';

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'seating' | 'tables' | 'storage' | 'rugs' | 'beds';
  imageUrl: string;
  widthM: number;
  heightM: number;
}

export interface PlacedFurniture {
  id: string;
  item: FurnitureItem;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  zIndex: number;
  opacity: number;
}

export interface LightSource {
  id: string;
  name: string;
  type: 'floor_lamp' | 'pendant' | 'sconce' | 'ceiling';
  position: { x: number; y: number };
  colorTemp: number;
  intensity: number;
  glowRadius: number;
}

export interface DecorItem {
  id: string;
  name: string;
  category: 'plants' | 'vases' | 'mirrors' | 'cushions' | 'candles';
  imageUrl: string;
}

export interface PlacedDecor {
  id: string;
  item: DecorItem;
  position: { x: number; y: number };
  scale: number;
  flipped: boolean;
  opacity: number;
}

export type StyleTheme = 'scandinavian' | 'japandi' | 'boho' | 'maximalist' | 'industrial' | 'coastal' | 'mid-century';

interface AppState {
  // Room state
  roomImage: string | null;
  roomImageFile: File | null;
  roomAnalysis: RoomAnalysis | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  roomWidthM: number;

  // Design mode
  designMode: DesignMode;

  // Canvas state
  placements: CanvasPlacement[];
  selectedPlacementId: string | null;
  activeWallMask: string | null;

  // Frame state
  currentFrame: FrameConfig;

  // Lighting state
  lighting: LightingConfig;
  lightSources: LightSource[];

  // Furniture
  placedFurniture: PlacedFurniture[];
  selectedFurnitureId: string | null;

  // Paint
  paintColor: string;
  paintTolerance: number;
  wallpaperPattern: string | null;
  showBeforeAfter: boolean;

  // Decor
  placedDecor: PlacedDecor[];
  selectedDecorId: string | null;

  // Theme
  activeTheme: StyleTheme | null;
  detectedStyle: string | null;

  // Art library state
  artworks: Artwork[];
  recommendations: Artwork[];
  isLoadingArt: boolean;

  // UI state
  activePanel: string;
  isCanvasReady: boolean;
  uploadProgress: number;

  // Webcam
  webcamActive: boolean;

  // Actions
  setRoomImage: (image: string | null, file?: File | null) => void;
  setRoomAnalysis: (analysis: RoomAnalysis | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnalysisError: (error: string | null) => void;
  setRoomWidthM: (width: number) => void;
  setDesignMode: (mode: DesignMode) => void;
  addPlacement: (placement: CanvasPlacement) => void;
  updatePlacement: (id: string, updates: Partial<CanvasPlacement>) => void;
  removePlacement: (id: string) => void;
  setSelectedPlacement: (id: string | null) => void;
  setActiveWallMask: (mask: string | null) => void;
  setCurrentFrame: (frame: Partial<FrameConfig>) => void;
  setLighting: (lighting: Partial<LightingConfig>) => void;
  addLightSource: (light: LightSource) => void;
  updateLightSource: (id: string, updates: Partial<LightSource>) => void;
  removeLightSource: (id: string) => void;
  addFurniture: (item: PlacedFurniture) => void;
  updateFurniture: (id: string, updates: Partial<PlacedFurniture>) => void;
  removeFurniture: (id: string) => void;
  setSelectedFurniture: (id: string | null) => void;
  setPaintColor: (color: string) => void;
  setPaintTolerance: (tolerance: number) => void;
  setWallpaperPattern: (pattern: string | null) => void;
  setShowBeforeAfter: (show: boolean) => void;
  addDecor: (item: PlacedDecor) => void;
  updateDecor: (id: string, updates: Partial<PlacedDecor>) => void;
  removeDecor: (id: string) => void;
  setSelectedDecor: (id: string | null) => void;
  setActiveTheme: (theme: StyleTheme | null) => void;
  setDetectedStyle: (style: string | null) => void;
  setArtworks: (artworks: Artwork[]) => void;
  setRecommendations: (recommendations: Artwork[]) => void;
  setActivePanel: (panel: string) => void;
  setIsCanvasReady: (ready: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setWebcamActive: (active: boolean) => void;
  resetProject: () => void;
}

const defaultFrame: FrameConfig = {
  style: 'minimalist_black',
  color: '#000000',
  thickness: 'medium',
  matColor: '#FFFFFF',
  matWidth: 2,
  glassFinish: 'none',
};

const defaultLighting: LightingConfig = {
  timeOfDay: 12,
  lightSource: 'natural_window',
  colorTemperature: 5000,
  intensity: 75,
};

export const useAppStore = create<AppState>((set) => ({
  roomImage: null,
  roomImageFile: null,
  roomAnalysis: null,
  isAnalyzing: false,
  analysisError: null,
  roomWidthM: 4,
  designMode: 'art',
  placements: [],
  selectedPlacementId: null,
  activeWallMask: null,
  currentFrame: defaultFrame,
  lighting: defaultLighting,
  lightSources: [],
  placedFurniture: [],
  selectedFurnitureId: null,
  paintColor: '#F5F0E8',
  paintTolerance: 30,
  wallpaperPattern: null,
  showBeforeAfter: false,
  placedDecor: [],
  selectedDecorId: null,
  activeTheme: null,
  detectedStyle: null,
  artworks: [],
  recommendations: [],
  isLoadingArt: false,
  activePanel: 'upload',
  isCanvasReady: false,
  uploadProgress: 0,
  webcamActive: false,

  setRoomImage: (image, file = null) =>
    set({ roomImage: image, roomImageFile: file, activePanel: image ? 'art' : 'upload' }),
  setRoomAnalysis: (analysis) => set({ roomAnalysis: analysis }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisError: (error) => set({ analysisError: error }),
  setRoomWidthM: (width) => set({ roomWidthM: width }),
  setDesignMode: (mode) => set({ designMode: mode }),
  addPlacement: (placement) =>
    set((state) => ({ placements: [...state.placements, placement] })),
  updatePlacement: (id, updates) =>
    set((state) => ({
      placements: state.placements.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removePlacement: (id) =>
    set((state) => ({
      placements: state.placements.filter((p) => p.id !== id),
      selectedPlacementId: state.selectedPlacementId === id ? null : state.selectedPlacementId,
    })),
  setSelectedPlacement: (id) => set({ selectedPlacementId: id }),
  setActiveWallMask: (mask) => set({ activeWallMask: mask }),
  setCurrentFrame: (frame) =>
    set((state) => ({ currentFrame: { ...state.currentFrame, ...frame } })),
  setLighting: (lighting) =>
    set((state) => ({ lighting: { ...state.lighting, ...lighting } })),
  addLightSource: (light) =>
    set((state) => ({ lightSources: [...state.lightSources, light] })),
  updateLightSource: (id, updates) =>
    set((state) => ({
      lightSources: state.lightSources.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
  removeLightSource: (id) =>
    set((state) => ({ lightSources: state.lightSources.filter((l) => l.id !== id) })),
  addFurniture: (item) =>
    set((state) => ({ placedFurniture: [...state.placedFurniture, item] })),
  updateFurniture: (id, updates) =>
    set((state) => ({
      placedFurniture: state.placedFurniture.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
  removeFurniture: (id) =>
    set((state) => ({
      placedFurniture: state.placedFurniture.filter((f) => f.id !== id),
      selectedFurnitureId: state.selectedFurnitureId === id ? null : state.selectedFurnitureId,
    })),
  setSelectedFurniture: (id) => set({ selectedFurnitureId: id }),
  setPaintColor: (color) => set({ paintColor: color }),
  setPaintTolerance: (tolerance) => set({ paintTolerance: tolerance }),
  setWallpaperPattern: (pattern) => set({ wallpaperPattern: pattern }),
  setShowBeforeAfter: (show) => set({ showBeforeAfter: show }),
  addDecor: (item) =>
    set((state) => ({ placedDecor: [...state.placedDecor, item] })),
  updateDecor: (id, updates) =>
    set((state) => ({
      placedDecor: state.placedDecor.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  removeDecor: (id) =>
    set((state) => ({
      placedDecor: state.placedDecor.filter((d) => d.id !== id),
      selectedDecorId: state.selectedDecorId === id ? null : state.selectedDecorId,
    })),
  setSelectedDecor: (id) => set({ selectedDecorId: id }),
  setActiveTheme: (theme) => set({ activeTheme: theme }),
  setDetectedStyle: (style) => set({ detectedStyle: style }),
  setArtworks: (artworks) => set({ artworks }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setIsCanvasReady: (ready) => set({ isCanvasReady: ready }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setWebcamActive: (active) => set({ webcamActive: active }),
  resetProject: () =>
    set({
      roomImage: null,
      roomImageFile: null,
      roomAnalysis: null,
      isAnalyzing: false,
      analysisError: null,
      placements: [],
      selectedPlacementId: null,
      activeWallMask: null,
      currentFrame: defaultFrame,
      lighting: defaultLighting,
      lightSources: [],
      placedFurniture: [],
      selectedFurnitureId: null,
      paintColor: '#F5F0E8',
      paintTolerance: 30,
      wallpaperPattern: null,
      showBeforeAfter: false,
      placedDecor: [],
      selectedDecorId: null,
      activeTheme: null,
      activePanel: 'upload',
      isCanvasReady: false,
      uploadProgress: 0,
      webcamActive: false,
    }),
}));
