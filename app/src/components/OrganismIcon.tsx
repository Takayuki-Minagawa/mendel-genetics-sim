import { useId } from 'react';
import type { Gene } from '../types/genetics';

interface Props {
  genes: Gene[];
  phenotypeIds: string[];
  size?: number;
  className?: string;
  title?: string;
}

function wrinkledPath(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2;
    const rr = r * (1 + 0.07 * Math.sin(th * 7) + 0.04 * Math.sin(th * 13 + 1));
    points.push(`${(cx + rr * Math.cos(th)).toFixed(2)},${(cy + rr * Math.sin(th)).toFixed(2)}`);
  }
  return `M${points.join('L')}Z`;
}

const WRINKLED = wrinkledPath(50, 52, 36);

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) + amount);
  const g = clamp(((n >> 8) & 255) + amount);
  const b = clamp((n & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default function OrganismIcon({ genes, phenotypeIds, size = 40, className, title }: Props) {
  const uid = useId().replace(/:/g, '');
  const traitPheno = (trait: string) => {
    const idx = genes.findIndex((g) => g.trait === trait);
    if (idx === -1) return undefined;
    return genes[idx].phenotypes[phenotypeIds[idx]];
  };

  const lethal = genes.some((g, i) => g.phenotypes[phenotypeIds[i]]?.lethal);
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 100 100',
    className,
    role: 'img' as const,
    'aria-label': title,
  };

  if (lethal) {
    return (
      <svg {...common}>
        {title && <title>{title}</title>}
        <circle cx="50" cy="52" r="34" fill="none" stroke="#9CA3AF" strokeWidth="4" strokeDasharray="8 6" />
        <path d="M34 36 L66 68 M66 36 L34 68" stroke="#9CA3AF" strokeWidth="7" strokeLinecap="round" />
      </svg>
    );
  }

  const seedColor = traitPheno('seedColor');
  const seedShape = traitPheno('seedShape');
  if (seedColor || seedShape) {
    const base = seedColor?.color ?? '#C9C46B';
    const wrinkled = seedShape?.id === 'wrinkled';
    return (
      <svg {...common}>
        {title && <title>{title}</title>}
        <defs>
          <radialGradient id={`pea-${uid}`} cx="38%" cy="34%" r="70%">
            <stop offset="0%" stopColor={shade(base, 70)} />
            <stop offset="55%" stopColor={base} />
            <stop offset="100%" stopColor={shade(base, -60)} />
          </radialGradient>
        </defs>
        <ellipse cx="52" cy="90" rx="26" ry="5" fill="#000" opacity="0.12" />
        {wrinkled ? (
          <>
            <path d={WRINKLED} fill={`url(#pea-${uid})`} stroke={shade(base, -70)} strokeWidth="2" />
            <path
              d="M30 44 Q40 38 46 48 M54 30 Q60 42 52 52 M58 62 Q68 58 74 66 M34 64 Q42 60 46 70"
              fill="none"
              stroke={shade(base, -55)}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </>
        ) : (
          <circle cx="50" cy="52" r="36" fill={`url(#pea-${uid})`} stroke={shade(base, -60)} strokeWidth="1.5" />
        )}
        <ellipse cx="38" cy="38" rx="9" ry="6" fill="#fff" opacity="0.45" transform="rotate(-30 38 38)" />
      </svg>
    );
  }

  const flower = traitPheno('flowerColor');
  if (flower) {
    const stroke = flower.id === 'white' ? '#CBD5E1' : shade(flower.color, -50);
    return (
      <svg {...common}>
        {title && <title>{title}</title>}
        <path d="M50 60 Q48 80 52 96" stroke="#4D9B3A" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="62" cy="84" rx="9" ry="4" fill="#5DAE3B" transform="rotate(-30 62 84)" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="50"
            cy="26"
            rx="15"
            ry="21"
            fill={flower.id === 'white' ? '#FFFFFF' : flower.color}
            stroke={stroke}
            strokeWidth="2"
            transform={`rotate(${deg} 50 46)`}
          />
        ))}
        <circle cx="50" cy="46" r="9" fill="#FCD34D" stroke="#D97706" strokeWidth="2" />
      </svg>
    );
  }

  const blood = traitPheno('bloodType');
  if (blood) {
    return (
      <svg {...common}>
        {title && <title>{title}</title>}
        <path
          d="M50 8 C50 8 18 46 18 64 A32 32 0 0 0 82 64 C82 46 50 8 50 8 Z"
          fill={blood.color}
          stroke={shade(blood.color, -50)}
          strokeWidth="2"
        />
        <ellipse cx="36" cy="58" rx="5" ry="9" fill="#fff" opacity="0.35" transform="rotate(20 36 58)" />
        <text
          x="50"
          y="77"
          textAnchor="middle"
          fontSize={blood.id === 'AB' ? 24 : 30}
          fontWeight="800"
          fill="#fff"
          fontFamily="system-ui, sans-serif"
        >
          {blood.id}
        </text>
      </svg>
    );
  }

  const fur = traitPheno('furColor');
  const furColor = fur?.color ?? '#8D8172';
  return (
    <svg {...common}>
      {title && <title>{title}</title>}
      <path d="M22 70 Q6 72 8 56 Q10 46 4 40" stroke="#E9A8A8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="66" rx="30" ry="22" fill={furColor} stroke={shade(furColor, -50)} strokeWidth="2" />
      <circle cx="74" cy="48" r="16" fill={furColor} stroke={shade(furColor, -50)} strokeWidth="2" />
      <circle cx="66" cy="32" r="9" fill={furColor} stroke={shade(furColor, -50)} strokeWidth="2" />
      <circle cx="66" cy="32" r="5" fill="#F4B6B6" />
      <circle cx="80" cy="44" r="3" fill="#1F2937" />
      <circle cx="89" cy="52" r="3" fill="#F28B8B" />
      <path d="M86 55 L97 52 M86 57 L96 60" stroke="#6B7280" strokeWidth="1.2" />
    </svg>
  );
}
