const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches
pptx.author = 'LIVEpro Software Solutions';
pptx.company = 'LIVEpro Software Solutions';
pptx.subject = 'Mela Seva - Smart Event Management Platform - Project Pitch';
pptx.title = 'Mela Seva - Project Pitch by LIVEpro';

// Color constants
const PRIMARY = '1A365D';
const PRIMARY_LIGHT = '2563EB';
const ACCENT = 'F97316';
const SUCCESS = '10B981';
const DANGER = 'EF4444';
const DARK = '0F172A';
const GRAY = '475569';
const LIGHT_GRAY = 'F1F5F9';
const WHITE = 'FFFFFF';

// Helper: Add footer
function addFooter(slide) {
  slide.addShape('rect', { x: 0, y: 7.0, w: 13.33, h: 0.5, fill: { color: DARK } });
  slide.addText('LIVEpro Software Solutions', { x: 0.3, y: 7.05, w: 4, h: 0.4, fontSize: 9, color: ACCENT, fontFace: 'Arial', bold: true });
  slide.addText('Confidential | Mela Seva – Project Pitch', { x: 8, y: 7.05, w: 5, h: 0.4, fontSize: 8, color: '999999', fontFace: 'Arial', align: 'right' });
}

// Helper: Add accent bar
function addAccentBar(slide) {
  slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.06, fill: { color: PRIMARY_LIGHT } });
  slide.addShape('rect', { x: 0, y: 0.06, w: 13.33, h: 0.03, fill: { color: ACCENT } });
}

// Helper: Add section header
function addSectionHeader(slide, tag, title) {
  addAccentBar(slide);
  slide.addText(tag.toUpperCase(), { x: 0.7, y: 0.3, w: 3, h: 0.35, fontSize: 10, color: WHITE, fontFace: 'Arial', bold: true, fill: { color: ACCENT }, align: 'center', rectRadius: 0.05 });
  slide.addText(title, { x: 0.7, y: 0.75, w: 11, h: 0.6, fontSize: 28, color: DARK, fontFace: 'Arial', bold: true });
  slide.addShape('rect', { x: 0.7, y: 1.4, w: 0.8, h: 0.05, fill: { color: ACCENT }, rectRadius: 0.02 });
}

// Image helper
function imgPath(name) {
  const p = path.join(__dirname, 'images', name);
  if (fs.existsSync(p)) return { path: p };
  return null;
}

// ============ SLIDE 1: COVER ============
let slide = pptx.addSlide();
slide.background = { fill: PRIMARY };
// Gradient overlay
slide.addShape('rect', { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: PRIMARY, transparency: 0 } });

// Logo area
slide.addShape('roundRect', { x: 5.4, y: 0.8, w: 0.9, h: 0.9, fill: { color: ACCENT }, rectRadius: 0.15 });
slide.addText('L', { x: 5.4, y: 0.8, w: 0.9, h: 0.9, fontSize: 32, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });

