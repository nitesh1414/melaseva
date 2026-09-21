const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  
  const page = await browser.newPage();
  
  const htmlPath = path.join(__dirname, 'Mela_Seva_Pitch_LIVEpro.html');
  const fileUrl = `file://${htmlPath}`;
  
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Wait for images to load
  await page.waitForFunction(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).every(img => img.complete);
  }, { timeout: 10000 }).catch(() => {});
  
  // Generate PDF
  const pdfPath = path.join(__dirname, 'Mela_Seva_Pitch_LIVEpro.pdf');
  await page.pdf({
    path: pdfPath,
    width: '1280px',
    height: '720px',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  
  console.log(`✅ PDF saved to: ${pdfPath}`);
  
  await browser.close();
})();
