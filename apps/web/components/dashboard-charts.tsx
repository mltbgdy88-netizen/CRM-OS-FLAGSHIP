'use client';

import { useEffect, useId, useMemo, useState, type MouseEvent } from 'react';

type ChartTone = 'orange' | 'blue' | 'green' | 'purple';

const TONE_STROKES: Record<ChartTone, string> = {
  orange: '#ff6a00',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
};

const TONE_FILLS: Record<ChartTone, string> = {
  orange: 'rgba(255, 106, 0, 0.22)',
  blue: 'rgba(59, 130, 246, 0.22)',
  green: 'rgba(34, 197, 94, 0.22)',
  purple: 'rgba(168, 85, 247, 0.22)',
};

function scalePoints(values: number[], width: number, height: number, pad = 4) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value, index) => ({
    x: pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2),
    y: pad + (1 - (value - min) / range) * (height - pad * 2),
  }));
}

function smoothLinePath(points: { x: number; y: number }[]) {
  if (points.length === 0) {
    return '';
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

interface SparklineChartProps {
  values: number[];
  tone: ChartTone;
  className?: string;
}

export function SparklineChart({ values, tone, className = '' }: SparklineChartProps) {
  const gradientId = useId();
  const width = 128;
  const height = 52;
  const points = useMemo(() => scalePoints(values, width, height, 3), [values]);
  const linePath = smoothLinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      className={`dashboard-sparkline ${className}`.trim()}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TONE_FILLS[tone]} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} className="dashboard-sparkline__area" />
      <path
        d={linePath}
        fill="none"
        stroke={TONE_STROKES[tone]}
        strokeWidth="2"
        strokeLinecap="round"
        className="dashboard-sparkline__line"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="3.5"
        fill={TONE_STROKES[tone]}
        className="dashboard-sparkline__dot"
      />
    </svg>
  );
}

export interface RevenueMonth {
  month: string;
  value: number;
}

interface RevenueAreaChartProps {
  data: RevenueMonth[];
}

function formatMillions(value: number) {
  return `₺${value.toFixed(1)}M`;
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  const fillGradientId = useId();
  const lineGradientId = useId();
  const [activeIndex, setActiveIndex] = useState(data.length - 1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const width = 720;
  const height = 220;
  const padLeft = 48;
  const padRight = 16;
  const padTop = 12;
  const padBottom = 28;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const values = data.map((d) => d.value);
  const min = Math.min(...values) * 0.92;
  const max = Math.max(...values) * 1.04;
  const range = max - min || 1;

  const points = data.map((item, index) => ({
    x: padLeft + (index / Math.max(data.length - 1, 1)) * chartW,
    y: padTop + (1 - (item.value - min) / range) * chartH,
    value: item.value,
    month: item.month,
  }));

  const linePath = smoothLinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;
  const active = points[activeIndex] ?? points[points.length - 1];

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padTop + t * chartH,
    label: formatMillions(max - t * range),
  }));

  function handlePointerMove(event: MouseEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const index = Math.round(ratio * (data.length - 1));
    setActiveIndex(index);
  }

  return (
    <div className="dashboard-chart-pro" data-testid="dashboard-revenue-chart">
      <div className="dashboard-chart-pro__tooltip" aria-live="polite">
        <span className="dashboard-chart-pro__tooltip-month">{active.month} 2026</span>
        <strong className="dashboard-chart-pro__tooltip-value">{formatMillions(active.value)}</strong>
        <span className="dashboard-chart-pro__tooltip-delta">+12.5% geçen aya göre</span>
      </div>
      <svg
        className={`dashboard-chart-pro__svg${mounted ? ' dashboard-chart-pro__svg--mounted' : ''}`}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handlePointerMove}
        onMouseLeave={() => setActiveIndex(data.length - 1)}
      >
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.42)" />
            <stop offset="55%" stopColor="rgba(255, 106, 0, 0.12)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
          </linearGradient>
          <linearGradient id={lineGradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ff6a00" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick.label}>
            <line
              x1={padLeft}
              y1={tick.y}
              x2={width - padRight}
              y2={tick.y}
              className="dashboard-chart-pro__grid"
            />
            <text x={padLeft - 8} y={tick.y + 4} className="dashboard-chart-pro__axis-y" textAnchor="end">
              {tick.label}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${fillGradientId})`} className="dashboard-chart-pro__area" />
        <path
          d={linePath}
          fill="none"
          stroke={`url(#${lineGradientId})`}
          strokeWidth="2.75"
          strokeLinecap="round"
          className="dashboard-chart-pro__line"
        />

        <line
          x1={active.x}
          y1={padTop}
          x2={active.x}
          y2={padTop + chartH}
          className="dashboard-chart-pro__cursor"
        />

        {points.map((point, index) => (
          <circle
            key={point.month}
            cx={point.x}
            cy={point.y}
            r={index === activeIndex ? 5 : 3}
            className={
              index === activeIndex
                ? 'dashboard-chart-pro__point dashboard-chart-pro__point--active'
                : 'dashboard-chart-pro__point'
            }
          />
        ))}

        {data.map((item, index) => (
          <text
            key={item.month}
            x={points[index].x}
            y={height - 6}
            className="dashboard-chart-pro__axis-x"
            textAnchor="middle"
          >
            {item.month}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function useAnimatedMetric(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

export function formatCurrencyShort(amount: number) {
  if (amount >= 1_000_000) {
    return `₺${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₺${Math.round(amount / 1_000)}K`;
  }
  return `₺${Math.round(amount)}`;
}