slide.addText('LIVEpro Software Solutions', { x: 3.5, y: 1.9, w: 6.33, h: 0.5, fontSize: 22, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
slide.addText('Raghuji Nagar, Nagpur – 440024', { x: 3.5, y: 2.35, w: 6.33, h: 0.3, fontSize: 12, color: '94A3B8', fontFace: 'Arial', align: 'center' });

// Main title
slide.addText('MELA SEVA', { x: 1.5, y: 3.0, w: 10.33, h: 0.9, fontSize: 52, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
slide.addText('Smart Event Management Platform', { x: 1.5, y: 3.8, w: 10.33, h: 0.5, fontSize: 22, color: 'BFDBFE', fontFace: 'Arial', align: 'center' });

// Accent line
slide.addShape('rect', { x: 5.9, y: 4.5, w: 1.5, h: 0.05, fill: { color: ACCENT } });

// Subtitle
slide.addText('Geo-Tagged Asset Management  •  QR-Based Complaint System  •  GIS Smart Navigation', { x: 1.5, y: 4.8, w: 10.33, h: 0.4, fontSize: 14, color: 'CBD5E1', fontFace: 'Arial', align: 'center' });
slide.addText('A comprehensive digital solution for large-scale public events & temporary infrastructure', { x: 2.5, y: 5.2, w: 8.33, h: 0.35, fontSize: 11, color: '94A3B8', fontFace: 'Arial', italic: true, align: 'center' });

// Meta info
slide.addText('📅 Project Pitch Presentation    🔒 Confidential    📍 Nagpur, Maharashtra', { x: 2.5, y: 6.3, w: 8.33, h: 0.3, fontSize: 10, color: '64748B', fontFace: 'Arial', align: 'center' });
slide.addText('© 2026 LIVEpro Software Solutions. All Rights Reserved.', { x: 3.5, y: 6.9, w: 6.33, h: 0.3, fontSize: 8, color: '475569', fontFace: 'Arial', align: 'center' });

// ============ SLIDE 2: THE CHALLENGE ============
slide = pptx.addSlide();
addSectionHeader(slide, 'The Challenge', 'Why Mela Management Needs Digital Transformation');
addFooter(slide);

// Left: Image
const heroImg = imgPath('mela-aerial.jpg');
if (heroImg) {
  slide.addImage({ ...heroImg, x: 0.7, y: 1.7, w: 5.5, h: 3.2, rounding: true });
}
slide.addText('Large-scale events manage thousands of temporary electrical assets, serve lakhs of visitors daily, and require 24×7 monitoring — yet most operations still rely on manual processes.', { x: 0.7, y: 5.0, w: 5.5, h: 0.9, fontSize: 11, color: GRAY, fontFace: 'Arial', lineSpacingMultiple: 1.3 });

// Right: Pain points
slide.addShape('roundRect', { x: 6.8, y: 1.7, w: 5.8, h: 3.0, fill: { color: LIGHT_GRAY }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
slide.addText('⚠️  Current Pain Points', { x: 7.0, y: 1.85, w: 5.4, h: 0.4, fontSize: 14, color: DANGER, fontFace: 'Arial', bold: true });
const painPoints = [
  'No digital record of temporary assets (poles, wires, substations)',
  'Complaints reported verbally — no tracking or accountability',
  'No real-time visibility into complaint resolution status',
  'Citizens struggle to locate nearest hospitals, police, toilets',
  'SLA breaches go unnoticed until major escalation',
  'No data for post-event analysis & improvement',
];
painPoints.forEach((point, i) => {
  slide.addText(`•  ${point}`, { x: 7.0, y: 2.3 + (i * 0.35), w: 5.4, h: 0.35, fontSize: 10, color: '334155', fontFace: 'Arial' });
});

// Stats boxes
slide.addShape('roundRect', { x: 6.8, y: 5.0, w: 2.7, h: 1.2, fill: { color: PRIMARY }, rectRadius: 0.1 });
slide.addText('5000+', { x: 6.8, y: 5.1, w: 2.7, h: 0.6, fontSize: 28, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
slide.addText('Temporary Poles per Mela', { x: 6.8, y: 5.7, w: 2.7, h: 0.4, fontSize: 10, color: 'CBD5E1', fontFace: 'Arial', align: 'center' });

slide.addShape('roundRect', { x: 9.9, y: 5.0, w: 2.7, h: 1.2, fill: { color: PRIMARY }, rectRadius: 0.1 });
slide.addText('10L+', { x: 9.9, y: 5.1, w: 2.7, h: 0.6, fontSize: 28, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
slide.addText('Daily Visitors', { x: 9.9, y: 5.7, w: 2.7, h: 0.4, fontSize: 10, color: 'CBD5E1', fontFace: 'Arial', align: 'center' });

// ============ SLIDE 3: SOLUTION OVERVIEW ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Our Solution', 'Mela Seva — Complete Digital Platform');
addFooter(slide);

slide.addText('A unified, scalable platform connecting citizens, field staff, control room, and administration through QR codes, GIS mapping, and real-time communication.', { x: 0.7, y: 1.6, w: 11.9, h: 0.5, fontSize: 12, color: GRAY, fontFace: 'Arial', lineSpacingMultiple: 1.3 });

// 4 platform cards
const platforms = [
  { icon: '📱', title: 'Citizen App', desc: 'Scan QR → Report issues → Find facilities → Navigate — no login needed', color: 'DBEAFE' },
  { icon: '🎯', title: 'Control Room', desc: 'Real-time dashboard → Assign complaints → Monitor SLA → GIS maps', color: 'FEF3C7' },
  { icon: '👷', title: 'Field Staff App', desc: 'Receive assignments → Navigate → Resolve → Upload proof → Close', color: 'D1FAE5' },
  { icon: '📊', title: 'Admin Portal', desc: 'Asset management → User control → Reports → Configuration', color: 'EDE9FE' },
];
platforms.forEach((p, i) => {
  const x = 0.7 + (i * 3.1);
  slide.addShape('roundRect', { x: x, y: 2.3, w: 2.9, h: 2.0, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 }, shadow: { type: 'outer', blur: 4, offset: 2, color: '000000', opacity: 0.1 } });
  slide.addShape('roundRect', { x: x + 0.95, y: 2.5, w: 1.0, h: 1.0, fill: { color: p.color }, rectRadius: 0.15 });
  slide.addText(p.icon, { x: x + 0.95, y: 2.5, w: 1.0, h: 1.0, fontSize: 28, align: 'center', valign: 'middle' });
  slide.addText(p.title, { x: x + 0.1, y: 3.6, w: 2.7, h: 0.3, fontSize: 12, color: DARK, fontFace: 'Arial', bold: true, align: 'center' });
  slide.addText(p.desc, { x: x + 0.15, y: 3.9, w: 2.6, h: 0.4, fontSize: 9, color: GRAY, fontFace: 'Arial', align: 'center', lineSpacingMultiple: 1.2 });
});

// Stats bar
slide.addShape('roundRect', { x: 0.7, y: 4.6, w: 11.9, h: 1.2, fill: { color: LIGHT_GRAY }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
const stats = [
  { num: '12', label: 'Core Modules' },
  { num: '4', label: 'Platforms' },
  { num: '8', label: 'User Roles' },
  { num: '3', label: 'Languages' },
  { num: '24×7', label: 'Monitoring' },
];
stats.forEach((s, i) => {
  const x = 0.7 + (i * 2.4);
  slide.addText(s.num, { x: x, y: 4.7, w: 2.2, h: 0.5, fontSize: 22, color: PRIMARY, fontFace: 'Arial', bold: true, align: 'center' });
  slide.addText(s.label, { x: x, y: 5.2, w: 2.2, h: 0.35, fontSize: 10, color: GRAY, fontFace: 'Arial', align: 'center' });
});

// ============ SLIDE 4: KEY FEATURES ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Key Features', 'Comprehensive Feature Suite');
addFooter(slide);

const features = [
  ['GIS-Based Asset Survey', 'GPS-tagged mapping of every pole, wire, substation'],
  ['QR Code on Every Asset', 'Unique weatherproof QR stickers with pole#, road, sector'],
  ['Public Complaint Registration', 'Scan QR → auto-fill location → submit in 30 seconds'],
  ['Real-Time Control Room', 'Live dashboard with complaint feed, GIS map, assignment'],
  ['Smart Navigation Map', 'Find hospitals, police, toilets, parking, ghats — nearby'],
  ['SLA & Auto-Escalation', 'Timer-based SLA with automatic warning & escalation'],
  ['SMS Notifications', 'Automatic SMS at each stage of complaint lifecycle'],
  ['Field Officer Mobile App', 'Offline-capable app for resolution with GPS & photo proof'],
  ['MIS & Reporting', 'Department-wise, officer-wise reports with Excel/PDF export'],
  ['Multi-Event Scalable', 'Same platform for any event — configurable per event'],
  ['Multilingual Support', 'English, Hindi, Marathi — all UI, SMS, and reports'],
  ['Complete Audit Trail', 'Every action logged — who did what, when, from where'],
];

features.forEach((f, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.7 + (col * 4.1);
  const y = 1.7 + (row * 1.25);
  
  slide.addShape('roundRect', { x: x, y: y, w: 0.4, h: 0.4, fill: { color: PRIMARY_LIGHT }, rectRadius: 0.2 });
  slide.addText(`${i + 1}`, { x: x, y: y, w: 0.4, h: 0.4, fontSize: 12, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
  slide.addText(f[0], { x: x + 0.55, y: y - 0.02, w: 3.4, h: 0.3, fontSize: 11, color: DARK, fontFace: 'Arial', bold: true });
  slide.addText(f[1], { x: x + 0.55, y: y + 0.28, w: 3.4, h: 0.4, fontSize: 9, color: GRAY, fontFace: 'Arial', lineSpacingMultiple: 1.2 });
});

// ============ SLIDE 5: QR CODE WORKFLOW ============
slide = pptx.addSlide();
addSectionHeader(slide, 'QR Code System', 'End-to-End QR Code Lifecycle');
addFooter(slide);

const qrSteps = [
  { num: '1', icon: '📋', title: 'GIS Survey', desc: 'Surveyor captures GPS + photo of each pole' },
  { num: '2', icon: '🔢', title: 'Generate QR', desc: 'System generates unique QR linked to asset & GPS' },
  { num: '3', icon: '🖨️', title: 'Print Labels', desc: 'Weatherproof stickers with QR, pole#, road, sector' },
  { num: '4', icon: '📌', title: 'Apply to Pole', desc: 'Sticker applied at 5-6 ft height — visible & scannable' },
  { num: '5', icon: '📱', title: 'Citizen Scans', desc: 'Any phone camera opens complaint form with pre-filled data' },
];

qrSteps.forEach((s, i) => {
  const x = 0.7 + (i * 2.5);
  slide.addShape('roundRect', { x: x, y: 1.7, w: 2.3, h: 2.2, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 }, shadow: { type: 'outer', blur: 3, offset: 1, color: '000000', opacity: 0.08 } });
  slide.addShape('roundRect', { x: x + 0.75, y: 1.55, w: 0.8, h: 0.35, fill: { color: ACCENT }, rectRadius: 0.15 });
  slide.addText(s.num, { x: x + 0.75, y: 1.55, w: 0.8, h: 0.35, fontSize: 14, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
  slide.addText(s.icon, { x: x, y: 2.0, w: 2.3, h: 0.6, fontSize: 28, align: 'center' });
  slide.addText(s.title, { x: x + 0.1, y: 2.6, w: 2.1, h: 0.3, fontSize: 11, color: DARK, fontFace: 'Arial', bold: true, align: 'center' });
  slide.addText(s.desc, { x: x + 0.1, y: 2.9, w: 2.1, h: 0.6, fontSize: 9, color: GRAY, fontFace: 'Arial', align: 'center', lineSpacingMultiple: 1.2 });
  if (i < 4) {
    slide.addText('→', { x: x + 2.3, y: 2.3, w: 0.2, h: 0.4, fontSize: 18, color: ACCENT, align: 'center', valign: 'middle', bold: true });
  }
});

// QR Label Example
slide.addShape('roundRect', { x: 0.7, y: 4.2, w: 5.5, h: 2.5, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
slide.addText('📄  QR Label Format', { x: 0.9, y: 4.3, w: 5, h: 0.35, fontSize: 12, color: DARK, fontFace: 'Arial', bold: true });
slide.addShape('roundRect', { x: 1.5, y: 4.8, w: 2.5, h: 1.7, fill: { color: WHITE }, rectRadius: 0.05, line: { color: 'CBD5E1', width: 1, dashType: 'dash' } });
slide.addText('MELA SEVA 2026', { x: 1.5, y: 4.85, w: 2.5, h: 0.25, fontSize: 8, color: PRIMARY, fontFace: 'Arial', bold: true, align: 'center', charSpacing: 2 });
slide.addShape('rect', { x: 2.15, y: 5.15, w: 1.2, h: 1.2, fill: { color: DARK } });
slide.addText('QR CODE', { x: 2.15, y: 5.5, w: 1.2, h: 0.5, fontSize: 8, color: WHITE, fontFace: 'Arial', align: 'center' });
slide.addText('Pole No: P-00125', { x: 1.0, y: 6.0, w: 3.5, h: 0.2, fontSize: 9, color: DARK, fontFace: 'Arial', bold: true, align: 'center' });
slide.addText('Road: Main Road  |  Sector: 05', { x: 1.0, y: 6.2, w: 3.5, h: 0.2, fontSize: 8, color: GRAY, fontFace: 'Arial', align: 'center' });
slide.addText('SCAN FOR HELP', { x: 1.5, y: 6.4, w: 2.5, h: 0.2, fontSize: 8, color: ACCENT, fontFace: 'Arial', bold: true, align: 'center' });

// What happens when scanned
slide.addShape('roundRect', { x: 6.8, y: 4.2, w: 5.8, h: 2.5, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
slide.addText('📱  What Happens When Scanned', { x: 7.0, y: 4.3, w: 5.4, h: 0.35, fontSize: 12, color: DARK, fontFace: 'Arial', bold: true });
const scanResults = [
  'Asset identified — pole number, road, sector auto-loaded',
  'GPS location — captured automatically',
  'Complaint form — opens in browser (no app needed)',
  'Pre-filled data — citizen only enters name, mobile, issue',
  'Nearby facilities — shows hospitals, police, toilets',
  'Navigation — get directions to any facility',
];
scanResults.forEach((r, i) => {
  slide.addText(`✅  ${r}`, { x: 7.0, y: 4.75 + (i * 0.3), w: 5.4, h: 0.3, fontSize: 10, color: '334155', fontFace: 'Arial' });
});

// ============ SLIDE 6: QR PRINTING & APPLICATION ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Field Operations', 'QR Printing, Application & Field Process');
addFooter(slide);

// Left: Printing specs
const printImg = imgPath('qr-printing.jpg');
if (printImg) {
  slide.addImage({ ...printImg, x: 0.7, y: 1.7, w: 5.8, h: 2.2 });
}

slide.addShape('roundRect', { x: 0.7, y: 4.1, w: 5.8, h: 2.6, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
slide.addText('🖨️  Printing Specifications', { x: 0.9, y: 4.2, w: 5.4, h: 0.35, fontSize: 12, color: DARK, fontFace: 'Arial', bold: true });

const printSpecs = [
  ['Material', 'Weatherproof vinyl / PET sticker'],
  ['Size', '50mm × 50mm (standard) / Custom available'],
  ['Print Format', 'A4 sheet (20 labels) / Roll printer'],
  ['Durability', 'UV resistant, waterproof, 6+ months outdoor'],
  ['QR Error Correction', 'Level H (30% damage tolerant)'],
  ['Content', 'Event logo, Pole#, Road, Sector, QR code'],
];
printSpecs.forEach((s, i) => {
  slide.addText(s[0], { x: 0.9, y: 4.65 + (i * 0.3), w: 2.0, h: 0.3, fontSize: 9, color: DARK, fontFace: 'Arial', bold: true });
  slide.addText(s[1], { x: 2.9, y: 4.65 + (i * 0.3), w: 3.4, h: 0.3, fontSize: 9, color: GRAY, fontFace: 'Arial' });
});

// Right: Application process
const poleImg = imgPath('qr-pole-application.jpg');
if (poleImg) {
  slide.addImage({ ...poleImg, x: 6.8, y: 1.7, w: 5.8, h: 2.2 });
}

slide.addShape('roundRect', { x: 6.8, y: 4.1, w: 5.8, h: 2.6, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
slide.addText('📌  Application Process', { x: 7.0, y: 4.2, w: 5.4, h: 0.35, fontSize: 12, color: DARK, fontFace: 'Arial', bold: true });

const appSteps = [
  'Survey Team maps pole with GPS during initial field survey',
  'Admin generates & prints QR labels in bulk from portal',
  'Field team applies sticker at ~6 ft height on each pole',
  'Verification — scan test to confirm QR works correctly',
  'Status updated to "Verified" in system with photo proof',
];
appSteps.forEach((s, i) => {
  slide.addShape('roundRect', { x: 7.0, y: 4.65 + (i * 0.38), w: 0.3, h: 0.3, fill: { color: PRIMARY_LIGHT }, rectRadius: 0.15 });
  slide.addText(`${i + 1}`, { x: 7.0, y: 4.65 + (i * 0.38), w: 0.3, h: 0.3, fontSize: 10, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
  slide.addText(s, { x: 7.45, y: 4.65 + (i * 0.38), w: 5.0, h: 0.3, fontSize: 10, color: '334155', fontFace: 'Arial' });
});

// ============ SLIDE 7: GIS TAGGING ============
slide = pptx.addSlide();
addSectionHeader(slide, 'GIS & Mapping', 'GIS Tagging — Complete Geographic Intelligence');
addFooter(slide);

const gisImg = imgPath('gis-mapping.jpg');
if (gisImg) {
  slide.addImage({ ...gisImg, x: 0.7, y: 1.7, w: 5.8, h: 3.0 });
}

// GIS stats
const gisStats = [
  { num: '2dsphere', label: 'MongoDB Geo Index', color: PRIMARY },
  { num: '< 5m', label: 'GPS Accuracy', color: ACCENT },
  { num: 'Real-time', label: 'Live Map Updates', color: SUCCESS },
];
gisStats.forEach((s, i) => {
  const x = 0.7 + (i * 2.0);
  slide.addShape('roundRect', { x: x, y: 4.9, w: 1.85, h: 0.9, fill: { color: s.color }, rectRadius: 0.1 });
  slide.addText(s.num, { x: x, y: 4.95, w: 1.85, h: 0.5, fontSize: 16, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
  slide.addText(s.label, { x: x, y: 5.4, w: 1.85, h: 0.3, fontSize: 8, color: 'FFFFFF', fontFace: 'Arial', align: 'center', transparency: 20 });
});

// Right: What gets mapped
slide.addText('What Gets Mapped', { x: 6.8, y: 1.7, w: 5.8, h: 0.35, fontSize: 14, color: DARK, fontFace: 'Arial', bold: true });
const mapped = [
  '🔌  Electrical Poles — every temporary pole with GPS + photo',
  '⚡  Electrical Lines — wire routes between poles mapped',
  '🏭  Substations & Transformers — location + capacity',
  '🏥  Public Facilities — hospitals, police, toilets, parking',
  '🚨  Complaint Locations — every complaint geo-tagged',
  '🗺️  Event Boundary — complete Mela area demarcation',
];
mapped.forEach((m, i) => {
  slide.addText(m, { x: 6.8, y: 2.15 + (i * 0.35), w: 5.8, h: 0.35, fontSize: 10, color: '334155', fontFace: 'Arial' });
});

slide.addText('GIS Capabilities', { x: 6.8, y: 4.4, w: 5.8, h: 0.35, fontSize: 14, color: DARK, fontFace: 'Arial', bold: true });
const gisCaps = [
  '✅ Nearby asset search within configurable radius',
  '✅ Assets inside event boundary polygon',
  '✅ Heatmap visualization for complaint density',
  '✅ Layer-based map (toggle assets/facilities/complaints)',
  '✅ Route navigation integration with Google Maps',
  '✅ Sector-wise and zone-wise spatial analysis',
];
gisCaps.forEach((c, i) => {
  slide.addText(c, { x: 6.8, y: 4.85 + (i * 0.3), w: 5.8, h: 0.3, fontSize: 10, color: GRAY, fontFace: 'Arial' });
});

// ============ SLIDE 8: COMPLETE DATA FLOW ============
slide = pptx.addSlide();
slide.background = { fill: DARK };

slide.addText('DATA FLOW', { x: 0.7, y: 0.3, w: 3, h: 0.35, fontSize: 10, color: WHITE, fontFace: 'Arial', bold: true, fill: { color: ACCENT }, align: 'center', rectRadius: 0.05 });
slide.addText('Complete Complaint Lifecycle — End to End', { x: 0.7, y: 0.75, w: 11, h: 0.6, fontSize: 28, color: WHITE, fontFace: 'Arial', bold: true });
slide.addShape('rect', { x: 0.7, y: 1.4, w: 0.8, h: 0.05, fill: { color: ACCENT } });

// Flow steps
const flowSteps = [
  { icon: '📱', title: 'Citizen Scans QR', desc: 'Asset + GPS auto-loaded' },
  { icon: '📝', title: 'Submits Complaint', desc: 'Name, mobile, description' },
  { icon: '🔔', title: 'SMS Confirmation', desc: 'Complaint # sent to citizen' },
  { icon: '🖥️', title: 'Control Room Alert', desc: 'Real-time dashboard update' },
  { icon: '👤', title: 'Assign to Officer', desc: 'Dept + officer selected' },
  { icon: '✅', title: 'Resolve & Close', desc: 'Photo proof + SMS to citizen' },
];
flowSteps.forEach((s, i) => {
  const x = 0.5 + (i * 2.1);
  slide.addShape('roundRect', { x: x, y: 1.7, w: 1.95, h: 1.6, fill: { color: '1E293B' }, rectRadius: 0.1 });
  slide.addText(s.icon, { x: x, y: 1.8, w: 1.95, h: 0.5, fontSize: 24, align: 'center' });
  slide.addText(s.title, { x: x, y: 2.3, w: 1.95, h: 0.35, fontSize: 10, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
  slide.addText(s.desc, { x: x, y: 2.65, w: 1.95, h: 0.35, fontSize: 8, color: '94A3B8', fontFace: 'Arial', align: 'center' });
  if (i < 5) {
    slide.addText('→', { x: x + 1.95, y: 2.1, w: 0.15, h: 0.4, fontSize: 14, color: ACCENT, align: 'center', valign: 'middle', bold: true });
  }
});

// Status workflow
slide.addShape('roundRect', { x: 0.7, y: 3.7, w: 5.8, h: 1.8, fill: { color: '1E293B' }, rectRadius: 0.1 });
slide.addText('📊 Status Workflow', { x: 0.9, y: 3.8, w: 5.4, h: 0.35, fontSize: 12, color: WHITE, fontFace: 'Arial', bold: true });

const statuses = [
  { name: 'NEW', color: '3B82F6' },
  { name: 'RECEIVED', color: '6366F1' },
  { name: 'ASSIGNED', color: 'F59E0B' },
  { name: 'IN PROGRESS', color: 'F97316' },
  { name: 'RESOLVED', color: '10B981' },
  { name: 'CLOSED', color: '6B7280' },
];
statuses.forEach((s, i) => {
  const x = 0.9 + (i * 0.95);
  slide.addShape('roundRect', { x: x, y: 4.25, w: 0.85, h: 0.35, fill: { color: s.color }, rectRadius: 0.15 });
  slide.addText(s.name, { x: x, y: 4.25, w: 0.85, h: 0.35, fontSize: 7, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
  if (i < 5) slide.addText('→', { x: x + 0.85, y: 4.25, w: 0.1, h: 0.35, fontSize: 10, color: ACCENT, valign: 'middle' });
});
slide.addText('+ Rejected, Duplicate, Invalid, Reopened, Escalated', { x: 0.9, y: 4.7, w: 5.4, h: 0.3, fontSize: 8, color: '64748B', fontFace: 'Arial' });

// Real-time events
slide.addShape('roundRect', { x: 6.8, y: 3.7, w: 5.8, h: 1.8, fill: { color: '1E293B' }, rectRadius: 0.1 });
slide.addText('🔄 Real-Time Events (Socket.IO)', { x: 7.0, y: 3.8, w: 5.4, h: 0.35, fontSize: 12, color: WHITE, fontFace: 'Arial', bold: true });
const rtEvents = [
  '⚡ New complaint → Control room instantly notified',
  '⚡ Assignment → Officer gets push notification + SMS',
  '⚡ SLA Warning → Dashboard highlights at 75% time',
  '⚡ Resolution → Control room verifies & closes',
  '⚡ Closure SMS → Citizen receives confirmation',
];
rtEvents.forEach((e, i) => {
  slide.addText(e, { x: 7.0, y: 4.25 + (i * 0.24), w: 5.4, h: 0.24, fontSize: 9, color: 'CBD5E1', fontFace: 'Arial' });
});

// Bottom bar
slide.addShape('rect', { x: 0, y: 6.0, w: 13.33, h: 0.8, fill: { color: PRIMARY } });
slide.addText('🔑 Key Principle: Every complaint gets a unique number, never disappears, and every action is logged for complete accountability.', { x: 0.7, y: 6.1, w: 11.9, h: 0.5, fontSize: 12, color: WHITE, fontFace: 'Arial', align: 'center' });

addFooter(slide);

// ============ SLIDE 9: CONTROL ROOM ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Control Room', '24×7 Command & Control Dashboard');
addFooter(slide);

const crImg = imgPath('control-room.jpg');
if (crImg) {
  slide.addImage({ ...crImg, x: 0.7, y: 1.7, w: 5.8, h: 3.2 });
}
slide.addText('Purpose-built control room interface optimized for large screens with real-time data feeds, GIS map, and instant complaint assignment capabilities.', { x: 0.7, y: 5.1, w: 5.8, h: 0.8, fontSize: 10, color: GRAY, fontFace: 'Arial', lineSpacingMultiple: 1.3 });

// Right side components
slide.addText('Dashboard Components', { x: 6.8, y: 1.7, w: 5.8, h: 0.35, fontSize: 14, color: DARK, fontFace: 'Arial', bold: true });
const components = [
  { icon: '!', color: DANGER, title: 'Live Complaint Feed', desc: 'Incoming complaints appear instantly' },
  { icon: '🗺', color: PRIMARY_LIGHT, title: 'GIS Map', desc: 'All complaints color-coded by status' },
  { icon: '📊', color: 'F59E0B', title: 'KPI Cards', desc: 'Total, new, assigned, overdue, resolved' },
  { icon: '⏱', color: SUCCESS, title: 'SLA Monitor', desc: 'Overdue complaints highlighted prominently' },
  { icon: '📈', color: ACCENT, title: 'Trend Charts', desc: 'Hourly/daily complaint visualization' },
  { icon: '👆', color: PRIMARY, title: 'Quick Assign', desc: 'One-click complaint assignment' },
];
components.forEach((c, i) => {
  const y = 2.15 + (i * 0.5);
  slide.addShape('roundRect', { x: 6.8, y: y, w: 0.35, h: 0.35, fill: { color: c.color }, rectRadius: 0.15 });
  slide.addText(c.icon, { x: 6.8, y: y, w: 0.35, h: 0.35, fontSize: 10, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
  slide.addText(c.title, { x: 7.3, y: y - 0.02, w: 2.5, h: 0.22, fontSize: 10, color: DARK, fontFace: 'Arial', bold: true });
  slide.addText(c.desc, { x: 7.3, y: y + 0.18, w: 5.0, h: 0.2, fontSize: 8, color: GRAY, fontFace: 'Arial' });
});

// KPI snapshot
slide.addShape('roundRect', { x: 6.8, y: 5.3, w: 5.8, h: 1.2, fill: { color: LIGHT_GRAY }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
slide.addText('Sample KPI Snapshot', { x: 7.0, y: 5.35, w: 5.4, h: 0.3, fontSize: 10, color: DARK, fontFace: 'Arial', bold: true });

const kpis = [
  { num: '4,250', label: 'Total', bg: 'DBEAFE', fg: PRIMARY },
  { num: '127', label: 'New', bg: 'FEF3C7', fg: 'F59E0B' },
  { num: '18', label: 'Overdue', bg: 'FEE2E2', fg: DANGER },
  { num: '89%', label: 'Resolved', bg: 'D1FAE5', fg: SUCCESS },
];
kpis.forEach((k, i) => {
  const x = 7.0 + (i * 1.35);
  slide.addShape('roundRect', { x: x, y: 5.7, w: 1.2, h: 0.65, fill: { color: k.bg }, rectRadius: 0.08 });
  slide.addText(k.num, { x: x, y: 5.72, w: 1.2, h: 0.35, fontSize: 16, color: k.fg, fontFace: 'Arial', bold: true, align: 'center' });
  slide.addText(k.label, { x: x, y: 6.05, w: 1.2, h: 0.2, fontSize: 8, color: GRAY, fontFace: 'Arial', align: 'center' });
});

// ============ SLIDE 10: MOBILE APPS ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Mobile Applications', 'Field-Ready Mobile Apps for Every Role');
addFooter(slide);

const mobileImg = imgPath('mobile-app.jpg');
if (mobileImg) {
  slide.addImage({ ...mobileImg, x: 0.7, y: 1.7, w: 5.8, h: 2.8 });
}

// Platform badges
const platBadges = [
  { icon: '📱', title: 'Android', bg: 'DBEAFE' },
  { icon: '🍎', title: 'iOS', bg: 'FCE7F3' },
  { icon: '📶', title: 'Offline', bg: 'D1FAE5' },
  { icon: '🔔', title: 'Push Alerts', bg: 'FEF3C7' },
];
platBadges.forEach((b, i) => {
  const x = 0.7 + (i * 1.45);
  slide.addShape('roundRect', { x: x, y: 4.7, w: 1.35, h: 0.85, fill: { color: b.bg }, rectRadius: 0.08 });
  slide.addText(b.icon, { x: x, y: 4.75, w: 1.35, h: 0.4, fontSize: 18, align: 'center' });
  slide.addText(b.title, { x: x, y: 5.15, w: 1.35, h: 0.3, fontSize: 10, color: DARK, fontFace: 'Arial', bold: true, align: 'center' });
});

// Right: App details
const apps = [
  { title: '👷 Field Officer App', color: PRIMARY_LIGHT, items: ['View assigned complaints', 'Navigate to location (GPS)', 'Upload resolution photos', 'Call complainant directly', 'Offline mode with auto-sync'] },
  { title: '📐 Surveyor App', color: ACCENT, items: ['Add new assets with GPS', 'Capture asset photographs', 'Assign QR codes in field', 'Bulk survey mode', 'Work offline in low-network'] },
  { title: '🧑 Public (No App)', color: SUCCESS, items: ['Scan QR → browser opens', 'Register complaint instantly', 'Track complaint status', 'Find nearby facilities', 'Get navigation directions'] },
  { title: '🖥️ Web Admin', color: PRIMARY, items: ['Complete admin dashboard', 'User & role management', 'Asset inventory & QR codes', 'Reports & analytics', 'Works on any browser'] },
];
apps.forEach((a, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 6.8 + (col * 3.1);
  const y = 1.7 + (row * 2.5);
  slide.addShape('roundRect', { x: x, y: y, w: 2.9, h: 2.2, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
  slide.addText(a.title, { x: x + 0.15, y: y + 0.1, w: 2.6, h: 0.3, fontSize: 11, color: a.color, fontFace: 'Arial', bold: true });
  a.items.forEach((item, j) => {
    slide.addText(`•  ${item}`, { x: x + 0.15, y: y + 0.5 + (j * 0.28), w: 2.6, h: 0.28, fontSize: 9, color: GRAY, fontFace: 'Arial' });
  });
});

// ============ SLIDE 11: SMART NAVIGATION ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Public Service', 'Smart Navigation — Help Citizens Find Everything');
addFooter(slide);

slide.addText('Every citizen can instantly find essential facilities around them with real-time distance and navigation — no app installation required.', { x: 0.7, y: 1.6, w: 11.9, h: 0.4, fontSize: 12, color: GRAY, fontFace: 'Arial' });

// Nearby facilities example
slide.addShape('roundRect', { x: 0.7, y: 2.2, w: 5.5, h: 3.5, fill: { color: LIGHT_GRAY }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
slide.addText('📍 Nearby Facilities (Example)', { x: 0.9, y: 2.3, w: 5, h: 0.35, fontSize: 12, color: DARK, fontFace: 'Arial', bold: true });

const nearbyFac = [
  { icon: '🏥', name: 'Hospital', dist: '500m' },
  { icon: '👮', name: 'Police Post', dist: '700m' },
  { icon: '🚻', name: 'Toilet', dist: '150m' },
  { icon: '🅿️', name: 'Parking', dist: '300m' },
  { icon: '💧', name: 'Water Point', dist: '100m' },
  { icon: '🏠', name: 'Shelter', dist: '450m' },
];
nearbyFac.forEach((f, i) => {
  const y = 2.8 + (i * 0.42);
  slide.addShape('roundRect', { x: 0.9, y: y, w: 5.1, h: 0.35, fill: { color: WHITE }, rectRadius: 0.05 });
  slide.addText(`${f.icon}  ${f.name}`, { x: 1.0, y: y, w: 3, h: 0.35, fontSize: 11, color: DARK, fontFace: 'Arial' });
  slide.addText(f.dist, { x: 3.5, y: y, w: 1, h: 0.35, fontSize: 11, color: PRIMARY, fontFace: 'Arial', bold: true, align: 'right' });
  slide.addText('→ Navigate', { x: 4.6, y: y, w: 1.2, h: 0.35, fontSize: 9, color: PRIMARY_LIGHT, fontFace: 'Arial' });
});

// Smart Map features
slide.addShape('roundRect', { x: 6.8, y: 2.2, w: 5.8, h: 3.5, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
slide.addShape('rect', { x: 6.8, y: 2.2, w: 5.8, h: 0.45, fill: { color: PRIMARY }, rectRadius: 0 });
slide.addText('🗺️  Interactive Smart Map', { x: 7.0, y: 2.22, w: 5.4, h: 0.4, fontSize: 13, color: WHITE, fontFace: 'Arial', bold: true });

const mapFeatures = [
  '✅  Current location auto-detected via GPS',
  '✅  Event boundary displayed on map',
  '✅  Category filters — toggle facility types',
  '✅  Distance calculation — shows meters/km',
  '✅  Search — find specific facility by name',
  '✅  Facility details — contact, timings, capacity',
  '✅  One-tap navigation — opens Google/Apple Maps',
  '✅  Emergency shortcuts — hospital, police, fire',
];
mapFeatures.forEach((f, i) => {
  slide.addText(f, { x: 7.0, y: 2.8 + (i * 0.3), w: 5.4, h: 0.3, fontSize: 10, color: '334155', fontFace: 'Arial' });
});

slide.addShape('roundRect', { x: 7.0, y: 5.2, w: 5.4, h: 0.35, fill: { color: 'DBEAFE' }, rectRadius: 0.05 });
slide.addText('💡 No App Installation Required — Works on any smartphone browser', { x: 7.1, y: 5.2, w: 5.2, h: 0.35, fontSize: 9, color: PRIMARY, fontFace: 'Arial', bold: true });

// ============ SLIDE 12: SYSTEM ARCHITECTURE ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Architecture', 'Enterprise-Grade System Architecture');
addFooter(slide);

// Architecture flow
slide.addShape('roundRect', { x: 4.5, y: 1.7, w: 4.3, h: 0.45, fill: { color: ACCENT }, rectRadius: 0.08 });
slide.addText('PUBLIC USERS', { x: 4.5, y: 1.7, w: 4.3, h: 0.45, fontSize: 12, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
slide.addText('↓', { x: 6.3, y: 2.15, w: 0.7, h: 0.3, fontSize: 16, color: '94A3B8', align: 'center' });
slide.addShape('roundRect', { x: 3.5, y: 2.45, w: 6.3, h: 0.45, fill: { color: PRIMARY_LIGHT }, rectRadius: 0.08 });
slide.addText('QR Scan / Web Browser / Mobile App', { x: 3.5, y: 2.45, w: 6.3, h: 0.45, fontSize: 11, color: WHITE, fontFace: 'Arial', align: 'center', valign: 'middle' });
slide.addText('↓', { x: 6.3, y: 2.9, w: 0.7, h: 0.3, fontSize: 16, color: '94A3B8', align: 'center' });
slide.addShape('roundRect', { x: 3.0, y: 3.2, w: 3.2, h: 0.45, fill: { color: 'DBEAFE' }, rectRadius: 0.08 });
slide.addText('React Web App', { x: 3.0, y: 3.2, w: 3.2, h: 0.45, fontSize: 11, color: PRIMARY, fontFace: 'Arial', align: 'center', valign: 'middle' });
slide.addShape('roundRect', { x: 7.1, y: 3.2, w: 3.2, h: 0.45, fill: { color: 'FCE7F3' }, rectRadius: 0.08 });
slide.addText('React Native Mobile', { x: 7.1, y: 3.2, w: 3.2, h: 0.45, fontSize: 11, color: 'BE185D', fontFace: 'Arial', align: 'center', valign: 'middle' });
slide.addText('↓', { x: 6.3, y: 3.65, w: 0.7, h: 0.3, fontSize: 16, color: '94A3B8', align: 'center' });
slide.addShape('roundRect', { x: 4.0, y: 3.95, w: 5.3, h: 0.5, fill: { color: PRIMARY }, rectRadius: 0.08 });
slide.addText('Node.js + Express API  |  Socket.IO Real-time', { x: 4.0, y: 3.95, w: 5.3, h: 0.5, fontSize: 12, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
slide.addText('↓', { x: 6.3, y: 4.45, w: 0.7, h: 0.3, fontSize: 16, color: '94A3B8', align: 'center' });

// Backend services
const services = [
  { name: 'MongoDB', color: SUCCESS },
  { name: 'Socket.IO', color: '8B5CF6' },
  { name: 'File Storage', color: 'F59E0B' },
];
services.forEach((s, i) => {
  const x = 3.0 + (i * 2.7);
  slide.addShape('roundRect', { x: x, y: 4.75, w: 2.3, h: 0.45, fill: { color: s.color }, rectRadius: 0.08 });
  slide.addText(s.name, { x: x, y: 4.75, w: 2.3, h: 0.45, fontSize: 11, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
});

slide.addText('External: Maps API  |  SMS Gateway  |  Push Notifications', { x: 3.0, y: 5.3, w: 7.3, h: 0.3, fontSize: 9, color: GRAY, fontFace: 'Arial', align: 'center' });

// Tech stack
slide.addText('Technology Stack', { x: 6.8, y: 5.7, w: 5.8, h: 0.3, fontSize: 12, color: DARK, fontFace: 'Arial', bold: true });

const techStack = [
  { label: 'WEB', items: ['React.js', 'Vite', 'Tailwind CSS', 'Leaflet/OSM', 'Recharts'] },
  { label: 'MOBILE', items: ['React Native', 'Expo', 'Expo Camera', 'GPS/Location', 'Offline Cache'] },
  { label: 'BACKEND', items: ['Node.js', 'Express.js', 'JWT Auth', 'Socket.IO', 'Winston'] },
  { label: 'DATABASE', items: ['MongoDB', 'Mongoose', '2dsphere Index', 'Aggregation'] },
];
techStack.forEach((t, i) => {
  const x = 0.7 + (i * 3.1);
  slide.addText(t.label, { x: x, y: 6.05, w: 2.8, h: 0.2, fontSize: 8, color: GRAY, fontFace: 'Arial', bold: true });
  slide.addText(t.items.join('  •  '), { x: x, y: 6.25, w: 2.8, h: 0.35, fontSize: 7, color: DARK, fontFace: 'Arial', lineSpacingMultiple: 1.3 });
});

// ============ SLIDE 13: SECURITY ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Security & Compliance', 'Enterprise-Grade Security & Data Protection');
addFooter(slide);

const securityCards = [
  { title: '🔐 Authentication', color: PRIMARY, items: ['JWT token-based auth', 'Refresh token rotation', 'Password hashing (bcrypt)', 'Session management', 'Auto-logout on inactivity'] },
  { title: '🛡️ Access Control', color: ACCENT, items: ['8 distinct user roles', 'Permission-based API access', 'Event-level data isolation', 'Department-level filtering', 'Role-specific dashboards'] },
  { title: '🔒 Data Protection', color: SUCCESS, items: ['HTTPS encryption', 'Secure HTTP headers', 'Input sanitization', 'MongoDB injection prevention', 'XSS/CSRF protection'] },
  { title: '📝 Audit Trail', color: '8B5CF6', items: ['Every action logged', 'User + timestamp + IP', 'Before/after values stored', 'Searchable audit logs', 'Exportable reports'] },
  { title: '🚫 Abuse Prevention', color: DANGER, items: ['API rate limiting', 'CAPTCHA on public forms', 'Duplicate complaint detection', 'File upload validation', 'Size limits enforced'] },
  { title: '👤 Privacy', color: 'F59E0B', items: ['No public data exposure', 'Complainant info protected', 'Role-specific visibility', 'Soft deletion (no data loss)', 'Mobile numbers masked'] },
];
securityCards.forEach((c, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.7 + (col * 4.1);
  const y = 1.7 + (row * 2.6);
  slide.addShape('roundRect', { x: x, y: y, w: 3.8, h: 2.3, fill: { color: WHITE }, rectRadius: 0.1, line: { color: 'E2E8F0', width: 1 } });
  slide.addShape('rect', { x: x, y: y, w: 3.8, h: 0.05, fill: { color: c.color } });
  slide.addText(c.title, { x: x + 0.15, y: y + 0.15, w: 3.5, h: 0.3, fontSize: 12, color: DARK, fontFace: 'Arial', bold: true });
  c.items.forEach((item, j) => {
    slide.addText(`•  ${item}`, { x: x + 0.15, y: y + 0.55 + (j * 0.3), w: 3.5, h: 0.3, fontSize: 9, color: GRAY, fontFace: 'Arial' });
  });
});

// ============ SLIDE 14: DO'S AND DON'TS ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Guidelines', 'Operational Do\'s & Don\'ts');
addFooter(slide);

// DO's section
slide.addShape('roundRect', { x: 0.7, y: 1.7, w: 5.8, h: 5.0, fill: { color: 'ECFDF5' }, rectRadius: 0.1, line: { color: 'A7F3D0', width: 2 } });
slide.addText('✅  DO\'s', { x: 0.9, y: 1.85, w: 5.4, h: 0.4, fontSize: 18, color: '065F46', fontFace: 'Arial', bold: true });
const dos = [
  'Survey every pole before Mela begins — capture GPS + photo',
  'Use weatherproof QR stickers rated for 6+ months outdoor',
  'Apply QR at 5-6 ft height — visible & scannable by public',
  'Test-scan every QR after application — verify data accuracy',
  'Assign complaints within 15 minutes of receipt',
  'Verify resolution photos before closing complaints',
  'Monitor SLA dashboard continuously — act on overdue items',
  'Keep backup power for control room — 24×7 uptime essential',
  'Conduct daily review meeting using MIS reports',
  'Maintain complete audit trail for accountability',
];
dos.forEach((d, i) => {
  slide.addText(`✅  ${d}`, { x: 0.9, y: 2.35 + (i * 0.42), w: 5.4, h: 0.42, fontSize: 10, color: '334155', fontFace: 'Arial', lineSpacingMultiple: 1.2 });
});

// DON'Ts section
slide.addShape('roundRect', { x: 6.8, y: 1.7, w: 5.8, h: 5.0, fill: { color: 'FEF2F2' }, rectRadius: 0.1, line: { color: 'FECACA', width: 2 } });
slide.addText('❌  DON\'Ts', { x: 7.0, y: 1.85, w: 5.4, h: 0.4, fontSize: 18, color: '991B1B', fontFace: 'Arial', bold: true });
const donts = [
  'Don\'t skip GPS tagging — location is critical for navigation',
  'Don\'t use paper QR codes — they won\'t survive weather',
  'Don\'t place QR below 3 ft — will be damaged/blocked',
  'Don\'t leave complaints unassigned for more than 30 min',
  'Don\'t close complaints without verifying resolution photo',
  'Don\'t share complainant\'s personal info publicly',
  'Don\'t allow officers to resolve without reaching location',
  'Don\'t hardcode business rules — use admin configuration',
  'Don\'t delete complaints — maintain complete history',
  'Don\'t ignore SLA breach warnings — escalate immediately',
];
donts.forEach((d, i) => {
  slide.addText(`❌  ${d}`, { x: 7.0, y: 2.35 + (i * 0.42), w: 5.4, h: 0.42, fontSize: 10, color: '334155', fontFace: 'Arial', lineSpacingMultiple: 1.2 });
});

// ============ SLIDE 15: IMPLEMENTATION TIMELINE ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Timeline', 'Implementation Roadmap — 12 Weeks');
addFooter(slide);

// Timeline phases
const phases = [
  { period: 'Week 1-2', title: 'Phase 1: Foundation & Setup', desc: 'Infrastructure, DB design, authentication, user management', color: PRIMARY },
  { period: 'Week 3-4', title: 'Phase 2: Asset & GIS Module', desc: 'Asset master, GIS survey tools, GPS capture, QR generation', color: PRIMARY_LIGHT },
  { period: 'Week 5-6', title: 'Phase 3: Complaint Management', desc: 'Public complaint, status workflow, assignment, SLA tracking', color: ACCENT },
  { period: 'Week 7-8', title: 'Phase 4: Control Room & Dashboard', desc: 'Real-time dashboard, GIS map, Socket.IO integration', color: SUCCESS },
  { period: 'Week 9-10', title: 'Phase 5: Mobile Apps', desc: 'Field officer app, surveyor app, QR scanning, offline support', color: '8B5CF6' },
  { period: 'Week 11-12', title: 'Phase 6: Testing & Deployment', desc: 'UAT, performance testing, training, production deployment', color: 'F59E0B' },
];

phases.forEach((p, i) => {
  const y = 1.7 + (i * 0.82);
  // Timeline dot
  slide.addShape('roundRect', { x: 0.7, y: y, w: 1.2, h: 0.65, fill: { color: p.color }, rectRadius: 0.08 });
  slide.addText(p.period, { x: 0.7, y: y, w: 1.2, h: 0.65, fontSize: 10, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
  // Line connector
  if (i < 5) {
    slide.addShape('rect', { x: 1.25, y: y + 0.65, w: 0.08, h: 0.17, fill: { color: 'CBD5E1' } });
  }
  // Content
  slide.addShape('roundRect', { x: 2.1, y: y, w: 4.5, h: 0.65, fill: { color: LIGHT_GRAY }, rectRadius: 0.08 });
  slide.addText(p.title, { x: 2.2, y: y + 0.05, w: 4.3, h: 0.28, fontSize: 11, color: DARK, fontFace: 'Arial', bold: true });
  slide.addText(p.desc, { x: 2.2, y: y + 0.33, w: 4.3, h: 0.25, fontSize: 9, color: GRAY, fontFace: 'Arial' });
});

// Right side
slide.addShape('roundRect', { x: 6.8, y: 1.7, w: 5.8, h: 2.0, fill: { color: WHITE }, rectRadius: 0.1, line: { color: ACCENT, width: 2 } });
slide.addText('⚡  Rapid Delivery Guarantee', { x: 7.0, y: 1.85, w: 5.4, h: 0.35, fontSize: 13, color: ACCENT, fontFace: 'Arial', bold: true });
const guarantees = [
  'Agile methodology — 2-week sprint cycles with demos',
  'Dedicated team — 6+ developers + 1 project manager',
  'Daily standups — progress visibility to stakeholders',
  'Bi-weekly demos — see working features every 2 weeks',
  'Nagpur-based team — on-site support when needed',
];
guarantees.forEach((g, i) => {
  slide.addText(`•  ${g}`, { x: 7.0, y: 2.3 + (i * 0.25), w: 5.4, h: 0.25, fontSize: 9, color: '334155', fontFace: 'Arial' });
});

// Deliverables
slide.addShape('roundRect', { x: 6.8, y: 3.9, w: 5.8, h: 2.8, fill: { color: WHITE }, rectRadius: 0.1, line: { color: SUCCESS, width: 2 } });
slide.addText('📦  Deliverables', { x: 7.0, y: 4.0, w: 5.4, h: 0.35, fontSize: 13, color: SUCCESS, fontFace: 'Arial', bold: true });
const deliverables = [
  '✅ Web Application (Admin + Public Portal)',
  '✅ Android App (Play Store ready)',
  '✅ iOS App (App Store ready)',
  '✅ Backend API with documentation',
  '✅ QR printing system + label templates',
  '✅ User training + operation manual',
  '✅ Source code + deployment scripts',
  '✅ 3 months post-launch support',
];
deliverables.forEach((d, i) => {
  slide.addText(d, { x: 7.0, y: 4.4 + (i * 0.27), w: 5.4, h: 0.27, fontSize: 10, color: '334155', fontFace: 'Arial' });
});

// ============ SLIDE 16: COMPARISON TABLE ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Comparison', 'Before vs After — Digital Transformation Impact');
addFooter(slide);

const compRows = [
  ['Asset Tracking', 'Paper registers, no GPS, no photographs', 'GPS-tagged, photographed, searchable on map'],
  ['Complaint Registration', 'Phone calls, verbal, no tracking', 'QR scan → 30 sec → instant complaint number'],
  ['Assignment', 'Manual dispatch, phone calls, delays', 'Instant digital assignment with push notification'],
  ['Resolution Tracking', 'No visibility, follow-ups needed', 'Real-time status, SLA timer, auto-escalation'],
  ['Citizen Information', 'No way to find facilities', 'Smart map with all facilities + navigation'],
  ['Reporting', 'Manual compilation, days to prepare', 'One-click reports, real-time dashboards'],
  ['Accountability', 'No audit trail, blame games', 'Complete audit log, officer-wise performance'],
  ['Reusability', 'Start from scratch every event', 'Same platform — create new event, go live'],
  ['Avg Resolution Time', '24-48 hours (often more)', '1-2 hours with SLA enforcement'],
];

// Table header
slide.addShape('rect', { x: 0.7, y: 1.7, w: 3.0, h: 0.45, fill: { color: PRIMARY } });
slide.addText('Aspect', { x: 0.7, y: 1.7, w: 3.0, h: 0.45, fontSize: 11, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
slide.addShape('rect', { x: 3.7, y: 1.7, w: 4.5, h: 0.45, fill: { color: DANGER } });
slide.addText('❌ Current (Manual)', { x: 3.7, y: 1.7, w: 4.5, h: 0.45, fontSize: 11, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
slide.addShape('rect', { x: 8.2, y: 1.7, w: 4.5, h: 0.45, fill: { color: SUCCESS } });
slide.addText('✅ With Mela Seva', { x: 8.2, y: 1.7, w: 4.5, h: 0.45, fontSize: 11, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });

compRows.forEach((row, i) => {
  const y = 2.15 + (i * 0.55);
  const bgColor = i % 2 === 0 ? LIGHT_GRAY : WHITE;
  slide.addShape('rect', { x: 0.7, y: y, w: 3.0, h: 0.55, fill: { color: bgColor }, line: { color: 'E2E8F0', width: 0.5 } });
  slide.addText(row[0], { x: 0.8, y: y, w: 2.8, h: 0.55, fontSize: 10, color: DARK, fontFace: 'Arial', bold: true, valign: 'middle' });
  slide.addShape('rect', { x: 3.7, y: y, w: 4.5, h: 0.55, fill: { color: bgColor }, line: { color: 'E2E8F0', width: 0.5 } });
  slide.addText(row[1], { x: 3.8, y: y, w: 4.3, h: 0.55, fontSize: 9, color: '991B1B', fontFace: 'Arial', valign: 'middle' });
  slide.addShape('rect', { x: 8.2, y: y, w: 4.5, h: 0.55, fill: { color: bgColor }, line: { color: 'E2E8F0', width: 0.5 } });
  slide.addText(row[2], { x: 8.3, y: y, w: 4.3, h: 0.55, fontSize: 9, color: '065F46', fontFace: 'Arial', valign: 'middle' });
});

// ============ SLIDE 17: WHY LIVEPRO ============
slide = pptx.addSlide();
addSectionHeader(slide, 'Why Us', 'Why LIVEpro Software Solutions?');
addFooter(slide);

const teamImg = imgPath('team-work.jpg');
if (teamImg) {
  slide.addImage({ ...teamImg, x: 0.7, y: 1.7, w: 5.8, h: 2.4 });
}

// Stats
const liveproStats = [
  { num: '10+', label: 'Years Experience', color: PRIMARY },
  { num: '50+', label: 'Projects Delivered', color: ACCENT },
  { num: '100%', label: 'On-Time Delivery', color: SUCCESS },
  { num: '24×7', label: 'Support Available', color: '8B5CF6' },
];
liveproStats.forEach((s, i) => {
  const x = 0.7 + (i * 1.45);
  slide.addShape('roundRect', { x: x, y: 4.3, w: 1.35, h: 1.0, fill: { color: s.color }, rectRadius: 0.08 });
  slide.addText(s.num, { x: x, y: 4.35, w: 1.35, h: 0.55, fontSize: 22, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
  slide.addText(s.label, { x: x, y: 4.85, w: 1.35, h: 0.35, fontSize: 8, color: WHITE, fontFace: 'Arial', align: 'center', transparency: 20 });
});

// Right side: USPs
slide.addText('Our Strengths', { x: 6.8, y: 1.7, w: 5.8, h: 0.35, fontSize: 14, color: DARK, fontFace: 'Arial', bold: true });
const usps = [
  { icon: '🏠', title: 'Nagpur-Based Company', desc: 'Local team = on-site support, quick turnaround' },
  { icon: '💡', title: 'Domain Expertise', desc: 'Government projects, smart city, GIS applications' },
  { icon: '🔧', title: 'Full-Stack Capability', desc: 'Web, mobile, backend, GIS, real-time — all in-house' },
  { icon: '📱', title: 'Mobile-First Approach', desc: 'Designed for low-connectivity, rugged field conditions' },
  { icon: '🤝', title: 'End-to-End Ownership', desc: 'Requirement → Development → Training → Support' },
  { icon: '📊', title: 'Proven Technology', desc: 'Modern, scalable stack — future-proof investment' },
];
usps.forEach((u, i) => {
  const y = 2.15 + (i * 0.72);
  slide.addShape('roundRect', { x: 6.8, y: y, w: 0.4, h: 0.4, fill: { color: ACCENT }, rectRadius: 0.15 });
  slide.addText(u.icon, { x: 6.8, y: y, w: 0.4, h: 0.4, fontSize: 14, align: 'center', valign: 'middle' });
  slide.addText(u.title, { x: 7.35, y: y - 0.02, w: 5.0, h: 0.25, fontSize: 11, color: DARK, fontFace: 'Arial', bold: true });
  slide.addText(u.desc, { x: 7.35, y: y + 0.23, w: 5.0, h: 0.2, fontSize: 9, color: GRAY, fontFace: 'Arial' });
});

// ============ SLIDE 18: THANK YOU ============
slide = pptx.addSlide();
slide.background = { fill: PRIMARY };

slide.addShape('roundRect', { x: 5.4, y: 0.8, w: 0.9, h: 0.9, fill: { color: ACCENT }, rectRadius: 0.15 });
slide.addText('L', { x: 5.4, y: 0.8, w: 0.9, h: 0.9, fontSize: 32, color: WHITE, fontFace: 'Arial', bold: true, align: 'center', valign: 'middle' });
slide.addText('LIVEpro Software Solutions', { x: 3.5, y: 1.9, w: 6.33, h: 0.5, fontSize: 22, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
slide.addText('Raghuji Nagar, Nagpur – 440024', { x: 3.5, y: 2.35, w: 6.33, h: 0.3, fontSize: 12, color: '94A3B8', fontFace: 'Arial', align: 'center' });

slide.addText('Thank You', { x: 1.5, y: 3.0, w: 10.33, h: 0.9, fontSize: 52, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
slide.addShape('rect', { x: 5.9, y: 4.0, w: 1.5, h: 0.05, fill: { color: ACCENT } });
slide.addText('We look forward to partnering with you to build a smarter, safer, more connected Mela experience for lakhs of citizens.', { x: 2.5, y: 4.3, w: 8.33, h: 0.5, fontSize: 14, color: 'CBD5E1', fontFace: 'Arial', align: 'center', lineSpacingMultiple: 1.3 });

// Contact card
slide.addShape('roundRect', { x: 4.2, y: 5.0, w: 4.93, h: 1.5, fill: { color: 'FFFFFF', transparency: 90 }, rectRadius: 0.15 });
slide.addText('📞  Let\'s Connect', { x: 4.2, y: 5.1, w: 4.93, h: 0.35, fontSize: 14, color: WHITE, fontFace: 'Arial', bold: true, align: 'center' });
slide.addText('🏢  LIVEpro Software Solutions\n📍  Raghuji Nagar, Nagpur – 440024\n📧  info@liveprosoft.com\n🌐  www.liveprosoft.com', { x: 4.2, y: 5.5, w: 4.93, h: 0.9, fontSize: 11, color: 'CBD5E1', fontFace: 'Arial', align: 'center', lineSpacingMultiple: 1.4 });

slide.addText('© 2026 LIVEpro Software Solutions. All Rights Reserved.', { x: 3.5, y: 6.9, w: 6.33, h: 0.3, fontSize: 8, color: '475569', fontFace: 'Arial', align: 'center' });

// Save
const outputPath = path.join(__dirname, 'Mela_Seva_Pitch_LIVEpro.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log(`✅ PowerPoint saved to: ${outputPath}`))
  .catch(err => console.error('Error:', err));
