'use client';
import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, RotateCw, ZoomIn, ZoomOut, Camera, Upload, X, Sofa, Eye, Move, Wand2, Save, Image as Img, FolderOpen, FlipHorizontal } from 'lucide-react';
import { PRODUCTS, ROOMS, CATS } from '@/lib/products';
import Link from 'next/link';

interface PlacedItem { id: string; imageUrl: string; name: string; x: number; y: number; w: number; h: number; rotation: number; opacity: number; bgRemoved: boolean; processedUrl: string; mirrored: boolean; }

export default function TryOnPage() {
  const [roomImage, setRoomImage] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [cat, setCat] = useState('All');
  const [roomFilter, setRoomFilter] = useState('');
  const [bgProcessing, setBgProcessing] = useState(false);
  const [resizeDir, setResizeDir] = useState('');
  const [tab, setTab] = useState<'products' | 'gallery'>('products');
  const [gallery, setGallery] = useState<string[]>([]);
  const [fullViewImg, setFullViewImg] = useState('');

  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const productFileRef = useRef<HTMLInputElement>(null);
  const dragOff = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, ix: 0, iy: 0 });

  const active = items.find((i) => i.id === activeId) || null;

  useEffect(() => {
    if (!useCamera) return;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } })
      .then((s) => { streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; }).catch(() => {});
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; };
  }, [useCamera]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (!f) return; setRoomImage(URL.createObjectURL(f)); setUseCamera(false); e.target.value = ''; };

  // Upload custom product image from user's device
  const handleProductUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    const rect = canvasRef.current?.getBoundingClientRect();
    const cx = (rect?.width || 600) / 2 - 100;
    const cy = (rect?.height || 400) / 2 - 100;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), imageUrl: url, name: f.name.split('.')[0], x: cx, y: cy, w: 200, h: 200, rotation: 0, opacity: 100, bgRemoved: false, processedUrl: '', mirrored: false }]);
    e.target.value = '';
  };

  // Save canvas as image
  const saveImage = async () => {
    const el = canvasRef.current; if (!el) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(el, { useCORS: true, allowTaint: true });
    const dataUrl = canvas.toDataURL('image/png');
    setGallery((prev) => [dataUrl, ...prev]);
    // Also trigger download
    const link = document.createElement('a');
    link.download = `artvision-design-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const d = e.dataTransfer.getData('text/plain'); if (!d) return;
    const p = JSON.parse(d);
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    const x = e.clientX - rect.left - 90; const y = e.clientY - rect.top - 90;
    setItems((prev) => [...prev, { id: crypto.randomUUID(), imageUrl: p.imageUrl, name: p.name, x, y, w: 200, h: 200, rotation: 0, opacity: 100, bgRemoved: false, processedUrl: '', mirrored: false }]);
  };

  const onPtrDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation(); setActiveId(id); dragging.current = true;
    const it = items.find((i) => i.id === id); if (!it) return;
    dragOff.current = { x: e.clientX - it.x, y: e.clientY - it.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPtrMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (resizeDir && activeId) {
      const dx = e.clientX - resizeStart.current.x; const dy = e.clientY - resizeStart.current.y;
      setItems((p) => p.map((i) => {
        if (i.id !== activeId) return i;
        let nx = resizeStart.current.ix, ny = resizeStart.current.iy, nw = resizeStart.current.w, nh = resizeStart.current.h;
        if (resizeDir.includes('e')) nw = Math.max(50, resizeStart.current.w + dx);
        if (resizeDir.includes('w')) { nw = Math.max(50, resizeStart.current.w - dx); nx = resizeStart.current.ix + dx; }
        if (resizeDir.includes('s')) nh = Math.max(50, resizeStart.current.h + dy);
        if (resizeDir.includes('n')) { nh = Math.max(50, resizeStart.current.h - dy); ny = resizeStart.current.iy + dy; }
        return { ...i, x: nx, y: ny, w: nw, h: nh };
      }));
      return;
    }
    if (!dragging.current || !activeId) return;
    setItems((p) => p.map((i) => i.id === activeId ? { ...i, x: e.clientX - dragOff.current.x, y: e.clientY - dragOff.current.y } : i));
  };

  const onPtrUp = () => { dragging.current = false; setResizeDir(''); };

  const beginResize = (e: React.PointerEvent<HTMLDivElement>, dir: string) => {
    e.stopPropagation(); e.preventDefault(); setResizeDir(dir); dragging.current = false;
    const it = items.find((i) => i.id === activeId); if (!it) return;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: it.w, h: it.h, ix: it.x, iy: it.y };
  };

  const del = () => { setItems((p) => p.filter((i) => i.id !== activeId)); setActiveId(''); };
  const rotate = () => setItems((p) => p.map((i) => i.id === activeId ? { ...i, rotation: (i.rotation + 15) % 360 } : i));

  const removeBg = async () => {
    if (!active) return;
    if (active.bgRemoved) { setItems((p) => p.map((i) => i.id === activeId ? { ...i, bgRemoved: false } : i)); return; }
    setBgProcessing(true);
    try {
      const mod = await import('@imgly/background-removal');
      const blob = await mod.removeBackground(active.imageUrl);
      const url = URL.createObjectURL(blob);
      setItems((p) => p.map((i) => i.id === activeId ? { ...i, processedUrl: url, bgRemoved: true } : i));
    } catch (err) { console.error('BG removal failed:', err); }
    setBgProcessing(false);
  };

  const filtered = PRODUCTS.filter((p) => {
    const mc = cat === 'All' || p.category === cat.toLowerCase();
    const mr = !roomFilter || p.room === roomFilter;
    return mc && mr;
  });

  const startDrag = (e: React.DragEvent<HTMLDivElement>, data: { imageUrl: string; name: string }) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ ...data, type: 'product' })); e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <aside className="w-[350px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Link href="/"><button className="p-1.5 rounded-lg hover:bg-gray-100"><X className="h-4 w-4" /></button></Link>
            <span className="font-black text-sm text-blue-800">ARTVISION</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => fileRef.current?.click()} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${roomImage ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}><Upload className="h-3 w-3" />Photo</button>
            <button onClick={() => { setUseCamera(true); setRoomImage(''); }} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${useCamera ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}><Camera className="h-3 w-3" />Live</button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <input ref={productFileRef} type="file" accept="image/*" onChange={handleProductUpload} className="hidden" />

        {/* Tabs: Products | Gallery */}
        <div className="px-4 pt-2 pb-1 flex gap-1 shrink-0">
          <button onClick={() => setTab('products')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${tab === 'products' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}><Sofa className="h-3.5 w-3.5" />Products</button>
          <button onClick={() => setTab('gallery')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${tab === 'gallery' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}><FolderOpen className="h-3.5 w-3.5" />Gallery ({gallery.length})</button>
        </div>

        {tab === 'gallery' ? (
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {gallery.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><Img className="h-10 w-10 mx-auto opacity-30 mb-2" /><p className="text-sm font-medium">No saved designs yet</p><p className="text-xs mt-1">Place products and click Save to capture</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-3">{gallery.map((img, i) => (<div key={i} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer" onClick={() => setFullViewImg(img)}><img src={img} alt={`Design ${i + 1}`} className="w-full object-contain" /><p className="text-[10px] text-gray-500 text-center py-1">Design {i + 1} — Click to view full</p></div>))}</div>
            )}
          </div>
        ) : (<>
          {/* Room categories 2x2 grid */}
          <div className="px-4 py-2 border-b shrink-0">
            <div className="grid grid-cols-2 gap-1.5">
              {ROOMS.map((r) => (
                <button key={r.id} onClick={() => setRoomFilter(roomFilter === r.id ? '' : r.id)} className={`relative rounded-lg overflow-hidden aspect-[5/3] ${roomFilter === r.id ? 'ring-2 ring-blue-500' : ''}`}>
                  <img src={r.image} alt={r.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-white text-[10px] font-bold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload custom product */}
          <div className="px-4 py-2 border-b shrink-0">
            <button onClick={() => productFileRef.current?.click()} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-500 flex items-center justify-center gap-1.5 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <Upload className="h-3.5 w-3.5" />Upload product from device / web
            </button>
          </div>

          {/* Category chips */}
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto shrink-0">
            {CATS.map((c) => (<button key={c} onClick={() => setCat(c)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${cat === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>{c}</button>))}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <p className="text-[10px] text-gray-400 mb-2"><Move className="h-3 w-3 inline" /> Drag onto room</p>
            <div className="grid grid-cols-2 gap-2.5">
              {filtered.map((p) => (
                <div key={p.id} draggable onDragStart={(e) => startDrag(e, { imageUrl: p.imageUrl, name: p.name })} className="rounded-xl bg-white border border-gray-100 cursor-grab hover:shadow-lg hover:border-blue-300 transition-all">
                  <div className="aspect-square bg-gray-50 p-1.5 overflow-hidden rounded-t-xl"><img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover rounded-lg" draggable={false} /></div>
                  <div className="px-2 py-1.5"><p className="font-black text-[11px]">{p.name}</p><p className="text-[10px] text-gray-500">{p.series}</p><p className="text-[9px] text-gray-400">{p.size}</p></div>
                </div>
              ))}
            </div>
          </div>
        </>)}
      </aside>

      {/* Canvas */}
      <main ref={canvasRef} className="flex-1 relative bg-gray-200" onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }} onPointerMove={onPtrMove} onPointerUp={onPtrUp} onClick={() => setActiveId('')}>
        {useCamera && <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />}
        {roomImage && <img src={roomImage} alt="room" className="absolute inset-0 w-full h-full object-cover" />}
        {!useCamera && !roomImage && <div className="absolute inset-0 flex items-center justify-center"><div className="text-center text-gray-400"><Camera className="h-12 w-12 mx-auto opacity-30" /><p className="font-semibold text-sm mt-2">Upload a photo or start camera</p></div></div>}

        {/* Save button */}
        {(roomImage || useCamera) && (
          <button onClick={saveImage} className="absolute top-4 right-4 z-40 flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-md text-xs font-bold hover:bg-blue-50 transition-colors">
            <Save className="h-4 w-4 text-blue-600" />Save Design
          </button>
        )}

        {/* Placed items */}
        {items.map((item) => {
          const isAct = item.id === activeId;
          return (
            <div key={item.id} className="absolute z-20 cursor-grab active:cursor-grabbing" style={{ left: item.x, top: item.y, width: item.w, height: item.h, transform: `rotate(${item.rotation}deg) scaleX(${item.mirrored ? -1 : 1})`, opacity: item.opacity / 100 }}
              onPointerDown={(e) => onPtrDown(e, item.id)} onClick={(e) => { e.stopPropagation(); setActiveId(item.id); }}
              onWheel={(e) => { e.preventDefault(); const d = e.deltaY > 0 ? -12 : 12; setItems((p) => p.map((i) => i.id === item.id ? { ...i, w: Math.max(50, i.w + d), h: Math.max(50, i.h + d) } : i)); }}>
              {isAct && (<>
                <div className="absolute -inset-2 border-[3px] border-yellow-400 rounded-xl pointer-events-none" style={{ boxShadow: '0 0 16px rgba(250,204,21,0.5)' }} />
                <div className="absolute -top-3 -left-3 w-5 h-5 bg-white border-2 border-yellow-400 rounded-full cursor-nw-resize z-30" onPointerDown={(e) => beginResize(e, 'nw')} />
                <div className="absolute -top-3 -right-3 w-5 h-5 bg-white border-2 border-yellow-400 rounded-full cursor-ne-resize z-30" onPointerDown={(e) => beginResize(e, 'ne')} />
                <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-white border-2 border-yellow-400 rounded-full cursor-sw-resize z-30" onPointerDown={(e) => beginResize(e, 'sw')} />
                <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-white border-2 border-yellow-400 rounded-full cursor-se-resize z-30" onPointerDown={(e) => beginResize(e, 'se')} />
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-3.5 bg-white border-2 border-yellow-400 rounded-full cursor-n-resize z-30" onPointerDown={(e) => beginResize(e, 'n')} />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-3.5 bg-white border-2 border-yellow-400 rounded-full cursor-s-resize z-30" onPointerDown={(e) => beginResize(e, 's')} />
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-7 bg-white border-2 border-yellow-400 rounded-full cursor-w-resize z-30" onPointerDown={(e) => beginResize(e, 'w')} />
                <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-7 bg-white border-2 border-yellow-400 rounded-full cursor-e-resize z-30" onPointerDown={(e) => beginResize(e, 'e')} />
              </>)}
              <div className="absolute -bottom-3 left-[12%] right-[12%] h-5 pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(0,0,0,0.35) 0%,transparent 70%)', filter: 'blur(6px)' }} />
              <img src={item.bgRemoved && item.processedUrl ? item.processedUrl : item.imageUrl} alt={item.name} className={`w-full h-full pointer-events-none ${item.bgRemoved ? 'object-contain' : 'object-cover rounded-lg'}`} style={{ filter: item.bgRemoved ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' : '' }} draggable={false} crossOrigin="anonymous" />
              {bgProcessing && item.id === activeId && (<div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center pointer-events-none"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>)}
            </div>
          );
        })}

        {/* Toolbar */}
        {active && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-white/95 backdrop-blur rounded-2xl px-4 py-2.5 shadow-xl border">
            <button disabled={bgProcessing} onClick={removeBg} className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border ${active.bgRemoved ? 'bg-green-50 border-green-300 text-green-700' : bgProcessing ? 'bg-blue-50 border-blue-200 text-blue-600 animate-pulse' : 'border-gray-200 hover:bg-gray-50'}`}><Wand2 className="h-4 w-4" />{bgProcessing ? 'Processing...' : active.bgRemoved ? 'Restore BG' : 'Remove BG'}</button>
            <div className="w-px h-6 bg-gray-200" />
            <button onClick={() => setItems((p) => p.map((i) => i.id === activeId ? { ...i, w: Math.max(50, i.w - 25), h: Math.max(50, i.h - 25) } : i))} className="p-2 rounded-lg hover:bg-gray-100"><ZoomOut className="h-4 w-4" /></button>
            <input type="range" min="50" max="500" value={active.w} onChange={(e) => { const v = parseInt(e.target.value); const r = active.h / active.w; setItems((p) => p.map((i) => i.id === activeId ? { ...i, w: v, h: Math.round(v * r) } : i)); }} className="w-24 h-2 accent-blue-600" />
            <button onClick={() => setItems((p) => p.map((i) => i.id === activeId ? { ...i, w: Math.min(600, i.w + 25), h: Math.min(600, i.h + 25) } : i))} className="p-2 rounded-lg hover:bg-gray-100"><ZoomIn className="h-4 w-4" /></button>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-1">
              <button onClick={() => setItems((p) => p.map((i) => i.id === activeId ? { ...i, rotation: i.rotation - 15 } : i))} className="p-1 rounded hover:bg-gray-100 text-gray-500" title="Rotate left 15°"><RotateCw className="h-3.5 w-3.5 -scale-x-100" /></button>
              <input type="range" min="-180" max="180" value={active.rotation} onChange={(e) => setItems((p) => p.map((i) => i.id === activeId ? { ...i, rotation: parseInt(e.target.value) } : i))} className="w-20 h-1.5 accent-blue-600" />
              <button onClick={() => setItems((p) => p.map((i) => i.id === activeId ? { ...i, rotation: i.rotation + 15 } : i))} className="p-1 rounded hover:bg-gray-100 text-gray-500" title="Rotate right 15°"><RotateCw className="h-3.5 w-3.5" /></button>
              <span className="text-[10px] font-bold text-gray-600 w-8">{active.rotation}°</span>
            </div>
            <button onClick={() => setItems((p) => p.map((i) => i.id === activeId ? { ...i, mirrored: !i.mirrored } : i))} className={`p-2 rounded-lg border ${active.mirrored ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-transparent hover:bg-gray-100'}`} title="Mirror"><FlipHorizontal className="h-4 w-4" /></button>
            <div className="flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-gray-400" /><input type="range" min="20" max="100" value={active.opacity} onChange={(e) => setItems((p) => p.map((i) => i.id === activeId ? { ...i, opacity: parseInt(e.target.value) } : i))} className="w-14 h-1.5 accent-blue-600" /></div>
            <div className="w-px h-6 bg-gray-200" />
            <button onClick={del} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}
        {active && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur rounded-xl px-4 py-1.5 shadow-md"><p className="font-bold text-xs">{active.name}</p><p className="text-[10px] text-gray-400">{Math.round(active.w)}x{Math.round(active.h)}px</p></div>}
      </main>

      {/* Full view gallery modal */}
      {fullViewImg && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setFullViewImg('')}>
          <button className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors" onClick={() => setFullViewImg('')}><X className="h-6 w-6 text-white" /></button>
          <img src={fullViewImg} alt="Full view" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
