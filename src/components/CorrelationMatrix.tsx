import React, { useState, useMemo } from 'react';
import { ProcessedData } from '../utils/dataProcessor';
import { calculatePearson, calculateSpearman } from '../utils/correlations';

export const CorrelationMatrix = ({ data }: { data: ProcessedData }) => {
  const [activeTab, setActiveTab] = useState('Pearson');

  const numericCols = data.profiles.filter(p => p.type === 'numeric').map(p => p.name);

  const correlationMatrix = useMemo(() => {
    const matrix: number[][] = [];
    for (let i = 0; i < numericCols.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < numericCols.length; j++) {
        if (activeTab === 'Pearson') {
          matrix[i][j] = calculatePearson(data.data, numericCols[i], numericCols[j]);
        } else {
          matrix[i][j] = calculateSpearman(data.data, numericCols[i], numericCols[j]);
        }
      }
    }
    return matrix;
  }, [data.data, numericCols, activeTab]);

  const getColor = (value: number) => {
    if (isNaN(value)) return '#f1f5f9'; // slate-100
    
    // Diverging color scale: Red (-1) to White (0) to Mint Green (+1)
    if (value > 0) {
      // White (255, 255, 255) to Mint Green (78, 222, 163)
      const r = Math.round(255 - value * (255 - 78));
      const g = Math.round(255 - value * (255 - 222));
      const b = Math.round(255 - value * (255 - 163));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // White (255, 255, 255) to Red (239, 68, 68)
      const absVal = Math.abs(value);
      const r = Math.round(255 - absVal * (255 - 239));
      const g = Math.round(255 - absVal * (255 - 68));
      const b = Math.round(255 - absVal * (255 - 68));
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  if (numericCols.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.2em]">
          变量相关性矩阵
        </h3>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeTab === 'Pearson' ? 'bg-[#040057] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            onClick={() => setActiveTab('Pearson')}
          >
            Pearson
          </button>
          <button 
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeTab === 'Spearman' ? 'bg-[#040057] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            onClick={() => setActiveTab('Spearman')}
          >
            Spearman
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex">
            <div className="w-32 shrink-0"></div>
            {numericCols.map(col => (
              <div key={col} className="w-12 shrink-0 text-center text-[10px] font-bold text-slate-500 truncate px-1" title={col}>
                {col}
              </div>
            ))}
          </div>
          {numericCols.map((rowCol, i) => (
            <div key={rowCol} className="flex items-center">
              <div className="w-32 shrink-0 text-right pr-4 text-[10px] font-bold text-slate-500 truncate" title={rowCol}>
                {rowCol}
              </div>
              {numericCols.map((col, j) => {
                const val = correlationMatrix[i][j];
                return (
                  <div 
                    key={col} 
                    className="w-12 h-12 shrink-0 border border-white flex items-center justify-center text-[10px] font-medium transition-colors hover:opacity-80 cursor-default"
                    style={{ 
                      backgroundColor: getColor(val), 
                      color: val < -0.5 ? 'white' : 'black' 
                    }}
                    title={`${rowCol} vs ${col}: ${val.toFixed(3)}`}
                  >
                    {val.toFixed(2)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex items-center justify-end gap-2 text-[10px] font-bold text-slate-500">
          <span>-1.0</span>
          <div className="w-32 h-3 rounded-full" style={{ background: 'linear-gradient(to right, rgb(239,68,68), rgb(255,255,255), rgb(78,222,163))' }}></div>
          <span>1.0</span>
        </div>
      </div>
    </div>
  );
};
