
import React from 'react';
import { MapNode } from '../types';
import { Skull, Tent, Crown, Swords, Lock } from 'lucide-react';

interface MapSceneProps {
  mapNodes: MapNode[];
  currentNodeId: number;
  onNodeSelect: (node: MapNode) => void;
}

const MapScene: React.FC<MapSceneProps> = ({ mapNodes, currentNodeId, onNodeSelect }) => {
  
  const getIcon = (type: string) => {
    switch(type) {
      case 'COMBAT': return <Swords size={20} />;
      case 'ELITE': return <Skull size={20} />;
      case 'BOSS': return <Crown size={24} />;
      case 'REST': return <Tent size={20} />;
      default: return <Swords size={20} />;
    }
  };

  const getColor = (node: MapNode, isAvailable: boolean) => {
    if (node.id === currentNodeId && node.completed) return 'bg-stone-600 border-stone-500 text-stone-400 shadow-none';
    if (node.completed) return 'bg-stone-800 border-stone-700 text-stone-600 grayscale';
    if (isAvailable) return 'bg-amber-800 border-amber-500 text-amber-200 animate-pulse cursor-pointer hover:bg-amber-700 hover:scale-110 shadow-[0_0_15px_rgba(245,158,11,0.6)]';
    return 'bg-stone-900 border-stone-800 text-stone-700 opacity-50';
  };

  // Determine available next nodes
  const currentNode = mapNodes.find(n => n.id === currentNodeId);
  const availableIds = currentNode && currentNode.completed 
    ? currentNode.next 
    : (currentNodeId === -1 ? [0] : []); // Start at 0 if new game

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1c1917] relative overflow-hidden">
      {/* Background: Parchment / Old Map Texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583324622718-e398d5c4146a?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-40 sepia contrast-125"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-transparent to-stone-950/80"></div>
      
      <div className="absolute top-10 z-10 text-center">
          <h2 className="text-4xl text-amber-600 h-font tracking-[0.2em] font-bold text-shadow-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">西行余烬</h2>
          <div className="h-0.5 w-32 bg-stone-600 mx-auto mt-2"></div>
      </div>

      <div className="relative w-full max-w-5xl h-[500px] border-y-4 border-double border-stone-700 bg-stone-900/40 backdrop-blur-sm p-10 flex items-center overflow-x-auto scrollbar-hide shadow-2xl">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>

        {/* Draw Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {mapNodes.map(node => 
            node.next.map(nextId => {
              const nextNode = mapNodes.find(n => n.id === nextId);
              if (!nextNode) return null;
              const x1 = `${node.x}%`; 
              const y1 = `${node.y}%`;
              const x2 = `${nextNode.x}%`;
              const y2 = `${nextNode.y}%`;
              
              const isPathActive = node.completed && (availableIds.includes(nextId) || mapNodes[nextId].completed);

              return (
                <line 
                  key={`${node.id}-${nextId}`} 
                  x1={x1} y1={y1} x2={x2} y2={y2} 
                  stroke={isPathActive ? "#b45309" : "#44403c"} 
                  strokeWidth={isPathActive ? "3" : "2"}
                  strokeDasharray={isPathActive ? "none" : "8,4"}
                />
              );
            })
          )}
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0 w-full h-full">
            {mapNodes.map(node => {
                const isAvailable = availableIds.includes(node.id) || (currentNodeId === -1 && node.id === 0);
                
                return (
                    <button
                        key={node.id}
                        disabled={!isAvailable}
                        onClick={() => onNodeSelect(node)}
                        className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 z-10 ${getColor(node, isAvailable)}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        {getIcon(node.type)}
                        {/* Current Indicator Ring */}
                        {node.id === currentNodeId && !node.completed && (
                           <div className="absolute -inset-3 border-2 border-amber-500 rounded-full animate-ping opacity-50"></div>
                        )}
                        {node.type === 'BOSS' && <div className="absolute -top-6 text-xs text-red-500 font-bold tracking-widest bg-black/80 px-1 rounded">BOSS</div>}
                    </button>
                )
            })}
        </div>
      </div>

      <div className="mt-8 z-10 max-w-md text-center bg-stone-900/60 p-4 rounded-lg border border-stone-700">
        <p className="text-stone-400 text-lg italic h-font">
          "前路漫漫，妖魔横行，唯有以此残躯，再续真经。"
        </p>
      </div>
    </div>
  );
};

export default MapScene;
