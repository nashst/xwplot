import React, { useMemo } from 'react';
import { ProcessedData } from '../utils/dataProcessor';
import { calculatePearson, calculateSpearman } from '../utils/correlations';

export const CorrelationMatrix = ({ data }: { data: ProcessedData }) => {
  const numericCols = data.profiles.filter(p => p.type === 'numeric').map(p => p.name);

  const pearsonMatrix = useMemo(() => {
    const matrix: number[][] = [];
    for (let i = 0; i < numericCols.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < numericCols.length; j++) {
        matrix[i][j] = calculatePearson(data.data, numericCols[i], numericCols[j]);
      }
    }
    return matrix;
  }, [data.data, numericCols]);

  const spearmanMatrix = useMemo(() => {
    const matrix: number[][] = [];
    for (let i = 0; i < numericCols.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < numericCols.length; j++) {
        matrix[i][j] = calculateSpearman(data.data, numericCols[i], numericCols[j]);
      }
    }
    return matrix;
  }, [data.data, numericCols]);

  const getColor = (value: number) => {
    if (isNaN(value)) return '#f1f5f9'; // slate-100
    
    // Diverging color scale: Red (-1) to White (0) to Dark Blue (+1)
    if (value > 0) {
      // White (255, 255, 255) to Dark Blue (4, 0, 87)
      const r = Math.round(255 - value * (255 - 4));
      const g = Math.round(255 - value * (255 - 0));
      const b = Math.round(255 - value * (255 - 87));
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

  const renderMatrix = (matrix: number[][], title: string) => (
    <div className="flex-1 min-w-0 flex flex-col items-center">
      <h4 className="text-sm font-bold text-slate-700 mb-6 text-center">{title}</h4>
      <div className="overflow-x-auto w-full flex justify-center">
        <div className="inline-block">
          <div className="flex">
            <div className="w-28 shrink-0"></div>
            {numericCols.map(col => (
              <div key={col} className="w-12 shrink-0 text-center text-[10px] font-bold text-slate-500 truncate px-1" title={col}>
                {col}
              </div>
            ))}
          </div>
          {numericCols.map((rowCol, i) => (
            <div key={rowCol} className="flex items-center">
              <div className="w-28 shrink-0 text-right pr-4 text-[10px] font-bold text-slate-500 truncate" title={rowCol}>
                {rowCol}
              </div>
              {numericCols.map((col, j) => {
                const val = matrix[i][j];
                return (
                  <div 
                    key={col} 
                    className="w-12 h-12 shrink-0 border border-white flex items-center justify-center text-[10px] font-medium transition-colors hover:opacity-80 cursor-default"
                    style={{ 
                      backgroundColor: getColor(val), 
                      color: Math.abs(val) > 0.5 ? 'white' : 'black' 
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
      </div>
    </div>
  );

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.2em]">
          变量相关性矩阵
        </h3>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="pt-4 lg:pt-0 lg:pr-4 flex justify-center">
            {renderMatrix(pearsonMatrix, 'Pearson Correlation')}
          </div>
          <div className="pt-8 lg:pt-0 lg:pl-4 flex justify-center">
            {renderMatrix(spearmanMatrix, 'Spearman Correlation')}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-10 flex items-center justify-center gap-3 text-xs font-bold text-slate-500">
          <span>-1.0</span>
          <div className="w-64 h-3 rounded-full" style={{ background: 'linear-gradient(to right, rgb(239,68,68), rgb(255,255,255), rgb(4,0,87))' }}></div>
          <span>1.0</span>
        </div>
      </div>
    </div>
  );
};
