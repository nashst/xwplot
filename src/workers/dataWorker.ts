import { parseData, ProcessedData } from '../utils/dataProcessor';

self.onmessage = async (e: MessageEvent) => {
  try {
    const { source } = e.data;
    const processedData = await parseData(source);
    self.postMessage({ type: 'SUCCESS', data: processedData });
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
