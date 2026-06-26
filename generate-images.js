const fs = require('fs');
const path = require('path');

const portfolioPath = path.join(__dirname, 'PortfolioImg');

function scanFolder(folderName) {
  const folderPath = path.join(portfolioPath, folderName);
  const images = [];
  
  try {
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
        const caption = path.basename(file, ext).replace(/[-_]/g, ' ');
        images.push({
          path: `PortfolioImg/${folderName}/${file}`,
          caption: caption.charAt(0).toUpperCase() + caption.slice(1)
        });
      }
    });
  } catch (err) {
    console.error(`Error reading ${folderName}:`, err.message);
  }
  
  return images;
}

const galleriesData = {
  pixelart: scanFolder('pixelart'),
  mspaint: scanFolder('mspaint')
};

const outputPath = path.join(__dirname, 'images.json');
fs.writeFileSync(outputPath, JSON.stringify(galleriesData, null, 2));
console.log('✓ images.json generated successfully!');
console.log(`Pixel Art images: ${galleriesData.pixelart.length}`);
console.log(`MS Paint images: ${galleriesData.mspaint.length}`);
