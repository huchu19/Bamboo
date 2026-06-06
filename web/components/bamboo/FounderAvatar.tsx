type FounderAvatarProps = {
  name: string;
  size?: number;
  className?: string;
};

const PALETTES = [
  "from-emerald-700 to-emerald-900",
  "from-amber-700 to-amber-900",
  "from-stone-700 to-stone-900",
  "from-rose-700 to-rose-900",
  "from-indigo-700 to-indigo-900",
  "from-teal-700 to-teal-900",
];

function paletteFor(name: string) {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTES[sum % PALETTES.length];
}

export function FounderAvatar({ name, size = 36, className = "" }: FounderAvatarProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = paletteFor(name);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${palette} text-white font-display tracking-tight ring-2 ring-[color:var(--card)] shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
