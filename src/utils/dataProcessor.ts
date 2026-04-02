import Papa from 'papaparse';

export type ColumnType = 'numeric' | 'categorical';

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  missingCount: number;
  missingPercentage: number;
  // Numeric specific
  mean?: number;
  min?: number;
  max?: number;
  zeros?: number;
  histogram?: number[]; // 10 bins
  // Categorical specific
  distinct?: number;
  frequencies?: { name: string; count: number; percent: number }[];
}

export interface DataStats {
  totalVariables: number;
  observations: number;
  missingCellsPercentage: number;
  duplicates: number;
}

export interface ProcessedData {
  data: any[];
  columns: string[];
  stats: DataStats;
  profiles: ColumnProfile[];
}

export const parseData = async (fileOrUrl: File | string): Promise<ProcessedData> => {
  let isJson = false;
  let contentToParse: string | File = fileOrUrl;

  if (typeof fileOrUrl === 'string') {
    isJson = fileOrUrl.toLowerCase().endsWith('.json');
    if (isJson) {
      const response = await fetch(fileOrUrl);
      const jsonData = await response.json();
      return processJsonData(jsonData);
    }
  } else if (fileOrUrl instanceof File) {
    isJson = fileOrUrl.name.toLowerCase().endsWith('.json');
    if (isJson) {
      const text = await fileOrUrl.text();
      const jsonData = JSON.parse(text);
      return processJsonData(jsonData);
    }
  }

  // Fallback to CSV parsing
  return new Promise((resolve, reject) => {
    Papa.parse(contentToParse as any, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      download: typeof contentToParse === 'string',
      complete: (results: any) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(results.errors);
        } else {
          resolve(processData(results.data, results.meta.fields || []));
        }
      },
      error: (error: any) => reject(error),
    } as any);
  });
};

const processJsonData = (jsonData: any): ProcessedData => {
  let dataArray: any[] = [];
  if (Array.isArray(jsonData)) {
    dataArray = jsonData;
  } else if (typeof jsonData === 'object' && jsonData !== null) {
    // Try to find the first array in the object
    const arrayValues = Object.values(jsonData).filter(Array.isArray);
    if (arrayValues.length > 0) {
      dataArray = arrayValues[0];
    } else {
      dataArray = [jsonData];
    }
  }
  
  const fields = dataArray.length > 0 ? Object.keys(dataArray[0]) : [];
  return processData(dataArray, fields);
};

const processData = (data: any[], fields: string[]): ProcessedData => {
  const observations = data.length;
  const totalVariables = fields.length;
  let totalMissing = 0;
  
  // Calculate duplicates
  const uniqueRows = new Set(data.map(row => JSON.stringify(row)));
  const duplicates = observations - uniqueRows.size;

  const profiles: ColumnProfile[] = fields.map(field => {
    const values = data.map(row => row[field]);
    const missingCount = values.filter(v => v === null || v === undefined || v === '').length;
    totalMissing += missingCount;
    
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    
    // Determine type: if more than 80% of non-null values are numbers, treat as numeric
    const numberCount = nonNullValues.filter(v => typeof v === 'number').length;
    const isNumeric = nonNullValues.length > 0 && (numberCount / nonNullValues.length) > 0.8;
    
    if (isNumeric) {
      const nums = nonNullValues.map(v => Number(v)).filter(n => !isNaN(n));
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / nums.length;
      const zeros = nums.filter(n => n === 0).length;
      
      // Histogram (10 bins)
      const bins = new Array(10).fill(0);
      const range = max - min || 1;
      nums.forEach(n => {
        let binIndex = Math.floor(((n - min) / range) * 10);
        if (binIndex === 10) binIndex = 9;
        if (binIndex >= 0 && binIndex < 10) bins[binIndex]++;
      });
      const maxBin = Math.max(...bins);
      const histogram = bins.map(b => maxBin > 0 ? (b / maxBin) * 100 : 0);

      return {
        name: field,
        type: 'numeric',
        missingCount,
        missingPercentage: observations > 0 ? (missingCount / observations) * 100 : 0,
        mean, min, max, zeros, histogram
      };
    } else {
      // Categorical
      const counts: Record<string, number> = {};
      nonNullValues.forEach(v => {
        const str = String(v);
        counts[str] = (counts[str] || 0) + 1;
      });
      const distinct = Object.keys(counts).length;
      
      const frequencies = Object.entries(counts)
        .map(([name, count]) => ({ name, count, percent: observations > 0 ? (count / observations) * 100 : 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        name: field,
        type: 'categorical',
        missingCount,
        missingPercentage: observations > 0 ? (missingCount / observations) * 100 : 0,
        distinct, frequencies
      };
    }
  });

  const totalCells = observations * totalVariables;
  const missingCellsPercentage = totalCells > 0 ? (totalMissing / totalCells) * 100 : 0;

  return {
    data,
    columns: fields,
    stats: {
      totalVariables,
      observations,
      missingCellsPercentage,
      duplicates
    },
    profiles
  };
};
