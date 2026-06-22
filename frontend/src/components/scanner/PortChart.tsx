import '@/lib/charts';
import { Bar } from 'react-chartjs-2';
import type { PortInfo } from '@/types';

export function PortChart({ ports }: { ports: PortInfo[] }) {
  if (ports.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">No open ports detected.</p>;
  }

  const data = {
    labels: ports.map((p) => `${p.port}`),
    datasets: [
      {
        label: 'Open Ports',
        data: ports.map(() => 1),
        backgroundColor: ports.map((p) => (p.risky ? '#ef4444' : '#6366f1')),
        borderRadius: 6,
      },
    ],
  };
  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: { dataIndex: number }[]) => {
            const p = ports[items[0].dataIndex];
            return `Port ${p.port} — ${p.service}`;
          },
          label: (item: { dataIndex: number }) => (ports[item.dataIndex].risky ? 'Risky / exposed' : 'Standard'),
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { display: false, max: 1.2 },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="h-56">
      <Bar data={data} options={options} />
    </div>
  );
}
