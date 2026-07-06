import { motion } from 'framer-motion';
import type { Floor, Unit } from '@/types/building';
import { cn } from '@/utils/cn';

interface InteractiveBlueprintProps {
  sortedFloors: Floor[];
  unitsByFloor: Map<string, Unit[]>;
  selectedUnit: Unit | null;
  onRoomClick: (unit: Unit) => void;
}

export function InteractiveBlueprint({
  sortedFloors,
  unitsByFloor,
  selectedUnit,
  onRoomClick,
}: InteractiveBlueprintProps) {
  const totalFloorsCount = sortedFloors.length;
  
  if (totalFloorsCount === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-line bg-paper-dim text-sm text-ink-faint">
        No building layout data available to render blueprint.
      </div>
    );
  }

  // Configuration for rendering layout geometries dynamically
  const rowHeight = 70;
  const paddingX = 60;
  const paddingY = 50;
  const maxUnitsInAnyFloor = Math.max(
    ...sortedFloors.map(f => unitsByFloor.get(f.floorNumber.toString())?.length || 1),
    1
  );
  
  const unitWidth = Math.max(75, Math.min(110, 480 / maxUnitsInAnyFloor));
  const facadeWidth = maxUnitsInAnyFloor * unitWidth;
  const svgWidth = facadeWidth + paddingX * 2;
  const svgHeight = (totalFloorsCount * rowHeight) + paddingY * 2;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-line bg-slate-50/50 p-4 dark:bg-zinc-950/20 backdrop-blur-sm shadow-inner">
      <div className="min-w-[600px] mx-auto relative select-none">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto font-mono text-[10px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blueprint Grid / Drafting Construction Lines */}
          <defs>
            <pattern id="blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" rx="8" />

          {/* Core Structural Vertical Plumb Alignment Rules */}
          <line x1={paddingX} y1={15} x2={paddingX} y2={svgHeight - 15} stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 4" />
          <line x1={paddingX + facadeWidth} y1={15} x2={paddingX + facadeWidth} y2={svgHeight - 15} stroke="#cbd5e1" strokeWidth="0.75" strokeDasharray="4 4" />

          {/* Dynamic Building Render Loop */}
          {sortedFloors.map((floor, floorIdx) => {
            const currentFloorUnits = unitsByFloor.get(floor.floorNumber.toString()) || [];
            // Calculate absolute Y from SVG top downwards coordinate system
            const yPos = paddingY + (floorIdx * rowHeight);
            
            return (
              <g key={floor._id} className="group/floor">
                {/* Floor Level Label Datum Callouts */}
                <text 
                  x={paddingX - 15} 
                  y={yPos + (rowHeight / 2) + 4} 
                  textAnchor="end" 
                  className="fill-slate-400 font-bold tracking-tight"
                >
                  {floor.name || `Lvl ${floor.floorNumber}`}
                </text>
                <line 
                  x1={paddingX - 10} 
                  y1={yPos + (rowHeight / 2)} 
                  x2={paddingX} 
                  y2={yPos + (rowHeight / 2)} 
                  stroke="#94a3b8" 
                  strokeWidth="1" 
                />

                {/* Main Structural Slab Beam Line */}
                <line 
                  x1={paddingX - 20} 
                  y1={yPos + rowHeight} 
                  x2={paddingX + facadeWidth + 20} 
                  y2={yPos + rowHeight} 
                  stroke="#475569" 
                  strokeWidth="1.5" 
                />

                {/* Render Individual Dynamic Room/Unit Boundary Modules */}
                {currentFloorUnits.map((unit, unitIdx) => {
                  const xPos = paddingX + (unitIdx * unitWidth);
                  const isSelected = selectedUnit?._id === unit._id;
                  
                  // Style configurations mapping state onto blueprint wires
                  const isOccupied = unit.isOccupied || unit.status === 'occupied';
                  const isMaintenance = unit.status === 'under maintenance';
                  
                  let fillTone = "rgba(255, 255, 255, 0.75)";
                  if (isSelected) fillTone = "rgba(220, 38, 38, 0.08)";
                  else if (isOccupied) fillTone = "rgba(71, 85, 105, 0.03)";
                  else if (isMaintenance) fillTone = "rgba(245, 158, 11, 0.03)";

                  return (
                    <g 
                      key={unit._id} 
                      className="cursor-pointer"
                      onClick={() => onRoomClick(unit)}
                    >
                      {/* Room Wall Shell bounding frame */}
                      <motion.rect
                        x={xPos}
                        y={yPos}
                        width={unitWidth}
                        height={rowHeight}
                        fill={fillTone}
                        stroke={isSelected ? "#dc2626" : "#64748b"}
                        strokeWidth={isSelected ? "2" : "1"}
                        className="transition-all duration-200 hover:fill-slate-100/80"
                        whileHover={{ strokeWidth: isSelected ? 2 : 1.5 }}
                      />

                      {/* Internal Architectural Cross-Hatch detailing on non-available items */}
                      {isOccupied && (
                        <path 
                          d={`M ${xPos} ${yPos} L ${xPos + unitWidth} ${yPos + rowHeight}`} 
                          stroke="rgba(100, 116, 139, 0.15)" 
                          strokeWidth="0.75" 
                        />
                      )}

                      {/* Blueprint Structural Column Corner Hatching Marks */}
                      <rect x={xPos} y={yPos} width="5" height="5" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                      <rect x={xPos + unitWidth - 5} y={yPos} width="5" height="5" fill="none" stroke="#94a3b8" strokeWidth="0.5" />

                      {/* Room Details / Label strings */}
                      <text 
                        x={xPos + (unitWidth / 2)} 
                        y={yPos + 24} 
                        textAnchor="middle" 
                        className={cn(
                          "font-bold text-[11px] tracking-wide transition-colors",
                          isSelected ? "fill-red-600 font-black" : "fill-slate-800"
                        )}
                      >
                        {unit.unitNumber}
                      </text>
                      
                      <text 
                        x={xPos + (unitWidth / 2)} 
                        y={yPos + 42} 
                        textAnchor="middle" 
                        className="fill-slate-400 text-[8px] uppercase tracking-wider font-semibold"
                      >
                        {unit.bedrooms} BR / {unit.bathrooms} BA
                      </text>

                      {/* Micro Status Indicators on Blueprint footer lines */}
                      <circle 
                        cx={xPos + (unitWidth / 2)} 
                        cy={yPos + 56} 
                        r="3" 
                        className={cn(
                          isOccupied ? "fill-slate-400" : isMaintenance ? "fill-amber-500" : "fill-emerald-500"
                        )} 
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Building Grade/Ground Datum Base Line */}
          <rect 
            x={paddingX - 30} 
            y={svgHeight - paddingY} 
            width={facadeWidth + 60} 
            height="4" 
            fill="#1e293b" 
          />
          <text 
            x={paddingX - 15} 
            y={svgHeight - paddingY + 16} 
            className="fill-slate-500 font-bold uppercase tracking-widest text-[8px]"
          >
            Ground Elevation Datum 0.00
          </text>
        </svg>
      </div>
    </div>
  );
}