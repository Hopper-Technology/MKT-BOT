export function Donut({ value, total, color = "var(--green-600)", label }: { value: number; total: number; color?: string; label: string }) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="donut-wrap">
      <svg className="donut" viewBox="0 0 100 100" role="img" aria-label={`${label}: ${percent}%`}>
        <circle cx="50" cy="50" r={radius} className="donut-track" />
        <circle cx="50" cy="50" r={radius} className="donut-value" style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset: circumference * (1 - percent / 100) }} />
      </svg>
      <span><strong>{percent}%</strong><small>{label}</small></span>
    </div>
  );
}
