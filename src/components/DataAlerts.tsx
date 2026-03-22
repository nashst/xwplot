import React, { useMemo } from 'react';
import { ProcessedData } from '../utils/dataProcessor';
import { calculatePearson } from '../utils/correlations';
import { AlertTriangle, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export const DataAlerts = ({ data }: { data: ProcessedData }) => {
  const alerts = useMemo(() => {
    const result: { type: 'danger' | 'warning' | 'info' | 'success', message: string }[] = [];
    
    // 1. Missing values & Cardinality
    data.profiles.forEach(p => {
      if (p.missingPercentage > 0) {
        result.push({ 
          type: p.missingPercentage > 20 ? 'danger' : 'warning', 
          message: `变量 "${p.name}" 包含 ${p.missingPercentage.toFixed(1)}% 的缺失值。` 
        });
      }
      if (p.distinct === 1) {
        result.push({ 
          type: 'info', 
          message: `变量 "${p.name}" 只有 1 个唯一值 (常量)，对建模或分析可能无意义。` 
        });
      }
      if (p.type === 'categorical' && p.distinct > 50 && p.distinct < data.stats.observations) {
        result.push({ 
          type: 'warning', 
          message: `分类变量 "${p.name}" 基数较高（${p.distinct} 个唯一值），可能需要降维或分组。` 
        });
      }
      if (p.type === 'numeric' && p.zeros && (p.zeros / data.stats.observations) > 0.2) {
        result.push({ 
          type: 'info', 
          message: `数值变量 "${p.name}" 包含大量零值（${((p.zeros / data.stats.observations) * 100).toFixed(1)}%）。` 
        });
      }
    });

    // 2. High correlation
    const numericCols = data.profiles.filter(p => p.type === 'numeric').map(p => p.name);
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        const corr = calculatePearson(data.data, numericCols[i], numericCols[j]);
        if (Math.abs(corr) > 0.9) {
          result.push({ 
            type: 'danger', 
            message: `变量 "${numericCols[i]}" 和 "${numericCols[j]}" 高度相关 (r = ${corr.toFixed(2)})，可能存在多重共线性。` 
          });
        }
      }
    }

    if (result.length === 0) {
      result.push({
        type: 'success',
        message: '数据质量良好，未检测到明显的缺失、高相关性或异常分布。'
      });
    }

    return result;
  }, [data]);

  return (
    <div className="mb-10">
      <h3 className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
        智能数据洞察与警告 ({alerts.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {alerts.map((alert, i) => (
          <div key={i} className={`p-4 rounded-xl border flex gap-3 items-start transition-all hover:shadow-sm ${
            alert.type === 'danger' ? 'bg-red-50/50 border-red-200 text-red-800' :
            alert.type === 'warning' ? 'bg-amber-50/50 border-amber-200 text-amber-800' :
            alert.type === 'success' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' :
            'bg-blue-50/50 border-blue-200 text-blue-800'
          }`}>
            {alert.type === 'danger' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />}
            {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />}
            {alert.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />}
            {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />}
            <span className="text-sm font-medium leading-relaxed">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
