import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public');
const logoSvgPath = path.join(publicDir, 'logo.svg');
const logoSvg = fs.readFileSync(logoSvgPath);

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'logo-192x192.png', size: 192 },
  { name: 'logo-512x512.png', size: 512 },
];

async function generate() {
  for (const item of sizes) {
    const outPath = path.join(publicDir, item.name);
    await sharp(logoSvg)
      .resize(item.size, item.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`Created ${item.name} (${item.size}x${item.size})`);
  }

  // Create favicon.ico from 16x16 and 32x32
  const ico16 = await sharp(logoSvg).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(logoSvg).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico16);
  console.log('Created favicon.ico');

  console.log('\nAll favicon files generated successfully!');
}

generate().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
