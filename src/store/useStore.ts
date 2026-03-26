import { create } from 'zustand';
import { ProcessedData } from '../utils/dataProcessor';

interface AppState {
  // Data State
  data: ProcessedData | null;
  loading: boolean;
  error: string | null;
  setData: (data: ProcessedData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Chart Editor State
  chartType: string;
  setChartType: (type: string) => void;
  xAxis: string;
  setXAxis: (axis: string) => void;
  yAxes: Record<string, boolean>;
  setYAxes: (axes: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  colorBy: string;
  setColorBy: (color: string) => void;

  // Appearance State
  appearanceOpen: boolean;
  setAppearanceOpen: (open: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showLegend: boolean;
  setShowLegend: (show: boolean) => void;
  showLabels: boolean;
  setShowLabels: (show: boolean) => void;
  smoothCurves: boolean;
  setSmoothCurves: (show: boolean) => void;
  showTrendline: boolean;
  setShowTrendline: (show: boolean) => void;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  setLegendPosition: (pos: 'top' | 'bottom' | 'left' | 'right') => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  xAxisInterval: number | 'auto';
  setXAxisInterval: (interval: number | 'auto') => void;
  yAxisTickCount: number | 'auto';
  setYAxisTickCount: (count: number | 'auto') => void;
  showBrush: boolean;
  setShowBrush: (show: boolean) => void;

  // Typography & Axes State
  typographyOpen: boolean;
  setTypographyOpen: (open: boolean) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  customXAxisLabel: string;
  setCustomXAxisLabel: (label: string) => void;
  customYAxisLabel: string;
  setCustomYAxisLabel: (label: string) => void;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;

  // View State
  currentView: 'data' | 'chart' | 'dashboard';
  setCurrentView: (view: 'data' | 'chart' | 'dashboard') => void;

  // Dashboard State
  dashboardLayout: any[];
  setDashboardLayout: (layout: any[]) => void;
}

export const useStore = create<AppState>((set) => ({
  data: null,
  loading: false,
  error: null,
  setData: (data) => set({ data }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  chartType: 'Scatter Plot',
  setChartType: (chartType) => set({ chartType }),
  xAxis: '',
  setXAxis: (xAxis) => set({ xAxis }),
  yAxes: {},
  setYAxes: (updater) => set((state) => ({ yAxes: typeof updater === 'function' ? updater(state.yAxes) : updater })),
  colorBy: '',
  setColorBy: (colorBy) => set({ colorBy }),

  appearanceOpen: false,
  setAppearanceOpen: (appearanceOpen) => set({ appearanceOpen }),
  showGrid: true,
  setShowGrid: (showGrid) => set({ showGrid }),
  showLegend: true,
  setShowLegend: (showLegend) => set({ showLegend }),
  showLabels: false,
  setShowLabels: (showLabels) => set({ showLabels }),
  smoothCurves: false,
  setSmoothCurves: (smoothCurves) => set({ smoothCurves }),
  showTrendline: false,
  setShowTrendline: (showTrendline) => set({ showTrendline }),
  legendPosition: 'bottom',
  setLegendPosition: (legendPosition) => set({ legendPosition }),
  primaryColor: '#040057',
  setPrimaryColor: (primaryColor) => set({ primaryColor }),
  xAxisInterval: 'auto',
  setXAxisInterval: (xAxisInterval) => set({ xAxisInterval }),
  yAxisTickCount: 'auto',
  setYAxisTickCount: (yAxisTickCount) => set({ yAxisTickCount }),
  showBrush: false,
  setShowBrush: (showBrush) => set({ showBrush }),

  typographyOpen: false,
  setTypographyOpen: (typographyOpen) => set({ typographyOpen }),
  fontFamily: 'Inter',
  setFontFamily: (fontFamily) => set({ fontFamily }),
  customXAxisLabel: '',
  setCustomXAxisLabel: (customXAxisLabel) => set({ customXAxisLabel }),
  customYAxisLabel: '',
  setCustomYAxisLabel: (customYAxisLabel) => set({ customYAxisLabel }),
  aspectRatio: 'auto',
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),

  currentView: 'data',
  setCurrentView: (currentView) => set({ currentView }),

  dashboardLayout: [
    { i: 'summary', x: 0, y: 0, w: 12, h: 2, static: true },
    { i: 'chart', x: 0, y: 2, w: 8, h: 10 },
    { i: 'correlations', x: 8, y: 2, w: 4, h: 10 }
  ],
  setDashboardLayout: (dashboardLayout) => set({ dashboardLayout }),
}));
