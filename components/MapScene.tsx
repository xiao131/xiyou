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
    if (node.id === currentNodeId && node.completed) return 'bg-stone-600 border-stone-500 text-stone-400';
    if (node.completed) return 'bg-stone-800 border-stone-700 text-stone-600';
    if (isAvailable) return 'bg-amber-900 border-amber-500 text-amber-200 animate-pulse cursor-pointer hover:bg-amber-800';
    return 'bg-stone-900 border-stone-800 text-stone-700 opacity-50';
  };

  // Determine available next nodes
  const currentNode = mapNodes.find(n => n.id === currentNodeId);
  const availableIds = currentNode && currentNode.completed 
    ? currentNode.next 
    : (currentNodeId === -1 ? [0] : []); // Start at 0 if new game

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0c0a09] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale"></div>
      
      <h2 className="text-4xl text-amber-500 h-font mb-8 z-10 tracking-[0.2em] font-bold text-shadow">西行余烬</h2>

      <div className="relative w-full max-w-4xl h-96 border-y-2 border-stone-800 bg-stone-950/80 backdrop-blur-sm p-10 flex items-center overflow-x-auto scrollbar-hide">
        {/* Draw Connection Lines (Simple SVG overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {mapNodes.map(node => 
            node.next.map(nextId => {
              const nextNode = mapNodes.find(n => n.id === nextId);
              if (!nextNode) return null;
              // Simple percentage based positioning for demo
              const x1 = `${node.x}%`; 
              const y1 = `${node.y}%`;
              const x2 = `${nextNode.x}%`;
              const y2 = `${nextNode.y}%`;
              return (
                <line 
                  key={`${node.id}-${nextId}`} 
                  x1={x1} y1={y1} x2={x2} y2={y2} 
                  stroke={node.completed && (availableIds.includes(nextId) || mapNodes[nextId].completed) ? "#78350f" : "#292524"} 
                  strokeWidth="2" 
                  strokeDasharray="5,5"
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
                        className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center transition-all z-10 ${getColor(node, isAvailable)}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        {getIcon(node.type)}
                        {/* Current Indicator */}
                        {node.id === currentNodeId && !node.completed && (
                           <div className="absolute -inset-2 border-2 border-amber-500 rounded-full animate-ping"></div>
                        )}
                    </button>
                )
            })}
        </div>
      </div>

      <div className="mt-8 z-10 max-w-md text-center">
        <p className="text-stone-400 text-lg italic h-font">
          "西行路断，唯余回响。"
        </p>
      </div>
    </div>
  );
};

export default MapScene;