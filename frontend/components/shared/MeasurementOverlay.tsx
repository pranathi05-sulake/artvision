'use client';

import { useAppStore } from '@/lib/store';
import { cmToInches } from '@/lib/utils';

interface MeasurementOverlayProps {
  visible: boolean;
}

export function MeasurementOverlay({ visible }: MeasurementOverlayProps) {
  const { placements, selectedPlacementId, roomAnalysis } = useAppStore();

  if (!visible || !roomAnalysis) return null;

  const selectedPlacement = placements.find((p) => p.id === selectedPlacementId);

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Wall dimension labels */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        Wall: {roomAnalysis.wall_dimensions.width_cm}cm ({cmToInches(roomAnalysis.wall_dimensions.width_cm).toFixed(0)}&quot;)
      </div>

      {/* Selected artwork dimensions */}
      {selectedPlacement && (
        <div
          className="absolute border-2 border-dashed border-primary/50"
          style={{
            left: selectedPlacement.position.x,
            top: selectedPlacement.position.y,
            width: selectedPlacement.size.width,
            height: selectedPlacement.size.height,
          }}
        >
          {/* Width label */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
            {selectedPlacement.realWorldSize.widthCm}cm
          </div>
          {/* Height label */}
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
            {selectedPlacement.realWorldSize.heightCm}cm
          </div>
        </div>
      )}
    </div>
  );
}
