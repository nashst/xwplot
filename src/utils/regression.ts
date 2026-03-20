export function calculateLinearRegression(data: any[], xKey: string, yKey: string) {
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  let n = 0;

  for (let i = 0; i < data.length; i++) {
    const x = data[i][xKey];
    const y = data[i][yKey];
    if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      n++;
    }
  }

  if (n === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < data.length; i++) {
    const x = data[i][xKey];
    if (typeof x === 'number' && !isNaN(x)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }

  return {
    slope,
    intercept,
    points: [
      { [xKey]: minX, [yKey]: slope * minX + intercept },
      { [xKey]: maxX, [yKey]: slope * maxX + intercept }
    ]
  };
}
