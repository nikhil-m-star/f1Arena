function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hashString(value: string) {
  return Array.from(value).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 7);
}

function trackPath(seed: number) {
  const points = Array.from({ length: 9 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 9 + (seed % 18) / 10;
    const radiusX = 210 + ((seed >> (index % 8)) % 64);
    const radiusY = 92 + ((seed >> ((index + 3) % 8)) % 42);
    const x = 400 + Math.cos(angle) * radiusX;
    const y = 230 + Math.sin(angle) * radiusY;
    return `${Math.round(x)},${Math.round(y)}`;
  });

  return `M ${points.join(" L ")} Z`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const race = searchParams.get("race") || "Grand Prix";
  const circuit = searchParams.get("circuit") || "Formula 1 Circuit";
  const seed = hashString(`${race}-${circuit}`);
  const hue = seed % 360;
  const accent = `hsl(${hue}, 86%, 56%)`;
  const secondary = `hsl(${(hue + 132) % 360}, 82%, 52%)`;
  const path = trackPath(seed);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="${escapeSvg(race)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#09090b"/>
      <stop offset="0.52" stop-color="#18181b"/>
      <stop offset="1" stop-color="#050505"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="38%" r="55%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.4"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse">
      <path d="M 52 0 L 0 0 0 52" fill="none" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)"/>
  <rect width="1200" height="675" fill="url(#glow)"/>
  <path d="${path}" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${path}" fill="none" stroke="${accent}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${path}" fill="none" stroke="${secondary}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="28 24"/>
  <g transform="translate(78 86)">
    <rect x="0" y="0" width="116" height="8" fill="#e10600"/>
    <text x="0" y="62" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="900">${escapeSvg(race.toUpperCase())}</text>
    <text x="0" y="108" fill="#d4d4d8" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">${escapeSvg(circuit)}</text>
  </g>
  <g transform="translate(78 548)">
    <text fill="#71717a" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">F1 ARENA</text>
    <rect x="0" y="24" width="230" height="5" fill="${accent}"/>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
