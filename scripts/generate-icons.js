const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate icons for each size
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}.png`);

    try {
      await sharp(inputSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({
          quality: 100,
          compressionLevel: 9
        })
        .toFile(outputPath);

      console.log(`✅ Generated icon-${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating icon-${size}.png:`, error.message);
    }
  }

  // Generate Apple Touch Icon (180x180)
  const appleIconPath = path.join(outputDir, 'apple-icon.png');
  try {
    await sharp(inputSvg)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 100,
        compressionLevel: 9
      })
      .toFile(appleIconPath);

    console.log('✅ Generated apple-icon.png');
  } catch (error) {
    console.error('❌ Error generating apple-icon.png:', error.message);
  }

  // Generate favicon (32x32)
  const faviconPath = path.join(outputDir, 'favicon.png');
  try {
    await sharp(inputSvg)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 100,
        compressionLevel: 9
      })
      .toFile(faviconPath);

    console.log('✅ Generated favicon.png');
  } catch (error) {
    console.error('❌ Error generating favicon.png:', error.message);
  }

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
