export function calculatePearson(data: any[], col1: string, col2: string): number {
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  let n = 0;
  
  for (let i = 0; i < data.length; i++) {
    const x = data[i][col1];
    const y = data[i][col2];
    
    if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
      n++;
    }
  }
  
  if (n === 0) return 0;
  
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (denominator === 0) return 0;
  
  return (n * sumXY - sumX * sumY) / denominator;
}

function getRanks(values: number[]): number[] {
  const sorted = values.map((val, i) => ({ val, i })).sort((a, b) => a.val - b.val);
  const ranks = new Array(values.length);
  
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length && sorted[j].val === sorted[i].val) {
      j++;
    }
    const rank = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k++) {
      ranks[sorted[k].i] = rank;
    }
    i = j;
  }
  return ranks;
}

export function calculateSpearman(data: any[], col1: string, col2: string): number {
  const validPairs = data
    .map(row => ({ x: row[col1], y: row[col2] }))
    .filter(pair => typeof pair.x === 'number' && typeof pair.y === 'number' && !isNaN(pair.x) && !isNaN(pair.y));

  if (validPairs.length === 0) return 0;

  const xValues = validPairs.map(p => p.x);
  const yValues = validPairs.map(p => p.y);

  const xRanks = getRanks(xValues);
  const yRanks = getRanks(yValues);

  const rankData = xRanks.map((xRank, i) => ({ xRank, yRank: yRanks[i] }));
  return calculatePearson(rankData, 'xRank', 'yRank');
}
