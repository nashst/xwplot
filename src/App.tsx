import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Settings,
  UserCircle,
  CloudUpload,
  BarChart3,
  Palette,
  Type,
  Download,
  Play,
  Hash,
  Shapes,
  Network,
  ChevronDown,
  Image as ImageIcon,
  Code,
  HelpCircle,
  Loader2,
  Table as TableIcon,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  Brush,
  ReferenceLine,
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parseCSV, ProcessedData, ColumnProfile } from './utils/dataProcessor';
import { CorrelationMatrix } from './components/CorrelationMatrix';
import { DataAlerts } from './components/DataAlerts';
import { DataGrid } from './components/DataGrid';
import { calculateLinearRegression } from './utils/regression';

// Utility for Tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---
const COLORS = ['#040057', '#4edea3', '#c0c1ff', '#f59e0b', '#ef4444', '#8b5cf6'];

const SAMPLE_DATASETS = {
  IRIS: 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv',
  CLIMATE: 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/flights.csv',
};

// --- Components ---

const TopNavBar = () => (
  <header className="sticky top-0 w-full flex justify-between items-center px-6 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
    <div className="flex items-center gap-8">
      <span className="text-xl font-black tracking-tighter text-[#040057]">
        Xwplot Pro
      </span>
      <nav className="hidden md:flex gap-6 items-center h-full">
        <a
          href="#exploration-module"
          className="text-[#040057] border-b-2 border-[#040057] pb-1 font-bold text-sm tracking-tight transition-colors duration-150"
        >
          数据探索
        </a>
        <a
          href="#chart-editor"
          className="text-slate-500 hover:text-slate-800 font-medium text-sm tracking-tight transition-colors duration-150"
        >
          图表编辑器
        </a>
      </nav>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 text-slate-500 hover:bg-slate-50 transition-colors duration-150 rounded-md">
        <Settings className="w-5 h-5" />
      </button>
      <button className="p-2 text-slate-500 hover:bg-slate-50 transition-colors duration-150 rounded-md">
        <UserCircle className="w-5 h-5" />
      </button>
    </div>
  </header>
);

const StatCard = ({
  title,
  value,
  isError,
}: {
  title: string;
  value: string | number;
  isError?: boolean;
}) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
    <p className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">
      {title}
    </p>
    <p
      className={cn(
        'text-3xl font-black',
        isError ? 'text-[#ba1a1a]' : 'text-[#040057]'
      )}
    >
      {value}
    </p>
  </div>
);

