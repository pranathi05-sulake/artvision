import { Router, Request, Response } from 'express';

export const framesRouter = Router();

const FRAME_CATALOG = [
  {
    id: 'minimalist_black',
    name: 'Minimalist Black',
    category: 'modern',
    color: '#1a1a1a',
    material: 'aluminum',
    thicknessOptions: ['thin', 'medium', 'thick'],
    priceRange: { min: 25, max: 120 },
    description: 'Clean lines and matte black finish for contemporary spaces',
  },
  {
    id: 'ornate_gold',
    name: 'Ornate Gold',
    category: 'traditional',
    color: '#d4a843',
    material: 'wood_gilded',
    thicknessOptions: ['medium', 'thick'],
    priceRange: { min: 80, max: 350 },
    description: 'Hand-gilded ornate frame with baroque-inspired detailing',
  },
  {
    id: 'natural_wood',
    name: 'Natural Wood',
    category: 'rustic',
    color: '#8B6914',
    material: 'oak',
    thicknessOptions: ['thin', 'medium', 'thick'],
    priceRange: { min: 35, max: 150 },
    description: 'Solid oak with natural grain visible, warm honey finish',
  },
  {
    id: 'white_wood',
    name: 'White Wood',
    category: 'scandinavian',
    color: '#f5f5f5',
    material: 'pine_painted',
    thicknessOptions: ['thin', 'medium'],
    priceRange: { min: 20, max: 90 },
    description: 'Painted pine in crisp white, perfect for light airy spaces',
  },
  {
    id: 'metallic_silver',
    name: 'Metallic Silver',
    category: 'modern',
    color: '#c0c0c0',
    material: 'aluminum',
    thicknessOptions: ['thin', 'medium'],
    priceRange: { min: 30, max: 130 },
    description: 'Brushed aluminum with subtle sheen, industrial elegance',
  },
  {
    id: 'rustic_barn',
    name: 'Rustic Barn Wood',
    category: 'rustic',
    color: '#6b4423',
    material: 'reclaimed_wood',
    thicknessOptions: ['medium', 'thick'],
    priceRange: { min: 45, max: 180 },
    description: 'Reclaimed barn wood with natural weathering and character',
  },
  {
    id: 'acrylic_float',
    name: 'Acrylic Float',
    category: 'modern',
    color: '#e8e8e8',
    material: 'acrylic',
    thicknessOptions: ['thin'],
    priceRange: { min: 40, max: 200 },
    description: 'Clear acrylic float mount, art appears to hover on wall',
  },
  {
    id: 'museum_metal',
    name: 'Museum Metal',
    category: 'professional',
    color: '#4a4a4a',
    material: 'steel',
    thicknessOptions: ['thin', 'medium'],
    priceRange: { min: 50, max: 220 },
    description: 'Gallery-grade steel frame used in professional exhibitions',
  },
  {
    id: 'vintage_gilt',
    name: 'Vintage Gilt',
    category: 'traditional',
    color: '#b8860b',
    material: 'wood_gilded',
    thicknessOptions: ['medium', 'thick'],
    priceRange: { min: 100, max: 400 },
    description: 'Antique-style gilt frame with aged patina and ornate corners',
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    category: 'natural',
    color: '#c4a35a',
    material: 'bamboo',
    thicknessOptions: ['thin', 'medium'],
    priceRange: { min: 25, max: 100 },
    description: 'Sustainable bamboo frame with natural texture and warmth',
  },
  {
    id: 'rope_coastal',
    name: 'Rope Coastal',
    category: 'coastal',
    color: '#d2b48c',
    material: 'wood_rope',
    thicknessOptions: ['medium'],
    priceRange: { min: 35, max: 120 },
    description: 'Driftwood-style frame wrapped with natural jute rope',
  },
  {
    id: 'industrial_pipe',
    name: 'Industrial Pipe',
    category: 'industrial',
    color: '#3d3d3d',
    material: 'iron_pipe',
    thicknessOptions: ['thick'],
    priceRange: { min: 60, max: 250 },
    description: 'Iron pipe frame with exposed fittings, raw industrial aesthetic',
  },
];

// List all frames
framesRouter.get('/', (_req: Request, res: Response) => {
  res.json(FRAME_CATALOG);
});

// Get frame by ID
framesRouter.get('/:id', (req: Request, res: Response) => {
  const frame = FRAME_CATALOG.find((f) => f.id === req.params.id);
  if (!frame) {
    res.status(404).json({ message: 'Frame not found' });
    return;
  }
  res.json(frame);
});

// Get frames by category
framesRouter.get('/category/:category', (req: Request, res: Response) => {
  const frames = FRAME_CATALOG.filter((f) => f.category === req.params.category);
  res.json(frames);
});

// Get frame recommendations for a room style
framesRouter.get('/recommend/:roomStyle', (req: Request, res: Response) => {
  const styleMap: Record<string, string[]> = {
    scandinavian: ['white_wood', 'natural_wood', 'minimalist_black'],
    modern: ['minimalist_black', 'metallic_silver', 'acrylic_float'],
    traditional: ['ornate_gold', 'vintage_gilt', 'natural_wood'],
    industrial: ['industrial_pipe', 'museum_metal', 'metallic_silver'],
    coastal: ['rope_coastal', 'white_wood', 'bamboo'],
    rustic: ['rustic_barn', 'natural_wood', 'bamboo'],
    bohemian: ['bamboo', 'vintage_gilt', 'rope_coastal'],
    minimalist: ['acrylic_float', 'minimalist_black', 'white_wood'],
  };

  const recommended = styleMap[req.params.roomStyle] || ['minimalist_black', 'natural_wood', 'white_wood'];
  const frames = FRAME_CATALOG.filter((f) => recommended.includes(f.id));

  res.json(frames);
});
