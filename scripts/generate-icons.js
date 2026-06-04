import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const SVG_PATH = path.join(PUBLIC_DIR, 'logo.svg');

function pngsToIco(pngBuffers, sizes) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: Icon
  header.writeUInt16LE(pngBuffers.length, 4); // Count

  const dirs = [];
  let currentOffset = 6 + 16 * pngBuffers.length;

  for (let i = 0; i < pngBuffers.length; i++) {
    const png = pngBuffers[i];
    const size = sizes[i];

    const dir = Buffer.alloc(16);
    dir.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    dir.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    dir.writeUInt8(0, 2); // Color count
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Planes
    dir.writeUInt16LE(32, 6); // Bit count
    dir.writeUInt32LE(png.length, 8); // Size of image data
    dir.writeUInt32LE(currentOffset, 12); // Offset

    dirs.push(dir);
    currentOffset += png.length;
  }

  return Buffer.concat([header, ...dirs, ...pngBuffers]);
}

async function main() {
  try {
    console.log('Generating images from SVG...');

    // 1. Generate logo192.png (192x192)
    await sharp(SVG_PATH)
      .resize(192, 192)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'logo192.png'));
    console.log('Generated logo192.png');

    // 2. Generate logo512.png (512x512)
    await sharp(SVG_PATH)
      .resize(512, 512)
      .png()
      .toFile(path.join(PUBLIC_DIR, 'logo512.png'));
    console.log('Generated logo512.png');

    // 3. Generate icon sizes for favicon.ico
    const sizes = [16, 32, 48];
    const pngBuffers = [];
    for (const size of sizes) {
      const buffer = await sharp(SVG_PATH)
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
    }

    const icoBuffer = pngsToIco(pngBuffers, sizes);
    fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
    console.log('Generated favicon.ico with sizes 16, 32, 48');

    console.log('All icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons:', err);
    process.exit(1);
  }
}

main();
