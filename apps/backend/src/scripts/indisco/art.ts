import sharp from "sharp"

/**
 * Generates clean, brand-neutral product illustrations (800x800 PNG) for the
 * seed catalog. They stand in for real photography, which the store owner can
 * upload from the admin later.
 */

export type Shape =
  | "bag"
  | "bottle"
  | "can"
  | "box"
  | "jar"
  | "tray"
  | "round"
  | "long"
  | "pineapple"
  | "beaker"
  | "flask"
  | "tubes"
  | "dish"
  | "microscope"
  | "scale"
  | "goggles"
  | "coat"
  | "plate"

export type ArtSpec = {
  name: string
  size: string
  shape: Shape
  /** Main colour of the pack or object. */
  color: string
  /** Soft background tint. */
  tint: string
}

/** Tall objects drawn near the bottom edge are lifted so their label fits. */
const RAISED_SHAPES = new Set<Shape>([
  "beaker",
  "flask",
  "tubes",
  "microscope",
  "coat",
])

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

function darken(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 255) - amount)
  const g = Math.max(0, ((n >> 8) & 255) - amount)
  const b = Math.max(0, (n & 255) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

function wrap(name: string, maxChars: number, maxLines: number) {
  const words = name.split(" ")
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    if (!current) {
      current = word
    } else if ((current + " " + word).length <= maxChars) {
      current += " " + word
    } else {
      lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = kept[maxLines - 1] + "..."
    return kept
  }
  return lines
}

/** A white label with the product name and size, centred at (cx, cy). */
function label(
  cx: number,
  cy: number,
  width: number,
  spec: ArtSpec,
  accent: string
) {
  const lines = wrap(spec.name, Math.max(8, Math.floor(width / 17)), 3)
  const lineHeight = 36
  const height = lines.length * lineHeight + 70
  const pillWidth = Math.min(width - 20, Math.max(104, spec.size.length * 12 + 36))
  const top = cy - height / 2
  const text = lines
    .map(
      (line, i) =>
        `<text x="${cx}" y="${top + 44 + i * lineHeight}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="#1f2937">${escapeXml(line)}</text>`
    )
    .join("")
  return `
    <rect x="${cx - width / 2}" y="${top}" width="${width}" height="${height}" rx="18" fill="#ffffff" opacity="0.96"/>
    ${text}
    <rect x="${cx - pillWidth / 2}" y="${top + height - 46}" width="${pillWidth}" height="32" rx="16" fill="${accent}"/>
    <text x="${cx}" y="${top + height - 23}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">${escapeXml(spec.size)}</text>`
}

function shapeSvg(spec: ArtSpec): string {
  const c = spec.color
  const dark = darken(c, 45)
  const light = darken(c, -40)

  switch (spec.shape) {
    case "bag":
      return `
        <path d="M230 190 l20 -26 l20 26 l20 -26 l20 26 l20 -26 l20 26 l20 -26 l20 26 l20 -26 l20 26 l20 -26 l20 26 L570 650 Q570 672 548 672 L252 672 Q230 672 230 650 Z" fill="${c}"/>
        <path d="M230 190 L570 190 L570 232 L230 232 Z" fill="${dark}" opacity="0.35"/>
        <path d="M500 232 L570 232 L570 650 Q570 672 548 672 L500 672 Z" fill="${dark}" opacity="0.25"/>
        ${label(400, 440, 270, spec, dark)}`
    case "bottle":
      return `
        <rect x="362" y="104" width="76" height="52" rx="10" fill="${dark}"/>
        <path d="M372 156 L428 156 L428 230 Q500 262 500 330 L500 640 Q500 676 464 676 L336 676 Q300 676 300 640 L300 330 Q300 262 372 230 Z" fill="${c}"/>
        <path d="M440 240 Q500 268 500 330 L500 640 Q500 676 464 676 L440 676 Z" fill="${dark}" opacity="0.28"/>
        <path d="M322 330 Q322 290 352 270" stroke="#ffffff" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.4"/>
        ${label(400, 480, 190, spec, dark)}`
    case "can":
      return `
        <rect x="262" y="214" width="276" height="430" fill="${c}"/>
        <ellipse cx="400" cy="644" rx="138" ry="30" fill="${c}"/>
        <ellipse cx="400" cy="214" rx="138" ry="30" fill="${light}"/>
        <ellipse cx="400" cy="214" rx="100" ry="18" fill="${dark}" opacity="0.35"/>
        <rect x="470" y="214" width="68" height="430" fill="${dark}" opacity="0.22"/>
        ${label(400, 430, 220, spec, dark)}`
    case "box":
      return `
        <path d="M238 232 L520 232 L520 664 L238 664 Z" fill="${c}"/>
        <path d="M520 232 L580 196 L580 628 L520 664 Z" fill="${dark}"/>
        <path d="M238 232 L298 196 L580 196 L520 232 Z" fill="${light}"/>
        ${label(379, 448, 220, spec, dark)}`
    case "jar":
      return `
        <rect x="318" y="140" width="164" height="70" rx="14" fill="${dark}"/>
        <rect x="294" y="210" width="212" height="446" rx="42" fill="${c}"/>
        <path d="M450 210 L464 210 Q506 210 506 252 L506 614 Q506 656 464 656 L450 656 Z" fill="${dark}" opacity="0.25"/>
        ${label(400, 440, 190, spec, dark)}`
    case "tray":
      return `
        <path d="M170 380 L630 380 L586 600 Q580 628 552 628 L248 628 Q220 628 214 600 Z" fill="${c}"/>
        <path d="M170 380 L630 380 L624 410 L176 410 Z" fill="${dark}" opacity="0.35"/>
        ${[0, 1, 2, 3, 4, 5]
          .map((i) => {
            const x = 232 + (i % 3) * 168
            const y = i < 3 ? 346 : 440
            return `<ellipse cx="${x}" cy="${y}" rx="62" ry="78" fill="#fff7e6" stroke="#e8d4a8" stroke-width="4"/><ellipse cx="${x - 18}" cy="${y - 26}" rx="14" ry="22" fill="#ffffff" opacity="0.7"/>`
          })
          .join("")}
        ${label(400, 640, 300, spec, dark)}`
    case "round":
      return `
        ${[
          [310, 400, 120],
          [490, 400, 120],
          [400, 290, 115],
          [400, 500, 118],
        ]
          .map(
            ([x, y, r]) =>
              `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 4}" fill="#ffffff" opacity="0.35"/><path d="M${x - 14} ${y - r + 4} q14 -26 28 0" stroke="#15803d" stroke-width="10" fill="none" stroke-linecap="round"/>`
          )
          .join("")}
        ${label(400, 660, 300, spec, dark)}`
    case "long":
      return `
        ${[
          [-18, 0],
          [0, 36],
          [18, 72],
        ]
          .map(
            ([rot, dy]) =>
              `<g transform="translate(400 ${380 + dy}) rotate(${rot})"><path d="M-210 0 Q-120 -90 40 -70 Q180 -52 220 30 Q150 14 20 20 Q-120 26 -210 0 Z" fill="${c}"/><path d="M-210 0 Q-120 -90 40 -70 Q180 -52 220 30" stroke="#ffffff" stroke-width="10" fill="none" opacity="0.35" stroke-linecap="round"/></g>`
          )
          .join("")}
        ${label(400, 640, 300, spec, dark)}`
    case "pineapple":
      return `
        <path d="M400 230 q-70 -80 -120 -90 q60 10 90 50 q-10 -80 30 -110 q40 30 30 110 q30 -40 90 -50 q-50 10 -120 90 Z" fill="#16a34a"/>
        <ellipse cx="400" cy="440" rx="150" ry="205" fill="${c}"/>
        <path d="M290 360 L510 520 M290 440 L510 600 M290 520 L420 620 M510 360 L290 520 M510 440 L290 600 M510 520 L380 620" stroke="${dark}" stroke-width="6" opacity="0.45"/>
        ${label(400, 660, 300, spec, dark)}`
    case "beaker":
      return `
        <path d="M290 190 L510 190 L510 220 L490 220 L490 620 Q490 660 450 660 L350 660 Q310 660 310 620 L310 220 L290 220 Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="8"/>
        <path d="M314 420 L486 420 L486 620 Q486 656 450 656 L350 656 Q314 656 314 620 Z" fill="${c}" opacity="0.85"/>
        ${[260, 330, 400, 470, 540]
          .map(
            (y, i) =>
              `<line x1="310" y1="${y}" x2="${i % 2 ? 350 : 370}" y2="${y}" stroke="#0369a1" stroke-width="5"/>`
          )
          .join("")}
        ${label(400, 740, 340, { ...spec, size: spec.size }, dark)}`
    case "flask":
      return `
        <path d="M360 150 L440 150 L440 150 L440 330 L560 600 Q578 660 520 664 L280 664 Q222 660 240 600 L360 330 Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="8"/>
        <path d="M312 470 L488 470 L552 606 Q566 650 520 654 L280 654 Q234 650 248 606 Z" fill="${c}" opacity="0.85"/>
        <rect x="346" y="128" width="108" height="28" rx="10" fill="${dark}"/>
        ${label(400, 740, 340, spec, dark)}`
    case "tubes":
      return `
        ${[0, 1, 2]
          .map((i) => {
            const x = 290 + i * 110
            const colors = [c, light, dark]
            return `<path d="M${x - 36} 170 L${x + 36} 170 L${x + 36} 590 Q${x + 36} 650 ${x} 650 Q${x - 36} 650 ${x - 36} 590 Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="7"/><path d="M${x - 32} 410 L${x + 32} 410 L${x + 32} 590 Q${x + 32} 646 ${x} 646 Q${x - 32} 646 ${x - 32} 590 Z" fill="${colors[i]}" opacity="0.85"/>`
          })
          .join("")}
        ${label(400, 740, 340, spec, dark)}`
    case "dish":
      return `
        <ellipse cx="400" cy="470" rx="250" ry="90" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="8"/>
        <ellipse cx="400" cy="460" rx="206" ry="68" fill="${c}" opacity="0.8"/>
        <ellipse cx="350" cy="446" rx="46" ry="14" fill="#ffffff" opacity="0.4"/>
        <ellipse cx="400" cy="400" rx="250" ry="90" fill="none" stroke="#7dd3fc" stroke-width="8" opacity="0.6"/>
        ${label(400, 690, 340, spec, dark)}`
    case "microscope":
      return `
        <path d="M250 640 L550 640 L550 676 L250 676 Z" fill="${dark}"/>
        <path d="M470 640 Q600 600 590 440 Q580 300 470 250" stroke="${c}" stroke-width="46" fill="none" stroke-linecap="round"/>
        <rect x="318" y="150" width="82" height="250" rx="22" transform="rotate(22 360 275)" fill="${dark}"/>
        <rect x="330" y="396" width="64" height="70" rx="12" transform="rotate(22 360 430)" fill="#475569"/>
        <rect x="280" y="540" width="230" height="30" rx="10" fill="${light}"/>
        <circle cx="520" cy="360" r="26" fill="#475569"/>
        ${label(400, 740, 340, spec, dark)}`
    case "scale":
      return `
        <path d="M200 520 L600 520 L640 640 L160 640 Z" fill="${c}"/>
        <rect x="160" y="640" width="480" height="38" rx="12" fill="${dark}"/>
        <rect x="270" y="548" width="260" height="62" rx="10" fill="#0f172a"/>
        <text x="400" y="596" text-anchor="middle" font-family="Courier New, monospace" font-size="44" fill="#4ade80">0.00 g</text>
        <ellipse cx="400" cy="480" rx="170" ry="34" fill="#cbd5e1"/>
        <ellipse cx="400" cy="470" rx="150" ry="24" fill="#e2e8f0"/>
        ${label(400, 280, 330, spec, dark)}`
    case "goggles":
      return `
        <path d="M150 400 Q150 300 260 300 L340 300 Q400 330 460 300 L540 300 Q650 300 650 400 L650 440 Q650 520 560 520 L500 520 Q440 520 440 470 Q400 440 360 470 Q360 520 300 520 L240 520 Q150 520 150 440 Z" fill="#e0f2fe" stroke="${c}" stroke-width="22" stroke-linejoin="round"/>
        <path d="M150 380 L90 380 M650 380 L710 380" stroke="${dark}" stroke-width="30" stroke-linecap="round"/>
        <path d="M210 350 Q260 330 300 350" stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.7"/>
        ${label(400, 660, 320, spec, dark)}`
    case "coat":
      return `
        <path d="M290 170 L350 150 L400 230 L450 150 L510 170 L640 280 L580 360 L540 330 L540 660 L260 660 L260 330 L220 360 L160 280 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="8" stroke-linejoin="round"/>
        <path d="M350 150 L400 230 L450 150" fill="none" stroke="#cbd5e1" stroke-width="8"/>
        <rect x="290" y="480" width="80" height="70" rx="8" fill="none" stroke="#cbd5e1" stroke-width="6"/>
        <rect x="430" y="480" width="80" height="70" rx="8" fill="none" stroke="#cbd5e1" stroke-width="6"/>
        <rect x="378" y="260" width="12" height="320" fill="#e2e8f0"/>
        <circle cx="384" cy="330" r="9" fill="${c}"/><circle cx="384" cy="410" r="9" fill="${c}"/><circle cx="384" cy="490" r="9" fill="${c}"/>
        ${label(400, 740, 340, spec, dark)}`
    case "plate":
      return `
        <rect x="170" y="440" width="460" height="220" rx="28" fill="${c}"/>
        <rect x="170" y="440" width="460" height="46" rx="20" fill="${dark}"/>
        <ellipse cx="400" cy="440" rx="190" ry="44" fill="#cbd5e1"/>
        <ellipse cx="400" cy="432" rx="160" ry="30" fill="#94a3b8"/>
        <circle cx="260" cy="570" r="24" fill="#ffffff" opacity="0.85"/><circle cx="540" cy="570" r="24" fill="#ffffff" opacity="0.85"/>
        <rect x="300" y="540" width="200" height="40" rx="8" fill="#0f172a"/>
        <text x="400" y="572" text-anchor="middle" font-family="Courier New, monospace" font-size="28" fill="#4ade80">37.0 C</text>
        ${label(400, 240, 330, spec, dark)}`
  }
}

export async function renderProductImage(spec: ArtSpec): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs>
      <radialGradient id="bg" cx="50%" cy="42%" r="75%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="${spec.tint}"/>
      </radialGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bg)"/>
    <ellipse cx="400" cy="700" rx="230" ry="26" fill="#000000" opacity="0.08"/>
    <g transform="translate(0 ${RAISED_SHAPES.has(spec.shape) ? -60 : 0})">${shapeSvg(spec)}</g>
    <g transform="translate(34 34)">
      <rect width="150" height="40" rx="20" fill="#1a5490"/>
      <text x="75" y="27" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" font-weight="bold" fill="#ffb05c">INDISCO</text>
    </g>
  </svg>`

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}
