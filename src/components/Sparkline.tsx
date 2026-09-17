import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showTrend?: boolean;
  strokeWidth?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 90,
  height = 28,
  color = '#2563eb',
  showTrend = false,
  strokeWidth = 2
}) => {
  if (!data || data.length === 0) {
    return <span className="text-xs text-slate-400 italic">—</span>;
  }

  if (data.length === 1) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-slate-700">{data[0]}%</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 3;
  const effectiveHeight = height - padding * 2;
  const effectiveWidth = width - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * effectiveWidth;
    const y = height - padding - ((val - min) / range) * effectiveHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  const isUp = data[data.length - 1] >= data[0];
  const delta = Math.round((data[data.length - 1] - data[0]) * 10) / 10;
  const gradId = `sparkline-grad-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className="inline-flex items-center gap-1.5">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Shaded area */}
        <path d={areaD} fill={`url(#${gradId})`} />

        {/* Stroke line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Latest point indicator */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={color}
          className="animate-pulse"
        />
      </svg>

      {showTrend && (
        <span
          className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
            isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {isUp ? '+' : ''}
          {delta}%
        </span>
      )}
    </div>
  );
};
