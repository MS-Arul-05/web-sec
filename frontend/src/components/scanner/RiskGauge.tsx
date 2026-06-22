import '@/lib/charts';
import { Doughnut } from 'react-chartjs-2';
import type { RiskLevel } from '@/types';

const COLORS: Record<RiskLevel, string> = {
  Safe: '#22c55e',
  Moderate: '#f59e0b',
  'High Risk': '#ef4444',
  Unknown: '#64748b',
};

export function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const color = COLORS[level];
  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [color, 'rgba(255,255,255,0.06)'],
        borderWidth: 0,
        circumference: 270,
        rotation: 225,
      },
    ],
  };
  const options = {
    cutout: '78%',
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    maintainAspectRatio: false,
  };

  return (
    <div className="relative h-48 w-48">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs uppercase tracking-wider text-slate-400">/ 100</span>
        <span className="mt-1 text-sm font-semibold" style={{ color }}>
          {level}
        </span>
      </div>
    </div>
  );
}
