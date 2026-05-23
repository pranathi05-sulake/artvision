import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const ML_BASE_URL = process.env.NEXT_PUBLIC_ML_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<unknown> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }
}

export const api = new ApiClient(API_BASE_URL);
export const mlApi = new ApiClient(ML_BASE_URL);

// Project API
export const projectsApi = {
  list: () => api.get<Project[]>('/api/projects'),
  get: (id: string) => api.get<Project>(`/api/projects/${id}`),
  create: (data: CreateProjectData) => api.post<Project>('/api/projects', data),
  update: (id: string, data: Partial<Project>) => api.put<Project>(`/api/projects/${id}`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
};

// Artwork API
export const artworksApi = {
  list: (params?: ArtworkFilters) => api.get<Artwork[]>('/api/artworks', params as Record<string, unknown>),
  get: (id: string) => api.get<Artwork>(`/api/artworks/${id}`),
  search: (query: string) => api.get<Artwork[]>('/api/artworks/search', { q: query }),
  getRecommendations: (projectId: string) =>
    api.get<ArtworkRecommendation[]>(`/api/recommendations/${projectId}`),
};

// ML API
export const mlServiceApi = {
  analyzeRoom: (imageBase64: string) =>
    mlApi.post<RoomAnalysis>('/analyze-room', { room_image: imageBase64 }),
  segmentWall: (imageBase64: string, point: { x: number; y: number }) =>
    mlApi.post<WallSegmentation>('/segment-wall', { room_image: imageBase64, point_prompt: point }),
  styleMatch: (imageBase64: string, topK?: number) =>
    mlApi.post<StyleMatchResult[]>('/style-match', { room_image: imageBase64, top_k: topK || 20 }),
  generateArt: (params: ArtGenerationParams) =>
    mlApi.post<ArtGenerationResult>('/generate-art', params),
  photoToArt: (photoBase64: string, style: string, strength?: number) =>
    mlApi.post<{ image: string }>('/photo-to-art', { photo: photoBase64, style, strength: strength || 0.7 }),
  simulateLighting: (params: LightingParams) =>
    mlApi.post<{ composite_image: string }>('/simulate-lighting', params),
  renderPlacement: (params: RenderPlacementParams) =>
    mlApi.post<{ composite_image: string }>('/render-placement', params),
};

// Upload API
export const uploadApi = {
  uploadRoomPhoto: (file: File, onProgress?: (progress: number) => void) =>
    api.uploadFile('/api/upload/room', file, onProgress),
  uploadArtwork: (file: File, onProgress?: (progress: number) => void) =>
    api.uploadFile('/api/upload/artwork', file, onProgress),
};

// Types
export interface Project {
  id: string;
  name: string;
  roomImageUrl: string;
  roomType: string;
  roomStyle: string;
  wallMaskUrl: string;
  depthMapUrl: string;
  placements: Placement[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  roomImageUrl: string;
}

export interface Placement {
  id: string;
  artworkId: string;
  artwork: Artwork;
  frameStyle: string;
  frameColor: string;
  matColor: string | null;
  matWidth: number | null;
  glassFinish: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  lightingMode: string;
}

export interface Artwork {
  id: string;
  title: string;
  artistName: string | null;
  imageUrl: string;
  thumbnailUrl: string;
  style: string[];
  colors: string[];
  sourceType: string;
  sourceUrl: string | null;
  price: number | null;
  currency: string | null;
}

export interface ArtworkFilters {
  style?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  source?: string;
}

export interface ArtworkRecommendation {
  artwork: Artwork;
  score: number;
  colorMatch: number;
  styleMatch: number;
}

export interface RoomAnalysis {
  wall_masks: string[];
  depth_map: string;
  room_type: string;
  room_style: string;
  dominant_colors: string[];
  lighting: {
    direction: string;
    intensity: number;
    color_temp: number;
  };
  wall_dimensions: {
    width_cm: number;
    height_cm: number;
  };
}

export interface WallSegmentation {
  mask: string;
  wall_bounds: { x: number; y: number; w: number; h: number };
}

export interface StyleMatchResult {
  artwork_id: string;
  score: number;
  color_match: number;
  style_match: number;
}

export interface ArtGenerationParams {
  prompt: string;
  style: string;
  colors: string[];
  width: number;
  height: number;
  num_variations: number;
}

export interface ArtGenerationResult {
  images: string[];
}

export interface LightingParams {
  room_image: string;
  artwork_placement: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  lighting_params: {
    time_of_day: number;
    light_source: string;
    color_temperature: number;
    intensity: number;
  };
}

export interface RenderPlacementParams {
  room_image: string;
  artwork_image: string;
  frame_config: {
    style: string;
    color: string;
    thickness: string;
    mat_color: string | null;
    mat_width: number | null;
    glass_finish: string;
  };
  placement: {
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
  };
  depth_map: string;
}
