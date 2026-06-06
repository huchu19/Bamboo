type EquityChartProps = {
  raised: number;
  equityOffered?: number;
  size?: number;
};

export function EquityChart({ raised, equityOffered = 12, size = 180 }: EquityChartProps) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const raisedDash = (raised / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${raisedDash} ${circumference - raisedDash}`}
        />
        {/* gold tick at current progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--gold)"
          strokeWidth={stroke + 2}
          strokeLinecap="butt"
          strokeDasharray={`2 ${circumference - 2}`}
          strokeDashoffset={-raisedDash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Raised
        </p>
        <p className="font-display text-4xl tracking-tighter leading-none mt-1">{raised}%</p>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--gold)] mt-2">
          {equityOffered}% equity
        </p>
      </div>
    </div>
  );
}

type TractionSparkProps = {
  data: number[];
  height?: number;
  width?: number;
};

export function TractionSpark({ data, height = 48, width = 200 }: TractionSparkProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`)
    .join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#spark-fill)" />
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(data.length - 1) * stepX}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill="var(--gold)"
      />
    </svg>
  );
}