const NumericProfileCard = ({ profile }: { profile: ColumnProfile }) => {
  const histogramHeights = profile.histogram || new Array(10).fill(0);

  return (
    <div className="bg-white px-6 py-5 rounded-xl flex flex-col md:flex-row gap-10 items-center border border-slate-200/60 hover:shadow-md transition-all duration-300">
      <div className="flex-1 w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded bg-[#040057]/5 flex items-center justify-center shrink-0">
            <Hash className="w-4 h-4 text-[#040057]" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-slate-900 text-sm truncate" title={profile.name}>{profile.name}</h4>
            <span className="text-[0.55rem] text-slate-400 uppercase font-black tracking-widest">
              Float64
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-y-3 gap-x-12">
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[0.65rem] text-slate-500 font-medium">平均值</span>
            <span className="text-[0.65rem] font-bold text-slate-900">
              {profile.mean?.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[0.65rem] text-slate-500 font-medium">零值</span>
            <span className="text-[0.65rem] font-bold text-slate-900">{profile.zeros}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[0.65rem] text-slate-500 font-medium">最小 / 最大</span>
            <span className="text-[0.65rem] font-bold text-slate-900">
              {profile.min?.toFixed(1)} / {profile.max?.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[0.65rem] text-slate-500 font-medium">缺失</span>
            <span className="text-[0.65rem] font-bold text-slate-900">
              {profile.missingPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-80 h-28 flex items-end gap-[2px]">
        {histogramHeights.map((h, i) => (
          <div
            key={i}
            className="bg-[#040057] w-full rounded-t-[1px] hover:opacity-100 transition-opacity cursor-crosshair"
            style={{ height: `${h}%`, opacity: (h / 100) * 0.8 + 0.1 }}
            title={`区间 ${i + 1}: 频数占比 ${h.toFixed(1)}%`}
          />
        ))}
      </div>
    </div>
  );
};

const CategoricalProfileCard = ({ profile }: { profile: ColumnProfile }) => {
  const categories = profile.frequencies || [];

  return (
    <div className="bg-white px-6 py-5 rounded-xl flex flex-col md:flex-row gap-10 items-center border border-slate-200/60 hover:shadow-md transition-all duration-300">
      <div className="flex-1 w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded bg-[#4edea3]/10 flex items-center justify-center shrink-0">
            <Shapes className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-slate-900 text-sm truncate" title={profile.name}>{profile.name}</h4>
            <span className="text-[0.55rem] text-slate-400 uppercase font-black tracking-widest">
              String
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-y-3 gap-x-12">
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[0.65rem] text-slate-500 font-medium">唯一值</span>
            <span className="text-[0.65rem] font-bold text-slate-900">{profile.distinct}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-1.5">
            <span className="text-[0.65rem] text-slate-500 font-medium">缺失</span>
            <span className="text-[0.65rem] font-bold text-slate-900">
              {profile.missingPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-80 space-y-3">
        {categories.map((cat, i) => (
          <div key={i} className="space-y-1" title={`${cat.name}: ${cat.percent.toFixed(1)}%`}>
            <div className="flex justify-between text-[0.55rem] font-black uppercase tracking-widest text-slate-400">
              <span className="truncate max-w-[150px]" title={cat.name}>{cat.name}</span>
              <span className="text-[#040057]">{cat.percent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#040057] h-full"
                style={{ width: `${cat.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chart Editor State
  const [chartType, setChartType] = useState('Scatter Plot');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxes, setYAxes] = useState<Record<string, boolean>>({});
  const [colorBy, setColorBy] = useState<string>('');

  // Appearance State
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [smoothCurves, setSmoothCurves] = useState(false);
  const [showTrendline, setShowTrendline] = useState(false);
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom');
  const [primaryColor, setPrimaryColor] = useState(COLORS[0]);
  const [xAxisInterval, setXAxisInterval] = useState<number | 'auto'>('auto');
  const [yAxisTickCount, setYAxisTickCount] = useState<number | 'auto'>('auto');
  const [showBrush, setShowBrush] = useState(false);

  // Typography & Axes State
  const [typographyOpen, setTypographyOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [customXAxisLabel, setCustomXAxisLabel] = useState('');
  const [customYAxisLabel, setCustomYAxisLabel] = useState('');
  const [aspectRatio, setAspectRatio] = useState('auto');

  // Export Ref
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExportPNG = async () => {
    if (!chartRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(chartRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${chartType.toLowerCase().replace(' ', '-')}-export.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG', err);
      alert('Failed to export PNG');
    }
  };

  const handleExportSVG = async () => {
    if (!chartRef.current) return;
    try {
      const { toSvg } = await import('html-to-image');
      const dataUrl = await toSvg(chartRef.current, { backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `${chartType.toLowerCase().replace(' ', '-')}-export.svg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export SVG', err);
      alert('Failed to export SVG');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    loadData(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      loadData(file);
    } else {
      setError('Please upload a valid CSV file.');
    }
  };

  const loadData = async (source: File | string) => {
    setLoading(true);
    setError(null);
    try {
      const processed = await parseCSV(source);
      setData(processed);
      
      // Auto-select initial chart config
      const numCols = processed.profiles.filter(p => p.type === 'numeric');
      const catCols = processed.profiles.filter(p => p.type === 'categorical');
      
      if (numCols.length > 0) {
        setXAxis(numCols[0].name);
        const initialYAxes: Record<string, boolean> = {};
        numCols.forEach((col, i) => {
          initialYAxes[col.name] = i === 1 || (numCols.length === 1 && i === 0);
        });
        setYAxes(initialYAxes);
      }
      if (catCols.length > 0) {
        setColorBy(catCols[0].name);
      } else {
        setColorBy('');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data || !xAxis) return [];
    
    // Filter data to only include rows where selected axes are valid numbers
    const selectedYAxes = Object.keys(yAxes).filter(k => yAxes[k]);
    
    return data.data.filter(row => {
      if (typeof row[xAxis] !== 'number') return false;
      for (const y of selectedYAxes) {
        if (typeof row[y] !== 'number') return false;
      }
      return true;
    });
  }, [data, xAxis, yAxes]);

  // Group data for scatter plot if colorBy is selected
  const groupedScatterData = useMemo(() => {
    if (chartType !== 'Scatter Plot' || !colorBy || !data) return null;
    
    const groups: Record<string, any[]> = {};
    chartData.forEach(row => {
      const groupVal = String(row[colorBy] || 'Unknown');
      if (!groups[groupVal]) groups[groupVal] = [];
      groups[groupVal].push(row);
    });
    return groups;
  }, [chartData, chartType, colorBy, data]);

  const renderChart = () => {
    if (!data || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
          所选坐标轴无可用数据。
        </div>
      );
    }

    const selectedYAxes = Object.keys(yAxes).filter(k => yAxes[k]);
    if (selectedYAxes.length === 0 && chartType !== 'Pie Chart') {
      return (
        <div className="flex items-center justify-center h-full text-slate-400">
          请至少选择一个 Y 轴。
        </div>
      );
    }

    const xLabel = customXAxisLabel || xAxis;
    const yLabel = customYAxisLabel || selectedYAxes[0];

    const commonProps = {
      margin: { top: 20, right: 30, bottom: 5, left: yLabel ? 25 : 5 },
      style: { fontFamily },
    };
    
    const legendAlign = legendPosition === 'left' || legendPosition === 'right' ? legendPosition : 'center';
    const legendVerticalAlign = legendPosition === 'top' || legendPosition === 'bottom' ? legendPosition : 'middle';
    const legendLayout = legendPosition === 'left' || legendPosition === 'right' ? 'vertical' : 'horizontal';

    if (chartType === 'Scatter Plot') {
      let trendlineData = null;
      if (showTrendline && selectedYAxes.length > 0) {
        trendlineData = calculateLinearRegression(chartData, xAxis, selectedYAxes[0]);
      }

      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
            <XAxis 
              type="number" 
              dataKey={xAxis} 
              name={xLabel}
              domain={['auto', 'auto']} 
              tickCount={xAxisInterval === 'auto' ? 5 : xAxisInterval}
            />
            <YAxis 
              type="number" 
              dataKey={selectedYAxes[0]} 
              name={yLabel} 
              domain={['auto', 'auto']} 
              label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', offset: -15, style: { textAnchor: 'middle' } } : undefined}
              tickCount={yAxisTickCount === 'auto' ? 5 : yAxisTickCount}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px rgba(25, 28, 30, 0.06)' }}
            />
            {colorBy && groupedScatterData ? (
              Object.entries(groupedScatterData).map(([group, groupData], i) => (
                <Scatter key={group} name={group} data={groupData} fill={COLORS[i % COLORS.length]} opacity={0.7}>
                  {showLabels && <LabelList dataKey={selectedYAxes[0]} position="top" />}
                </Scatter>
              ))
            ) : (
              <Scatter name="Data" data={chartData} fill={primaryColor} opacity={0.7}>
                {showLabels && <LabelList dataKey={selectedYAxes[0]} position="top" />}
              </Scatter>
            )}
            {showTrendline && trendlineData && (
              <ReferenceLine 
                segment={[
                  { x: trendlineData.points[0][xAxis], y: trendlineData.points[0][selectedYAxes[0]] },
                  { x: trendlineData.points[1][xAxis], y: trendlineData.points[1][selectedYAxes[0]] }
                ]} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                strokeWidth={2}
              />
            )}
            {showLegend && colorBy && <Legend align={legendAlign} verticalAlign={legendVerticalAlign} layout={legendLayout} />}
            {showBrush && <Brush dataKey={xAxis} height={30} stroke="#040057" />}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'Pie Chart') {
      const pieData = chartData.slice(0, 20); // Limit to 20 for pie chart readability
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart {...commonProps}>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px rgba(25, 28, 30, 0.06)' }}
            />
            {showLegend && <Legend align={legendAlign} verticalAlign={legendVerticalAlign} layout={legendLayout} />}
            <Pie
              data={pieData}
              dataKey={selectedYAxes[0] || xAxis}
              nameKey={xAxis}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              fill={primaryColor}
              label={showLabels}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'Radar Chart') {
      const radarData = chartData.slice(0, 10); // Limit for readability
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData} {...commonProps}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxis} />
            <PolarRadiusAxis />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px rgba(25, 28, 30, 0.06)' }}
            />
            {showLegend && <Legend align={legendAlign} verticalAlign={legendVerticalAlign} layout={legendLayout} />}
            {selectedYAxes.map((y, i) => (
              <Radar
                key={y}
                name={selectedYAxes.length === 1 && customYAxisLabel ? customYAxisLabel : y}
                dataKey={y}
                stroke={selectedYAxes.length === 1 ? primaryColor : COLORS[i % COLORS.length]}
                fill={selectedYAxes.length === 1 ? primaryColor : COLORS[i % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    // For Line, Bar, Area
    const ChartComponent = chartType === 'Line Graph' ? LineChart : chartType === 'Bar Chart' ? BarChart : AreaChart;
    const DataComponent = chartType === 'Line Graph' ? Line : chartType === 'Bar Chart' ? Bar : Area;
    const curveType = smoothCurves ? 'monotone' : 'linear';

    return (
      <ResponsiveContainer width="100%" height="100%">
        {/* @ts-ignore */}
        <ChartComponent data={chartData} {...commonProps}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />}
          <XAxis 
            dataKey={xAxis} 
            interval={xAxisInterval === 'auto' ? 'preserveEnd' : xAxisInterval}
          />
          <YAxis 
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', offset: -15, style: { textAnchor: 'middle' } } : undefined}
            tickCount={yAxisTickCount === 'auto' ? 5 : yAxisTickCount}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 30px rgba(25, 28, 30, 0.06)' }}
          />
          {showLegend && <Legend align={legendAlign} verticalAlign={legendVerticalAlign} layout={legendLayout} />}
          {selectedYAxes.map((y, i) => (
            // @ts-ignore
            <DataComponent
              key={y}
              type={curveType}
              dataKey={y}
              name={selectedYAxes.length === 1 && customYAxisLabel ? customYAxisLabel : y}
              stroke={selectedYAxes.length === 1 ? primaryColor : COLORS[i % COLORS.length]}
              fill={selectedYAxes.length === 1 ? primaryColor : COLORS[i % COLORS.length]}
              fillOpacity={chartType === 'Area Chart' ? 0.3 : 1}
            >
              {showLabels && <LabelList dataKey={y} position="top" />}
            </DataComponent>
          ))}
          {showBrush && <Brush dataKey={xAxis} height={30} stroke="#040057" />}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-[#f2f4f6] text-slate-900 font-sans selection:bg-[#040057]/20">
      <TopNavBar />
      <main className="flex h-[calc(100vh-3.5rem)]">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col h-full border-r border-slate-200 bg-slate-50 w-72 sticky top-14 overflow-y-auto shrink-0">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              Project Workspace
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
              Analytical Laboratory
            </p>
          </div>

          <div className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              数据源
            </h3>
            
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            <div 
              className="bg-white border border-dashed border-slate-300 p-6 rounded-lg text-center hover:border-[#040057]/50 transition-colors group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <CloudUpload className="w-6 h-6 mx-auto text-slate-400 group-hover:text-[#040057] transition-colors mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                拖拽或点击上传 CSV
              </p>
              <p className="text-xs text-slate-400 mt-1">最大 500MB</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => loadData(SAMPLE_DATASETS.IRIS)}
                className="w-full py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all rounded bg-white"
              >
                加载 IRIS 数据集
              </button>
              <button 
                onClick={() => loadData(SAMPLE_DATASETS.CLIMATE)}
                className="w-full py-2 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all rounded bg-white"
              >
                加载 FLIGHTS 数据集
              </button>
            </div>
          </div>

          <nav className="flex flex-col gap-1 p-4 border-t border-slate-200">
            <a
              href="#exploration-module"
              className="flex items-center gap-3 px-3 py-2 bg-white text-[#040057] shadow-sm rounded-md transition-transform duration-200"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                数据映射
              </span>
            </a>
            <a
              href="#chart-editor"
              onClick={() => setAppearanceOpen(true)}
              className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-transform duration-200"
            >
              <Palette className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                外观设置
              </span>
            </a>
            <a
              href="#chart-editor"
              onClick={() => setTypographyOpen(true)}
              className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-transform duration-200"
            >
              <Type className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                排版与坐标轴
              </span>
            </a>
            <a
              href="#data-grid"
              className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-transform duration-200"
            >
              <TableIcon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                数据明细
              </span>
            </a>
            <a
              href="#export-panel"
              className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-100 transition-transform duration-200"
            >
              <Download className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                导出图表
              </span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-10 pb-20">
            
            {loading && (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#040057]" />
                <span className="ml-3 font-medium text-slate-600">正在处理数据...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {!data && !loading && !error && (
              <div className="text-center p-20 border-2 border-dashed border-slate-300 rounded-2xl">
                <h2 className="text-xl font-bold text-slate-600 mb-2">未加载数据</h2>
                <p className="text-slate-400">请上传 CSV 文件或从侧边栏加载示例数据集以开始。</p>
              </div>
            )}

            {data && !loading && (
              <>
                {/* Data Exploration Module */}
                <section id="exploration-module">
                  <div className="flex items-baseline justify-between mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#040057]">
                      1. 数据探索
                    </h1>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <StatCard title="总变量数" value={data.stats.totalVariables} />
                    <StatCard title="观测值" value={data.stats.observations.toLocaleString()} />
                    <StatCard 
                      title="缺失单元格" 
                      value={`${data.stats.missingCellsPercentage.toFixed(2)}%`} 
                      isError={data.stats.missingCellsPercentage > 0} 
                    />
                    <StatCard title="重复行" value={data.stats.duplicates.toLocaleString()} />
                  </div>

                  <DataAlerts data={data} />

                  <div className="space-y-4">
                    <h3 className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
                      数据概况报告
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {data.profiles.slice(0, 10).map((profile) => (
                        profile.type === 'numeric' 
                          ? <NumericProfileCard key={profile.name} profile={profile} />
                          : <CategoricalProfileCard key={profile.name} profile={profile} />
                      ))}
                      {data.profiles.length > 10 && (
                        <div className="text-center text-sm text-slate-500 py-4">
                          仅显示前 10 个变量。
                        </div>
                      )}
                    </div>
                  </div>

                  <CorrelationMatrix data={data} />
                  
                  <DataGrid data={data} />
                </section>

                <hr className="border-slate-200" />

                {/* Chart Editor Module */}
                <section id="chart-editor">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold tracking-tight text-[#040057]">
                      2. 图表编辑器
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                      配置和优化您的科学可视化图表。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Control Panel */}
                    <div className="xl:col-span-4 space-y-4">
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
                        <div className="flex items-center gap-2 mb-6">
                          <Network className="w-5 h-5 text-[#040057]" />
                          <h4 className="text-[0.65rem] font-black text-slate-900 uppercase tracking-widest">
                            数据映射
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                              图表类型
                            </label>
                            <select 
                              value={chartType}
                              onChange={(e) => setChartType(e.target.value)}
                              className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                            >
                              <option value="Scatter Plot">散点图 (Scatter Plot)</option>
                              <option value="Line Graph">折线图 (Line Graph)</option>
                              <option value="Area Chart">面积图 (Area Chart)</option>
                              <option value="Bar Chart">柱状图 (Bar Chart)</option>
                              <option value="Pie Chart">饼图 (Pie Chart)</option>
                              <option value="Radar Chart">雷达图 (Radar Chart)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                              X 轴
                            </label>
                            <select 
                              value={xAxis}
                              onChange={(e) => setXAxis(e.target.value)}
                              className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                            >
                              {data.profiles.filter(p => p.type === 'numeric' || chartType !== 'Scatter Plot').map(p => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                              Y 轴 (可多选)
                            </label>
                            <div className="space-y-2 p-3 bg-[#f2f4f6] rounded-md border border-slate-100 max-h-48 overflow-y-auto">
                              {data.profiles.filter(p => p.type === 'numeric').map((p) => (
                                <label
                                  key={p.name}
                                  className="flex items-center gap-2 text-[0.7rem] font-medium cursor-pointer text-slate-700"
                                >
                                  <input
                                    type="checkbox"
                                    checked={!!yAxes[p.name]}
                                    onChange={() =>
                                      setYAxes((prev) => ({ ...prev, [p.name]: !prev[p.name] }))
                                    }
                                    className="rounded-sm text-[#040057] focus:ring-[#040057] w-3.5 h-3.5 border-slate-300"
                                  />
                                  <span className="truncate" title={p.name}>{p.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          {chartType === 'Scatter Plot' && (
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                颜色分组 (可选)
                              </label>
                              <select 
                                value={colorBy}
                                onChange={(e) => setColorBy(e.target.value)}
                                className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                              >
                                <option value="">无</option>
                                {data.profiles.filter(p => p.type === 'categorical').map(p => (
                                  <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Appearance Panel */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                        <div 
                          className="flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setAppearanceOpen(!appearanceOpen)}
                        >
                          <div className="flex items-center gap-3">
                            <Palette className="w-5 h-5 text-slate-400" />
                            <h4 className="text-[0.65rem] font-black text-slate-900 uppercase tracking-widest">
                              外观设置
                            </h4>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", appearanceOpen && "rotate-180")} />
                        </div>
                        {appearanceOpen && (
                          <div className="p-4 pt-0 space-y-4 border-t border-slate-100 mt-2">
                            <label className="flex items-center gap-2 text-[0.7rem] font-medium cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={showGrid}
                                onChange={(e) => setShowGrid(e.target.checked)}
                                className="rounded-sm text-[#040057] focus:ring-[#040057] w-3.5 h-3.5 border-slate-300"
                              />
                              显示网格线
                            </label>
                            <label className="flex items-center gap-2 text-[0.7rem] font-medium cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={showLegend}
                                onChange={(e) => setShowLegend(e.target.checked)}
                                className="rounded-sm text-[#040057] focus:ring-[#040057] w-3.5 h-3.5 border-slate-300"
                              />
                              显示图例
                            </label>
                            <label className="flex items-center gap-2 text-[0.7rem] font-medium cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={showLabels}
                                onChange={(e) => setShowLabels(e.target.checked)}
                                className="rounded-sm text-[#040057] focus:ring-[#040057] w-3.5 h-3.5 border-slate-300"
                              />
                              显示数据标签
                            </label>
                            <label className="flex items-center gap-2 text-[0.7rem] font-medium cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={smoothCurves}
                                onChange={(e) => setSmoothCurves(e.target.checked)}
                                className="rounded-sm text-[#040057] focus:ring-[#040057] w-3.5 h-3.5 border-slate-300"
                              />
                              平滑曲线
                            </label>
                            {chartType === 'Scatter Plot' && (
                              <label className="flex items-center gap-2 text-[0.7rem] font-medium cursor-pointer text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={showTrendline}
                                  onChange={(e) => setShowTrendline(e.target.checked)}
                                  className="rounded-sm text-[#040057] focus:ring-[#040057] w-3.5 h-3.5 border-slate-300"
                                />
                                显示趋势线 (线性回归)
                              </label>
                            )}
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                图例位置
                              </label>
                              <select 
                                value={legendPosition}
                                onChange={(e) => setLegendPosition(e.target.value as any)}
                                className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                              >
                                <option value="top">顶部 (Top)</option>
                                <option value="bottom">底部 (Bottom)</option>
                                <option value="left">左侧 (Left)</option>
                                <option value="right">右侧 (Right)</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                主题颜色
                              </label>
                              <div className="flex gap-2">
                                {COLORS.map(c => (
                                  <button
                                    key={c}
                                    onClick={() => setPrimaryColor(c)}
                                    className={cn(
                                      "w-6 h-6 rounded-full border-2 transition-all",
                                      primaryColor === c ? "border-slate-400 scale-110" : "border-transparent hover:scale-110"
                                    )}
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Typography & Axes Panel */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                        <div 
                          className="flex items-center justify-between w-full p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => setTypographyOpen(!typographyOpen)}
                        >
                          <div className="flex items-center gap-3">
                            <Type className="w-5 h-5 text-slate-400" />
                            <h4 className="text-[0.65rem] font-black text-slate-900 uppercase tracking-widest">
                              排版与坐标轴
                            </h4>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", typographyOpen && "rotate-180")} />
                        </div>
                        {typographyOpen && (
                          <div className="p-4 pt-0 space-y-4 border-t border-slate-100 mt-2">
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                图表比例
                              </label>
                              <select 
                                value={aspectRatio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                              >
                                <option value="auto">自适应 (Auto)</option>
                                <option value="aspect-square">1:1 (Square)</option>
                                <option value="aspect-[4/3]">4:3 (Standard)</option>
                                <option value="aspect-video">16:9 (Widescreen)</option>
                                <option value="aspect-[21/9]">21:9 (Ultrawide)</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                字体
                              </label>
                              <select 
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                              >
                                <option value="Inter">Inter (无衬线)</option>
                                <option value="Georgia">Georgia (衬线)</option>
                                <option value="JetBrains Mono">JetBrains Mono (等宽)</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                自定义 X 轴标签
                              </label>
                              <input 
                                type="text"
                                value={customXAxisLabel}
                                onChange={(e) => setCustomXAxisLabel(e.target.value)}
                                placeholder={`默认: ${xAxis}`}
                                className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                自定义 Y 轴标签
                              </label>
                              <input 
                                type="text"
                                value={customYAxisLabel}
                                onChange={(e) => setCustomYAxisLabel(e.target.value)}
                                placeholder="默认: 自动"
                                className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                X 轴标签显示间隔 (0为全部显示)
                              </label>
                              <input 
                                type="number"
                                min="0"
                                value={xAxisInterval === 'auto' ? '' : xAxisInterval}
                                onChange={(e) => setXAxisInterval(e.target.value === '' ? 'auto' : Number(e.target.value))}
                                placeholder="默认: 自动"
                                className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                Y 轴刻度数量
                              </label>
                              <input 
                                type="number"
                                min="2"
                                value={yAxisTickCount === 'auto' ? '' : yAxisTickCount}
                                onChange={(e) => setYAxisTickCount(e.target.value === '' ? 'auto' : Number(e.target.value))}
                                placeholder="默认: 5"
                                className="w-full bg-[#f2f4f6] border-slate-200 text-xs py-2 px-3 rounded-md focus:ring-1 focus:ring-[#040057] outline-none"
                              />
                            </div>
                            <label className="flex items-center gap-2 text-[0.7rem] font-medium cursor-pointer text-slate-700">
                              <input
                                type="checkbox"
                                checked={showBrush}
                                onChange={(e) => setShowBrush(e.target.checked)}
                                className="rounded-sm text-[#040057] focus:ring-[#040057] w-3.5 h-3.5 border-slate-300"
                              />
                              显示底部缩放滑块 (Brush)
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview Area */}
                    <div className="xl:col-span-8 space-y-6">
                      <div 
                        ref={chartRef}
                        className={cn("bg-white rounded-xl shadow-2xl border border-slate-100 relative flex flex-col p-8 overflow-hidden group transition-all duration-300", aspectRatio === 'auto' ? 'min-h-[500px]' : aspectRatio)}
                      >
                        <div className="absolute inset-0 bg-slate-50/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">
                              {chartType} 分析
                            </h4>
                            <p className="text-[0.65rem] text-slate-400 font-mono tracking-wider italic">
                              {xAxis} vs {Object.keys(yAxes).filter(k => yAxes[k]).join(', ')}
                            </p>
                          </div>
                        </div>

                        {/* Chart Container */}
                        <div 
                          className="flex-1 relative w-full h-full min-h-[300px] bg-white"
                          style={{ fontFamily }}
                        >
                          {renderChart()}
                        </div>
                        
                        <div className="mt-6 flex justify-center text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.3em]">
                          {customXAxisLabel || xAxis}
                        </div>
                      </div>

                      {/* Export Controls */}
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={handleExportPNG}
                          className="flex items-center gap-2 px-6 py-2.5 border-2 border-[#040057] text-[#040057] font-bold text-[0.65rem] uppercase tracking-widest rounded-md hover:bg-[#040057]/5 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          导出 PNG
                        </button>
                        <button 
                          onClick={handleExportSVG}
                          className="flex items-center gap-2 px-6 py-2.5 bg-[#040057] text-white font-bold text-[0.65rem] uppercase tracking-widest rounded-md shadow-lg shadow-[#040057]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <Code className="w-4 h-4" />
                          导出 SVG
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-12 h-12 bg-[#040057] text-white rounded-full shadow-2xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

