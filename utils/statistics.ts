export interface MatchData {
  Season_End_Year: number;
  Wk: number;
  Date: string;
  Home: string;
  HomeGoals: number;
  AwayGoals: number;
  Away: string;
  FTR: "H" | "D" | "A";
  TotalGoals?: number;
}

export interface Analysis {
  homeStats: {
    mean: number;
    median: number;
    mode: string;
    q1: number;
    q3: number;
  };
  awayStats: {
    mean: number;
    median: number;
    mode: string;
    q1: number;
    q3: number;
  };
  totalStats: {
    mean: number;
    median: number;
    mode: string;
    q1: number;
    q3: number;
  };
  homeFreq: Record<string, number>;
  awayFreq: Record<string, number>;
  totalFreq: Record<string, number>;
  ftrFreq: Record<string, number>;
  ftrPercentages: Record<string, string>;
  totalMatches: number;
}

export const calculateMean = (data: number[]): number => {
  return data.reduce((acc, val) => acc + val, 0) / data.length;
};

export const calculateMedian = (data: number[]): number => {
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

export const calculateMode = (data: number[]): number[] => {
  const frequency: { [key: number]: number } = {};
  data.forEach((value) => {
    frequency[value] = (frequency[value] || 0) + 1;
  });

  const maxFrequency = Math.max(...Object.values(frequency));
  return Object.entries(frequency)
    .filter(([_, freq]) => freq === maxFrequency)
    .map(([value]) => Number(value));
};

export const calculateQuartiles = (data: number[]): { Q1: number; Q2: number; Q3: number } => {
  const sorted = [...data].sort((a, b) => a - b);
  const Q2 = calculateMedian(sorted);

  const lowerHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const upperHalf = sorted.slice(Math.ceil(sorted.length / 2));

  return {
    Q1: calculateMedian(lowerHalf),
    Q2,
    Q3: calculateMedian(upperHalf),
  };
};

export const calculateFrequencyDistribution = (data: number[]): { value: number; frequency: number }[] => {
  const frequency: { [key: number]: number } = {};
  data.forEach((value) => {
    frequency[value] = (frequency[value] || 0) + 1;
  });

  return Object.entries(frequency)
    .map(([value, freq]) => ({
      value: Number(value),
      frequency: freq,
    }))
    .sort((a, b) => a.value - b.value);
};

export const calculateCumulativeFrequency = (freqDist: { value: number; frequency: number }[]): { value: number; cumulative: number }[] => {
  let cumulative = 0;
  return freqDist.map(({ value, frequency }) => {
    cumulative += frequency;
    return { value, cumulative };
  });
};

export const calculateFTRDistribution = (data: MatchData[]): { label: string; value: number; percentage: number }[] => {
  const total = data.length;
  const counts = {
    H: data.filter((match) => match.FTR === "H").length,
    D: data.filter((match) => match.FTR === "D").length,
    A: data.filter((match) => match.FTR === "A").length,
  };

  return [
    { label: "Home Win", value: counts.H, percentage: (counts.H / total) * 100 },
    { label: "Draw", value: counts.D, percentage: (counts.D / total) * 100 },
    { label: "Away Win", value: counts.A, percentage: (counts.A / total) * 100 },
  ];
};
