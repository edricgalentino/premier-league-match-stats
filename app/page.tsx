"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import _ from "lodash";
import { Analysis, MatchData } from "../utils/statistics";
import { loadMatchData } from "../services/dataService";

const PremierLeagueAnalysis = () => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [metaMatchData, setMetaMatchData] = useState<{
    totalMatches: number;
    totalGoals: number;
    totalHomeGoals: number;
    totalAwayGoals: number;
    totalDraws: number;
    totalHomeWins: number;
    totalAwayWins: number;
    fileInfo: {
      FileName: string;
      FileSize: number;
      FileType: string;
      FileLastModified: Date;
      FileCreated: Date;
      FileUpdated: Date;
    };
  } | null>(null);

  const calculateStats = (values: number[]) => {
    const sorted = values.sort((a, b) => a - b);
    const n = values.length;

    const mean = _.mean(values);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

    // Calculate mode
    const frequency = _.countBy(values);
    const maxFreq = Math.max(...(Object.values(frequency) as number[]));
    const modes = Object.keys(frequency)
      .filter((key) => frequency[key] === maxFreq)
      .map(Number);
    const mode = modes.length === values.length ? "No mode" : modes.join(", ");

    // Calculate quartiles
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];

    return { mean, median, mode, q1, q3, sorted };
  };

  const performAnalysis = (matchData: MatchData[]) => {
    const homeGoals = matchData.map((match) => match.HomeGoals);
    const awayGoals = matchData.map((match) => match.AwayGoals);
    const totalGoals = matchData.map((match) => match.TotalGoals);

    const homeStats = calculateStats(homeGoals);
    const awayStats = calculateStats(awayGoals);
    const totalStats = calculateStats(totalGoals as number[]);

    // Frequency distributions
    const homeFreq = _.countBy(homeGoals);
    const awayFreq = _.countBy(awayGoals);
    const totalFreq = _.countBy(totalGoals);
    const ftrFreq = _.countBy(matchData, "FTR");

    // FTR percentages
    const totalMatches = matchData.length;
    const ftrPercentages = {
      H: (((ftrFreq.H || 0) / totalMatches) * 100).toFixed(1),
      D: (((ftrFreq.D || 0) / totalMatches) * 100).toFixed(1),
      A: (((ftrFreq.A || 0) / totalMatches) * 100).toFixed(1),
    };

    setAnalysis({
      homeStats,
      awayStats,
      totalStats,
      homeFreq,
      awayFreq,
      totalFreq,
      ftrFreq,
      ftrPercentages,
      totalMatches,
    });
  };

  const createHistogramData = (freq: Record<string, number>) => {
    return Object.entries(freq)
      .map(([goals, count]) => ({ goals: parseInt(goals), count }))
      .sort((a, b) => a.goals - b.goals);
  };

  const createCumulativeData = (freq: Record<string, number>) => {
    const sorted = Object.entries(freq)
      .map(([goals, count]) => ({ goals: parseInt(goals), count }))
      .sort((a, b) => a.goals - b.goals);

    let cumulative = 0;
    return sorted.map((item) => {
      cumulative += item.count as number;
      return { goals: item.goals, cumulative };
    });
  };

  const createPieData = () => {
    if (!analysis) return [];
    return [
      { name: "Home Win", value: analysis.ftrFreq.H || 0, color: "#8884d8" },
      { name: "Draw", value: analysis.ftrFreq.D || 0, color: "#82ca9d" },
      { name: "Away Win", value: analysis.ftrFreq.A || 0, color: "#ffc658" },
    ];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchData = await loadMatchData();
        performAnalysis(matchData.processedData);
        setMetaMatchData(matchData);
      } catch (err) {
        console.error("Error loading match data:", err);
      }
    };

    fetchData();
  }, []);

  if (!analysis) {
    return <div className="p-8">Loading analysis...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">Premier League Descriptive Statistical Analysis</h1>

      {/* overview of the data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Overview of the Data */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-8 flex flex-col justify-between h-full">
          <h2 className="text-2xl font-semibold mb-6 text-blue-900 flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
            Overview of the Data
          </h2>
          <div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Matches</dt>
                <dd className="text-lg font-bold text-blue-800">{metaMatchData?.totalMatches}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Goals</dt>
                <dd className="text-lg font-bold text-blue-800">{metaMatchData?.totalGoals}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Home Goals</dt>
                <dd className="text-lg font-bold text-blue-800">{metaMatchData?.totalHomeGoals}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Away Goals</dt>
                <dd className="text-lg font-bold text-blue-800">{metaMatchData?.totalAwayGoals}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Draws</dt>
                <dd className="text-lg font-bold text-blue-800">{metaMatchData?.totalDraws}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Home Wins</dt>
                <dd className="text-lg font-bold text-blue-800">{metaMatchData?.totalHomeWins}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Away Wins</dt>
                <dd className="text-lg font-bold text-blue-800">{metaMatchData?.totalAwayWins}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Overview of the File */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-8 flex flex-col justify-between h-full">
          <h2 className="text-2xl font-semibold mb-6 text-blue-900 flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-blue-400 rounded-full mr-2"></span>
            Overview of the File
          </h2>
          <div className="mb-4 flex gap-2">
            <a href={`/csv/${metaMatchData?.fileInfo.FileName}`} className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition" download>
              <svg className="inline-block w-5 h-5 mr-2 -mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Download File
            </a>
            <a href="https://www.kaggle.com/datasets/evangower/premier-league-matches-19922022/data" className="inline-block px-4 py-2.5 bg-gray-200 text-blue-700 rounded-lg shadow hover:bg-gray-300 transition text-sm font-medium" target="_blank" rel="noopener noreferrer">
              View File Source on Kaggle
            </a>
          </div>
          <dl className="grid grid-cols-1 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">File Name</dt>
              <dd className="text-lg font-bold text-blue-800 break-all">{metaMatchData?.fileInfo.FileName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">File Size</dt>
              <dd className="text-lg font-bold text-blue-800">{metaMatchData?.fileInfo.FileSize ? (metaMatchData.fileInfo.FileSize / 1024).toFixed(2) : 0} KB</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">File Type</dt>
              <dd className="text-lg font-bold text-blue-800">{metaMatchData?.fileInfo.FileType}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">A. Nilai Rata-rata, Median, Modus, Kuartil</h2>

        <div className="space-y-6">
          {/* 1. Average */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">1. Nilai Rata-rata (Average)</h3>
            <div className="ml-6 space-y-2">
              <p className="text-gray-700">
                <strong>1.1 Average Home Goals per Match:</strong> {analysis.homeStats.mean.toFixed(2)} goals
              </p>
              <p className="text-gray-700">
                <strong>1.2 Average Away Goals per Match:</strong> {analysis.awayStats.mean.toFixed(2)} goals
              </p>
              <p className="text-gray-700">
                <strong>1.3 Average Total Goals per Match:</strong> {analysis.totalStats.mean.toFixed(2)} goals
              </p>
            </div>
          </div>

          {/* 2. Median */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">2. Median</h3>
            <div className="ml-6 space-y-2">
              <p className="text-gray-700">
                <strong>2.1 Median of Home Goals per Match:</strong> {analysis.homeStats.median} goals
              </p>
              <p className="text-gray-700">
                <strong>2.2 Median of Away Goals per Match:</strong> {analysis.awayStats.median} goals
              </p>
              <p className="text-gray-700">
                <strong>2.3 Median of Total Goals per Match:</strong> {analysis.totalStats.median} goals
              </p>
            </div>
          </div>

          {/* 3. Mode */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">3. Modus (Mode)</h3>
            <div className="ml-6 space-y-2">
              <p className="text-gray-700">
                <strong>3.1 Mode of Home Goals per Match:</strong> {analysis.homeStats.mode} goals
              </p>
              <p className="text-gray-700">
                <strong>3.2 Mode of Away Goals per Match:</strong> {analysis.awayStats.mode} goals
              </p>
              <p className="text-gray-700">
                <strong>3.3 Mode of Total Goals per Match:</strong> {analysis.totalStats.mode} goals
              </p>
            </div>
          </div>

          {/* 4. Quartiles */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">4. Kuartil (Quartiles)</h3>
            <div className="ml-6 space-y-4">
              <div>
                <p className="text-gray-700">
                  <strong>4.1 Home Goals Quartiles:</strong>
                </p>
                <div className="ml-4 space-y-1">
                  <p className="text-gray-600">• Q1 (25%): {analysis.homeStats.q1} goals</p>
                  <p className="text-gray-600">• Q2 (50% - Median): {analysis.homeStats.median} goals</p>
                  <p className="text-gray-600">• Q3 (75%): {analysis.homeStats.q3} goals</p>
                </div>
              </div>
              <div>
                <p className="text-gray-700">
                  <strong>4.2 Away Goals Quartiles:</strong>
                </p>
                <div className="ml-4 space-y-1">
                  <p className="text-gray-600">• Q1 (25%): {analysis.awayStats.q1} goals</p>
                  <p className="text-gray-600">• Q2 (50% - Median): {analysis.awayStats.median} goals</p>
                  <p className="text-gray-600">• Q3 (75%): {analysis.awayStats.q3} goals</p>
                </div>
              </div>
              <div>
                <p className="text-gray-700">
                  <strong>4.3 Total Goals Quartiles:</strong>
                </p>
                <div className="ml-4 space-y-1">
                  <p className="text-gray-600">• Q1 (25%): {analysis.totalStats.q1} goals</p>
                  <p className="text-gray-600">• Q2 (50% - Median): {analysis.totalStats.median} goals</p>
                  <p className="text-gray-600">• Q3 (75%): {analysis.totalStats.q3} goals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">B. Histogram, Ogive, dan Diagram Lingkaran</h2>

        <div className="space-y-8">
          {/* 1. Histogram */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-800">1. Histogram</h3>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700">1.1 Histogram Home Goals</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={createHistogramData(analysis.homeFreq)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="goals" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700">1.2 Histogram Away Goals</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={createHistogramData(analysis.awayFreq)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="goals" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3 text-gray-700">1.3 Histogram Total Goals</h4>
              <div className="w-full lg:w-1/2">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={createHistogramData(analysis.totalFreq)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="goals" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 2. Ogive */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-800">2. Ogive (Kurva Frekuensi Kumulatif)</h3>
            <div className="w-full lg:w-1/2">
              <h4 className="text-lg font-medium mb-3 text-gray-700">2.1 Ogive Total Goals per Match</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={createCumulativeData(analysis.totalFreq)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="goals" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cumulative" stroke="#8884d8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Pie Chart */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-800">3. Diagram Lingkaran (Pie Chart)</h3>
            <div className="flex justify-center">
              <div>
                <h4 className="text-lg font-medium mb-3 text-gray-700 text-center">3.1 Distribusi Hasil Pertandingan (FTR)</h4>
                <ResponsiveContainer width={400} height={300}>
                  <PieChart>
                    <Pie data={createPieData()} cx="50%" cy="50%" labelLine={false} label={({ name, value, percent }) => `${name}: ${value} (${(percent || 0 * 100).toFixed(1)}%)`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {createPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-blue-800">C. Kesimpulan dari Masing-masing Analisis Data</h2>

        <div className="space-y-6">
          {/* 1. Kesimpulan Statistik Deskriptif */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">1. Kesimpulan Analisis Statistik Deskriptif</h3>
            <div className="ml-6 space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">1.1 Analisis Rata-rata (Mean):</h4>
                <p className="text-gray-700">
                  • Tim tuan rumah mencetak rata-rata <strong>{analysis.homeStats.mean.toFixed(2)} gol</strong> per pertandingan
                  <br />• Tim tandang mencetak rata-rata <strong>{analysis.awayStats.mean.toFixed(2)} gol</strong> per pertandingan
                  <br />• Total gol per pertandingan rata-rata <strong>{analysis.totalStats.mean.toFixed(2)} gol</strong>
                  <br />• {analysis.homeStats.mean > analysis.awayStats.mean ? "Tim tuan rumah memiliki keunggulan dalam mencetak gol (home advantage)" : "Tim tandang mengejutkan dengan rata-rata gol lebih tinggi"}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">1.2 Analisis Median:</h4>
                <p className="text-gray-700">
                  • Median gol tuan rumah: <strong>{analysis.homeStats.median} gol</strong>
                  <br />• Median gol tandang: <strong>{analysis.awayStats.median} gol</strong>
                  <br />• Median total gol: <strong>{analysis.totalStats.median} gol</strong>
                  <br />• Nilai median menunjukkan bahwa 50% pertandingan memiliki jumlah gol di bawah nilai tersebut
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">1.3 Analisis Modus (Mode):</h4>
                <p className="text-gray-700">
                  • Gol tuan rumah paling sering: <strong>{analysis.homeStats.mode} gol</strong>
                  <br />• Gol tandang paling sering: <strong>{analysis.awayStats.mode} gol</strong>
                  <br />• Total gol paling sering: <strong>{analysis.totalStats.mode} gol</strong>
                  <br />• Modus menunjukkan skor yang paling umum terjadi dalam pertandingan Premier League
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">1.4 Analisis Kuartil:</h4>
                <p className="text-gray-700">
                  • Q1 Total gol ({analysis.totalStats.q1}): 25% pertandingan memiliki {analysis.totalStats.q1} gol atau kurang
                  <br />• Q3 Total gol ({analysis.totalStats.q3}): 75% pertandingan memiliki {analysis.totalStats.q3} gol atau kurang
                  <br />• Rentang interkuartil menunjukkan variabilitas skor dalam Premier League
                </p>
              </div>
            </div>
          </div>

          {/* 2. Kesimpulan Visualisasi */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">2. Kesimpulan Analisis Visualisasi Data</h3>
            <div className="ml-6 space-y-3">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">2.1 Kesimpulan Histogram:</h4>
                <p className="text-gray-700">
                  • Distribusi gol menunjukkan pola khas sepak bola dengan skor rendah lebih umum
                  <br />
                  • Histogram menunjukkan sebagian besar pertandingan berakhir dengan 0-3 gol per tim
                  <br />• Distribusi cenderung positively skewed (ekor panjang ke kanan) yang menunjukkan adanya pertandingan dengan skor tinggi yang jarang terjadi
                </p>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-800 mb-2">2.2 Kesimpulan Ogive (Kurva Kumulatif):</h4>
                <p className="text-gray-700">
                  • Ogive menunjukkan akumulasi frekuensi total gol per pertandingan
                  <br />
                  • Kurva yang curam pada awal menunjukkan banyak pertandingan dengan skor rendah
                  <br />• Kurva yang mendatar di akhir menunjukkan pertandingan dengan skor tinggi sangat jarang
                </p>
              </div>

              <div className="bg-rose-50 p-4 rounded-lg">
                <h4 className="font-semibold text-rose-800 mb-2">2.3 Kesimpulan Diagram Lingkaran (FTR):</h4>
                <p className="text-gray-700">
                  • Kemenangan tuan rumah: <strong>{analysis.ftrPercentages.H}%</strong> ({analysis.ftrFreq.H || 0} pertandingan)
                  <br />• Hasil seri: <strong>{analysis.ftrPercentages.D}%</strong> ({analysis.ftrFreq.D || 0} pertandingan)
                  <br />• Kemenangan tandang: <strong>{analysis.ftrPercentages.A}%</strong> ({analysis.ftrFreq.A || 0} pertandingan)
                  <br />• {parseFloat(analysis.ftrPercentages.H) > parseFloat(analysis.ftrPercentages.A) ? "Data menunjukkan adanya home advantage yang signifikan dalam Premier League" : "Hasil menunjukkan kompetisi yang seimbang antara tim tuan rumah dan tandang"}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Kesimpulan Umum */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">3. Kesimpulan Umum</h3>
            <div className="ml-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Temuan Utama dari Analisis Premier League:</strong>
                  <br />
                  <br />• <strong>Home Advantage:</strong> Analisis menunjukkan adanya keunggulan bermain di kandang dengan rata-rata gol tuan rumah lebih tinggi dan persentase kemenangan yang lebih besar
                  <br />
                  <br />• <strong>Pola Skor:</strong> Sebagian besar pertandingan Premier League berakhir dengan skor moderat (1-4 total gol), yang mencerminkan sifat kompetitif dan defensive awareness dalam liga
                  <br />
                  <br />• <strong>Konsistensi Data:</strong> Nilai mean, median, dan mode yang relatif berdekatan menunjukkan distribusi data yang cukup normal tanpa outlier ekstrem
                  <br />
                  <br />• <strong>Implikasi:</strong> Data ini dapat digunakan untuk analisis prediktif, strategi taruhan, dan pemahaman pola permainan dalam Premier League
                  <br />
                  <br />• <strong>Rekomendasi:</strong> Untuk analisis yang lebih komprehensif, disarankan untuk menganalisis data selama beberapa musim dan mempertimbangkan faktor eksternal seperti cuaca, kondisi pemain, dan jadwal pertandingan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremierLeagueAnalysis;
