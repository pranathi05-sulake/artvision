export interface Product {
  id: string;
  name: string;
  series: string;
  size: string;
  category: string;
  room: string;
  imageUrl: string;
}

export interface Art {
  id: string;
  title: string;
  artist: string;
  size: string;
  category: string;
  imageUrl: string;
}

export const PRODUCTS: Product[] = [
  // ── LIVING ROOM / SEATING ──
  { id:'p1',  name:'Modern Armchair',    series:'Velvet accent chair',       size:'70×73×75 cm',  category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop&q=80' },
  { id:'p2',  name:'Wing Chair',         series:'Classic wingback',          size:'82×96×101 cm', category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&q=80' },
  { id:'p3',  name:'Lounge Chair',       series:'Mid-century modern',        size:'68×82×100 cm', category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop&q=80' },
  { id:'p4',  name:'3-Seat Sofa',        series:'Fabric sofa, beige',        size:'228×95×83 cm', category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&q=80' },
  { id:'p5',  name:'Leather Sofa',       series:'Brown leather 3-seat',      size:'204×89×78 cm', category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop&q=80' },
  { id:'p6',  name:'Recliner',           series:'Fabric recliner chair',     size:'75×80×105 cm', category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop&q=80' },
  { id:'p7',  name:'Tub Chair',          series:'Round accent chair, grey',  size:'72×68×76 cm',  category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop&q=80' },
  { id:'p8',  name:'Chaise Lounge',      series:'Velvet chaise, emerald',    size:'160×65×80 cm', category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=400&h=400&fit=crop&q=80' },
  { id:'p9',  name:'Sectional Sofa',     series:'L-shape, light grey',       size:'270×200×85 cm',category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&h=400&fit=crop&q=80' },
  { id:'p10', name:'Loveseat',           series:'2-seat sofa, navy blue',    size:'150×85×80 cm', category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=400&h=400&fit=crop&q=80' },
  { id:'p11', name:'Accent Bench',       series:'Upholstered bench, cream',  size:'120×45×50 cm', category:'seating',  room:'living', imageUrl:'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop&q=80' },

  // ── TABLES ──
  { id:'p12', name:'Coffee Table',       series:'Wooden round table',        size:'90×90×45 cm',  category:'tables',   room:'living',    imageUrl:'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop&q=80' },
  { id:'p13', name:'Dining Table',       series:'Oak dining table',          size:'140×78×74 cm', category:'tables',   room:'dining',    imageUrl:'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop&q=80' },
  { id:'p14', name:'Side Table',         series:'Metal & glass',             size:'45×45×55 cm',  category:'tables',   room:'living',    imageUrl:'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&h=400&fit=crop&q=80' },
  { id:'p15', name:'Console Table',      series:'Entryway table',            size:'120×35×80 cm', category:'tables',   room:'living',    imageUrl:'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400&h=400&fit=crop&q=80' },
  { id:'p16', name:'Nightstand',         series:'Bedside table, white',      size:'30×50×67 cm',  category:'tables',   room:'bedroom',   imageUrl:'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&h=400&fit=crop&q=80' },

  // ── STORAGE ──
  { id:'p17', name:'Bookshelf',          series:'5-tier shelf unit',         size:'80×28×202 cm', category:'storage',  room:'living',    imageUrl:'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop&q=80' },
  { id:'p18', name:'TV Stand',           series:'Media console, walnut',     size:'180×42×50 cm', category:'storage',  room:'living',    imageUrl:'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400&h=400&fit=crop&q=80' },
  { id:'p19', name:'Dresser',            series:'6-drawer chest',            size:'160×50×96 cm', category:'storage',  room:'bedroom',   imageUrl:'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=400&h=400&fit=crop&q=80' },
  { id:'p20', name:'Wardrobe',           series:'Sliding door wardrobe',     size:'200×60×236 cm',category:'storage',  room:'bedroom',   imageUrl:'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop&q=80' },

  // ── BEDS ──
  { id:'p21', name:'Platform Bed',       series:'Queen bed frame, oak',      size:'160×200 cm',   category:'beds',     room:'bedroom',   imageUrl:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop&q=80' },
  { id:'p22', name:'Upholstered Bed',    series:'King bed, grey fabric',     size:'180×200 cm',   category:'beds',     room:'bedroom',   imageUrl:'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=400&h=400&fit=crop&q=80' },

  // ── LIGHTING ──
  { id:'p23', name:'Floor Lamp',         series:'Arc floor lamp, brass',     size:'H181 cm',      category:'lighting', room:'living',    imageUrl:'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=400&h=400&fit=crop&q=80' },
  { id:'p24', name:'Table Lamp',         series:'Ceramic table lamp',        size:'H45 cm',       category:'lighting', room:'bedroom',   imageUrl:'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop&q=80' },
  { id:'p25', name:'Pendant Light',      series:'Rattan pendant',            size:'Ø54 cm',       category:'lighting', room:'dining',    imageUrl:'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop&q=80' },

  // ── DECOR ──
  { id:'p26', name:'Round Mirror',       series:'Wall mirror, walnut',       size:'Ø80 cm',       category:'decor',    room:'bedroom',   imageUrl:'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop&q=80' },

  // ── WORKSPACE ──
  { id:'p27', name:'Office Desk',        series:'Standing desk, white',      size:'120×60×72 cm', category:'tables',   room:'workspace', imageUrl:'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop&q=80' },
  { id:'p28', name:'Office Chair',       series:'Ergonomic mesh chair',      size:'68×68×110 cm', category:'seating',  room:'workspace', imageUrl:'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop&q=80' },
  { id:'p29', name:'Filing Cabinet',     series:'3-drawer cabinet',          size:'41×50×67 cm',  category:'storage',  room:'workspace', imageUrl:'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop&q=80' },
];

export const ARTS: Art[] = [];

export const ROOMS = [
  { id:'living',    label:'Living Room', image:'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
  { id:'dining',    label:'Dining',      image:'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop' },
  { id:'bedroom',   label:'Bedroom',     image:'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop' },
  { id:'workspace', label:'Workspace',   image:'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop' },
];

export const CATS = ['All', 'Seating', 'Storage', 'Tables', 'Beds', 'Lighting', 'Decor'];
export const ART_CATS = ['All'];
