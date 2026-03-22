import React, { useState } from 'react';
import { ProcessedData } from '../utils/dataProcessor';
import { Download, Table as TableIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const DataGrid = ({ data }: { data: ProcessedData }) => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 50;
  const totalPages = Math.ceil(data.data.length / rowsPerPage);

  const handleDownload = () => {
    const headers = data.profiles.map(p => p.name).join(',');
    const rows = data.data.map(row =>
      data.profiles.map(p => {
        const val = row[p.name];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'xwplot_data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-12" id="data-grid">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <TableIcon className="w-4 h-4" /> 数据明细与导出
        </h3>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-[#040057] text-white text-xs font-bold rounded-lg hover:bg-[#040057]/90 transition-all shadow-sm hover:shadow-md"
        >
          <Download className="w-3.5 h-3.5" /> 导出 CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50 shadow-sm z-10">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-500 border-b border-slate-200 whitespace-nowrap bg-slate-50">#</th>
                {data.profiles.map(p => (
                  <th key={p.name} className="px-4 py-3 font-bold text-slate-700 border-b border-slate-200 whitespace-nowrap bg-slate-50">
                    {p.name}
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{p.type}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.data.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-2 text-slate-400 font-mono text-xs">{page * rowsPerPage + i + 1}</td>
                  {data.profiles.map(p => (
                    <td key={p.name} className="px-4 py-2 text-slate-600 whitespace-nowrap max-w-[200px] truncate" title={String(row[p.name])}>
                      {row[p.name] !== null && row[p.name] !== undefined && row[p.name] !== '' ? String(row[p.name]) : <span className="text-slate-300 italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <span className="text-xs font-medium text-slate-500">
            显示 {page * rowsPerPage + 1} - {Math.min((page + 1) * rowsPerPage, data.data.length)} 条，共 {data.data.length.toLocaleString()} 条
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
