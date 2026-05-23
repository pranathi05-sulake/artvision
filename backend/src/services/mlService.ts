import axios, { AxiosInstance } from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

class MLService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ML_SERVICE_URL,
      timeout: 120000, // 2 minutes for ML operations
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async analyzeRoom(imageBase64: string): Promise<RoomAnalysisResult> {
    const response = await this.client.post('/analyze-room', {
      room_image: imageBase64,
    });
    return response.data;
  }

  async segmentWall(imageBase64: string, point: { x: number; y: number }): Promise<WallSegmentResult> {
    const response = await this.client.post('/segment-wall', {
      room_image: imageBase64,
      point_prompt: point,
    });
    return response.data;
  }

  async getStyleMatch(roomImageUrl: string, topK: number = 20): Promise<StyleMatchResult[]> {
    const response = await this.client.post('/style-match', {
      room_image: roomImageUrl,
      top_k: topK,
    });
    return response.data;
  }

  async generateArt(params: ArtGenerationParams): Promise<ArtGenerationResult> {
    const response = await this.client.post('/generate-art', params);
    return response.data;
  }

  async photoToArt(photoBase64: string, style: string, strength: number = 0.7): Promise<{ image: string }> {
    const response = await this.client.post('/photo-to-art', {
      photo: photoBase64,
      style,
      strength,
    });
    return response.data;
  }

  async simulateLighting(params: LightingSimParams): Promise<{ composite_image: string }> {
    const response = await this.client.post('/simulate-lighting', params);
    return response.data;
  }

  async renderPlacement(params: RenderPlacementParams): Promise<{ composite_image: string }> {
    const response = await this.client.post('/render-placement', params);
    return response.data;
  }

  async generateHangingGuide(projectId: string, placements: unknown[]): Promise<{ pdf_url: string }> {
    const response = await this.client.post('/generate-hanging-guide', {
      project_id: projectId,
      placements,
    });
    return response.data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Types
interface RoomAnalysisResult {
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

interface WallSegmentResult {
  mask: string;
  wall_bounds: { x: number; y: number; w: number; h: number };
}

interface StyleMatchResult {
  artwork_id: string;
  score: number;
  color_match: number;
  style_match: number;
}

interface ArtGenerationParams {
  prompt: string;
  style: string;
  colors: string[];
  width: number;
  height: number;
  num_variations: number;
}

interface ArtGenerationResult {
  images: string[];
}

interface LightingSimParams {
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

interface RenderPlacementParams {
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

export const mlService = new MLService();
