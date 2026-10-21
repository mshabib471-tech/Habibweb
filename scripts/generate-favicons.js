const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 512x512 SVG of the Habib iFix Official Logo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0b1329"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>

    <!-- Neon Stroke Gradient -->
    <linearGradient id="neonH" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="45%" stop-color="#818cf8"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>

    <!-- Outer Border Glow Gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>

    <!-- Filter for Glow Effect -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Base Rounded Container with dark background -->
  <rect width="512" height="512" rx="116" fill="url(#bgGrad)"/>
  <rect x="8" y="8" width="496" height="496" rx="108" fill="none" stroke="url(#borderGrad)" stroke-width="12" opacity="0.85"/>

  <!-- Glow Underlay of the Circuit H -->
  <g filter="url(#glow)" opacity="0.7">
    <path d="M140 108 V404 M372 108 V404 M140 256 H372" stroke="url(#neonH)" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Sharp Main H Circuit Lines -->
  <g>
    <path d="M140 108 V404 M372 108 V404 M140 256 H372" stroke="url(#neonH)" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Tech Terminal Circuit Nodes (Cyan and Violet Dots) -->
  <!-- Top Left -->
  <circle cx="140" cy="108" r="28" fill="#020617" stroke="#38bdf8" stroke-width="10"/>
  <circle cx="140" cy="108" r="14" fill="#38bdf8"/>

  <!-- Bottom Left -->
  <circle cx="140" cy="404" r="28" fill="#020617" stroke="#38bdf8" stroke-width="10"/>
  <circle cx="140" cy="404" r="14" fill="#38bdf8"/>

  <!-- Top Right -->
  <circle cx="372" cy="108" r="28" fill="#020617" stroke="#c084fc" stroke-width="10"/>
  <circle cx="372" cy="108" r="14" fill="#c084fc"/>

  <!-- Bottom Right -->
  <circle cx="372" cy="404" r="28" fill="#020617" stroke="#818cf8" stroke-width="10"/>
  <circle cx="372" cy="404" r="14" fill="#818cf8"/>

  <!-- Center Heart Node -->
  <circle cx="256" cy="256" r="32" fill="#020617" stroke="#38bdf8" stroke-width="10"/>
  <circle cx="256" cy="256" r="16" fill="#ffffff"/>
</svg>`;

async function run() {
  const rootDir = path.resolve(__dirname, '..');
  const svgPath = path.join(rootDir, 'favicon.svg');
  const publicSvgPath = path.join(rootDir, 'public', 'favicon.svg');

  if (!fs.existsSync(path.join(rootDir, 'public'))) {
    fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });
  }

  fs.writeFileSync(svgPath, svgContent, 'utf8');
  fs.writeFileSync(publicSvgPath, svgContent, 'utf8');
  console.log('Saved favicon.svg in root and public');

  const svgBuffer = Buffer.from(svgContent);

  const sizes = [
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-96x96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'logo.png', size: 512 },
    { name: 'favicon-512x512.png', size: 512 },
  ];

  for (const s of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(s.size, s.size)
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(rootDir, s.name), pngBuffer);
    fs.writeFileSync(path.join(rootDir, 'public', s.name), pngBuffer);
    console.log(`Generated ${s.name} (${s.size}x${s.size})`);
  }

  // Create favicon.ico from 48x48 png buffer
  const ico48Buffer = await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toBuffer();

  // Simple standard ICO container for PNG
  // Header: 2 bytes reserved (0), 2 bytes type (1 for icon), 2 bytes count (1)
  // Entry: 1 byte width (48), 1 byte height (48), 1 byte color palette (0), 1 byte reserved (0)
  //        2 bytes planes (1), 2 bytes bpp (32), 4 bytes size, 4 bytes offset (6 + 16 = 22)
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // type 1 = ICO
  icoHeader.writeUInt16LE(1, 4); // count 1 image

  icoHeader.writeUInt8(48, 6); // width 48
  icoHeader.writeUInt8(48, 7); // height 48
  icoHeader.writeUInt8(0, 8); // color palette
  icoHeader.writeUInt8(0, 9); // reserved
  icoHeader.writeUInt16LE(1, 10); // color planes
  icoHeader.writeUInt16LE(32, 12); // bits per pixel
  icoHeader.writeUInt32LE(ico48Buffer.length, 14); // image size
  icoHeader.writeUInt32LE(22, 18); // image offset

  const icoBuffer = Buffer.concat([icoHeader, ico48Buffer]);
  fs.writeFileSync(path.join(rootDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(rootDir, 'public', 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico successfully');
}

run().catch(console.error);
