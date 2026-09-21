const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ 
  size: [960, 540], // 16:9 presentation ratio
  margins: { top: 40, bottom: 50, left: 50, right: 50 },
  bufferPages: true,
  info: {
    Title: 'Mela Seva - Smart Event Management Platform - Project Pitch',
    Author: 'LIVEpro Software Solutions',
    Subject: 'Project Pitch Presentation',
  }
});

const outputPath = path.join(__dirname, 'Mela_Seva_Pitch_LIVEpro.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Colors
const PRIMARY = '#1A365D';
const PRIMARY_LIGHT = '#2563EB';
const ACCENT = '#F97316';
const SUCCESS = '#10B981';
const DANGER = '#EF4444';
const DARK = '#0F172A';
const GRAY = '#475569';
const LIGHT = '#F1F5F9';
const WHITE = '#FFFFFF';

const W = 960;
const H = 540;

function newPage(bgColor = WHITE) {
  doc.addPage({ size: [W, H], margins: { top: 40, bottom: 50, left: 50, right: 50 } });
  if (bgColor !== WHITE) {
    doc.rect(0, 0, W, H).fill(bgColor);
  }
}

function drawFooter() {
  doc.save();
  doc.rect(0, H - 30, W, 30).fill(DARK);
  doc.fillColor(ACCENT).fontSize(8).font('Helvetica-Bold')
    .text('LIVEpro Software Solutions', 30, H - 22, { width: 200 });
  doc.fillColor('#999999').fontSize(7).font('Helvetica')
    .text('Confidential | Mela Seva – Project Pitch', W - 250, H - 22, { width: 220, align: 'right' });
  doc.restore();
}

function drawAccentBar() {
  doc.rect(0, 0, W, 4).fill(PRIMARY_LIGHT);
  doc.rect(0, 4, W, 2).fill(ACCENT);
}

function sectionHeader(tag, title) {
  drawAccentBar();
  doc.roundedRect(50, 25, 80, 20, 4).fill(ACCENT);
  doc.fillColor(WHITE).fontSize(8).font('Helvetica-Bold').text(tag.toUpperCase(), 55, 30, { width: 70, align: 'center' });
  doc.fillColor(DARK).fontSize(22).font('Helvetica-Bold').text(title, 50, 55, { width: 600 });
  doc.rect(50, 85, 50, 3).fill(ACCENT);
}

function drawCard(x, y, w, h, opts = {}) {
  doc.save();
  if (opts.fill) doc.roundedRect(x, y, w, h, 6).fill(opts.fill);
  if (opts.border) {
    doc.roundedRect(x, y, w, h, 6).lineWidth(1).stroke(opts.border);
  }
  doc.restore();
}

// ========== SLIDE 1: COVER ==========
doc.rect(0, 0, W, H).fill(PRIMARY);

// Logo
doc.roundedRect(W/2 - 30, 50, 60, 60, 10).fill(ACCENT);
doc.fillColor(WHITE).fontSize(28).font('Helvetica-Bold').text('L', W/2 - 10, 62, { width: 40, align: 'center' });

doc.fillColor(WHITE).fontSize(20).font('Helvetica-Bold').text('LIVEpro Software Solutions', 0, 125, { width: W, align: 'center' });
doc.fillColor('#94A3B8').fontSize(10).font('Helvetica').text('Raghuji Nagar, Nagpur – 440024', 0, 148, { width: W, align: 'center' });

doc.fillColor(WHITE).fontSize(38).font('Helvetica-Bold').text('MELA SEVA', 0, 195, { width: W, align: 'center' });
doc.fillColor('#BFDBFE').fontSize(16).font('Helvetica').text('Smart Event Management Platform', 0, 240, { width: W, align: 'center' });

doc.rect(W/2 - 40, 270, 80, 3).fill(ACCENT);

doc.fillColor('#CBD5E1').fontSize(11).font('Helvetica')
  .text('Geo-Tagged Asset Management  •  QR-Based Complaint System  •  GIS Smart Navigation', 100, 290, { width: W - 200, align: 'center' });
doc.fillColor('#94A3B8').fontSize(9).font('Helvetica-Oblique')
  .text('A comprehensive digital solution for large-scale public events & temporary infrastructure', 150, 310, { width: W - 300, align: 'center' });

doc.fillColor('#64748B').fontSize(8).font('Helvetica')
  .text('📅 Project Pitch Presentation    🔒 Confidential    📍 Nagpur, Maharashtra', 0, 420, { width: W, align: 'center' });
doc.fillColor('#475569').fontSize(7)
  .text('© 2026 LIVEpro Software Solutions. All Rights Reserved.', 0, H - 40, { width: W, align: 'center' });

// ========== SLIDE 2: THE CHALLENGE ==========
newPage();
sectionHeader('The Challenge', 'Why Mela Management Needs Digital Transformation');
drawFooter();

doc.fillColor(GRAY).fontSize(10).font('Helvetica')
  .text('Large-scale events manage thousands of temporary electrical assets, serve lakhs of visitors daily, and require 24×7 monitoring — yet most operations still rely on manual processes.', 50, 100, { width: 400 });

// Pain points box
drawCard(490, 100, 420, 220, { fill: LIGHT, border: '#E2E8F0' });
doc.fillColor(DANGER).fontSize(13).font('Helvetica-Bold').text('⚠️  Current Pain Points', 510, 115, { width: 380 });

const pains = [
  'No digital record of temporary assets (poles, wires, substations)',
  'Complaints reported verbally — no tracking or accountability',
  'No real-time visibility into complaint resolution status',
  'Citizens struggle to locate nearest hospitals, police, toilets',
  'SLA breaches go unnoticed until major escalation',
  'No data for post-event analysis & improvement',
];
pains.forEach((p, i) => {
  doc.fillColor('#334155').fontSize(9).font('Helvetica').text(`•  ${p}`, 510, 140 + i * 25, { width: 380 });
});

// Stats
drawCard(490, 340, 200, 80, { fill: PRIMARY });
doc.fillColor(WHITE).fontSize(24).font('Helvetica-Bold').text('5000+', 490, 350, { width: 200, align: 'center' });
doc.fillColor('#CBD5E1').fontSize(8).text('Temporary Poles per Mela', 490, 380, { width: 200, align: 'center' });

drawCard(710, 340, 200, 80, { fill: PRIMARY });
doc.fillColor(WHITE).fontSize(24).font('Helvetica-Bold').text('10L+', 710, 350, { width: 200, align: 'center' });
doc.fillColor('#CBD5E1').fontSize(8).text('Daily Visitors', 710, 380, { width: 200, align: 'center' });

// ========== SLIDE 3: SOLUTION OVERVIEW ==========
newPage();
sectionHeader('Our Solution', 'Mela Seva — Complete Digital Platform');
drawFooter();

doc.fillColor(GRAY).fontSize(10).font('Helvetica')
  .text('A unified, scalable platform connecting citizens, field staff, control room, and administration through QR codes, GIS mapping, and real-time communication.', 50, 100, { width: 860 });

const platforms = [
  { icon: '📱', title: 'Citizen App', desc: 'Scan QR → Report issues → Find facilities → Navigate — no login needed', color: '#DBEAFE' },
  { icon: '🎯', title: 'Control Room', desc: 'Real-time dashboard → Assign complaints → Monitor SLA → GIS maps', color: '#FEF3C7' },
  { icon: '👷', title: 'Field Staff App', desc: 'Receive assignments → Navigate → Resolve → Upload proof → Close', color: '#D1FAE5' },
  { icon: '📊', title: 'Admin Portal', desc: 'Asset management → User control → Reports → Configuration', color: '#EDE9FE' },
];
platforms.forEach((p, i) => {
  const x = 50 + i * 220;
  drawCard(x, 130, 200, 130, { fill: WHITE, border: '#E2E8F0' });
  doc.roundedRect(x + 70, 140, 60, 60, 8).fill(p.color);
  doc.fontSize(24).text(p.icon, x + 75, 152, { width: 50, align: 'center' });
  doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(p.title, x, 210, { width: 200, align: 'center' });
  doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(p.desc, x + 10, 225, { width: 180, align: 'center' });
});

// Stats bar
drawCard(50, 280, 860, 60, { fill: LIGHT, border: '#E2E8F0' });
const stats = [{ n: '12', l: 'Core Modules' }, { n: '4', l: 'Platforms' }, { n: '8', l: 'User Roles' }, { n: '3', l: 'Languages' }, { n: '24×7', l: 'Monitoring' }];
stats.forEach((s, i) => {
  const x = 50 + i * 175;
  doc.fillColor(PRIMARY).fontSize(20).font('Helvetica-Bold').text(s.n, x, 288, { width: 170, align: 'center' });
  doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(s.l, x, 312, { width: 170, align: 'center' });
});

// ========== SLIDE 4: KEY FEATURES ==========
newPage();
sectionHeader('Key Features', 'Comprehensive Feature Suite');
drawFooter();

const features = [
  ['GIS-Based Asset Survey', 'GPS-tagged mapping of every pole, wire, substation with photographs'],
  ['QR Code on Every Asset', 'Unique weatherproof QR stickers with pole#, road, sector info'],
  ['Public Complaint Registration', 'Citizens scan QR → auto-fill location → submit complaint in 30 sec'],
  ['Real-Time Control Room', 'Live dashboard with complaint feed, GIS map, instant assignment'],
  ['Smart Navigation Map', 'Find hospitals, police, toilets, parking, ghats, shelters — nearby'],
  ['SLA & Auto-Escalation', 'Timer-based SLA with automatic warning and escalation workflow'],
  ['SMS Notifications', 'Automatic SMS at each stage — registration, assignment, resolution'],
  ['Field Officer Mobile App', 'Offline-capable app with GPS, camera, complaint resolution'],
  ['MIS & Reporting', 'Department-wise, officer-wise reports with Excel/PDF export'],
  ['Multi-Event Scalable', 'Same platform for Kumbh, Mela, fair — configurable per event'],
  ['Multilingual Support', 'English, Hindi, Marathi — all UI, SMS templates, and reports'],
  ['Complete Audit Trail', 'Every action logged — who did what, when, from where'],
];

features.forEach((f, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 50 + col * 295;
  const y = 100 + row * 90;
  
  doc.roundedRect(x, y, 25, 25, 12).fill(PRIMARY_LIGHT);
  doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold').text(`${i + 1}`, x + 7, y + 6, { width: 20, align: 'center' });
  doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text(f[0], x + 32, y + 2, { width: 250 });
  doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(f[1], x + 32, y + 16, { width: 250 });
});

// ========== SLIDE 5: QR CODE WORKFLOW ==========
newPage();
sectionHeader('QR Code System', 'End-to-End QR Code Lifecycle');
drawFooter();

const qrSteps = [
  { n: '1', title: 'GIS Survey', desc: 'Surveyor captures GPS, photo of each pole' },
  { n: '2', title: 'Generate QR', desc: 'System generates unique QR linked to asset & GPS' },
  { n: '3', title: 'Print Labels', desc: 'Weatherproof stickers with QR, pole#, road, sector' },
  { n: '4', title: 'Apply to Pole', desc: 'Sticker applied at 5-6 ft height — visible & scannable' },
  { n: '5', title: 'Citizen Scans', desc: 'Any phone camera opens complaint form with pre-filled data' },
];

qrSteps.forEach((s, i) => {
  const x = 50 + i * 175;
  drawCard(x, 100, 155, 120, { fill: WHITE, border: '#E2E8F0' });
  doc.roundedRect(x + 55, 90, 45, 20, 8).fill(ACCENT);
  doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold').text(s.n, x + 65, 95, { width: 25, align: 'center' });
  doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(s.title, x + 5, 120, { width: 145, align: 'center' });
  doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(s.desc, x + 5, 140, { width: 145, align: 'center', lineGap: 2 });
  if (i < 4) {
    doc.fillColor(ACCENT).fontSize(16).font('Helvetica-Bold').text('→', x + 155, 140, { width: 20, align: 'center' });
  }
});

// QR Label format
drawCard(50, 240, 400, 200, { fill: WHITE, border: '#E2E8F0' });
doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text('📄  QR Label Format', 65, 252, { width: 370 });
doc.roundedRect(130, 275, 140, 150, 4).lineWidth(1).dash(3).stroke('#CBD5E1').undash();
doc.fillColor(PRIMARY).fontSize(7).font('Helvetica-Bold').text('MELA SEVA 2026', 130, 280, { width: 140, align: 'center', charSpacing: 2 });
doc.rect(165, 300, 70, 70).fill(DARK);
doc.fillColor(WHITE).fontSize(8).text('QR', 165, 330, { width: 70, align: 'center' });
doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('Pole No: P-00125', 100, 380, { width: 200, align: 'center' });
doc.fillColor(GRAY).fontSize(8).font('Helvetica').text('Road: Main Road  |  Sector: 05', 100, 395, { width: 200, align: 'center' });
doc.fillColor(ACCENT).fontSize(8).font('Helvetica-Bold').text('SCAN FOR HELP', 130, 412, { width: 140, align: 'center' });

// What happens when scanned
drawCard(480, 240, 430, 200, { fill: WHITE, border: '#E2E8F0' });
doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text('📱  What Happens When Scanned', 495, 252, { width: 400 });
const scanResults = [
  '✅  Asset identified — pole number, road, sector auto-loaded',
  '✅  GPS location — captured automatically',
  '✅  Complaint form — opens in browser (no app needed)',
  '✅  Pre-filled data — citizen only enters name, mobile, issue',
  '✅  Nearby facilities — shows hospitals, police, toilets',
  '✅  Navigation — get directions to any facility',
];
scanResults.forEach((r, i) => {
  doc.fillColor('#334155').fontSize(9).font('Helvetica').text(r, 495, 275 + i * 22, { width: 400 });
});

// ========== SLIDE 6: COMPLETE DATA FLOW ==========
newPage(PRIMARY);

doc.roundedRect(50, 25, 80, 20, 4).fill(ACCENT);
doc.fillColor(WHITE).fontSize(8).font('Helvetica-Bold').text('DATA FLOW', 55, 30, { width: 70, align: 'center' });
doc.fillColor(WHITE).fontSize(22).font('Helvetica-Bold').text('Complete Complaint Lifecycle — End to End', 50, 55, { width: 600 });
doc.rect(50, 85, 50, 3).fill(ACCENT);

const flowSteps = [
  { icon: '📱', title: 'Citizen\nScans QR', desc: 'Asset + GPS\nauto-loaded' },
  { icon: '📝', title: 'Submits\nComplaint', desc: 'Name, mobile,\ndescription' },
  { icon: '🔔', title: 'SMS\nConfirmation', desc: 'Complaint #\nsent to citizen' },
  { icon: '🖥️', title: 'Control Room\nAlert', desc: 'Real-time\ndashboard update' },
  { icon: '👤', title: 'Assign to\nOfficer', desc: 'Dept + officer\nselected' },
  { icon: '✅', title: 'Resolve &\nClose', desc: 'Photo proof +\nSMS to citizen' },
];
flowSteps.forEach((s, i) => {
  const x = 35 + i * 150;
  doc.roundedRect(x, 100, 135, 100, 6).fill('#1E293B');
  doc.fontSize(20).text(s.icon, x, 108, { width: 135, align: 'center' });
  doc.fillColor(WHITE).fontSize(9).font('Helvetica-Bold').text(s.title, x + 5, 138, { width: 125, align: 'center', lineGap: 1 });
  doc.fillColor('#94A3B8').fontSize(7).font('Helvetica').text(s.desc, x + 5, 165, { width: 125, align: 'center', lineGap: 1 });
  if (i < 5) doc.fillColor(ACCENT).fontSize(14).font('Helvetica-Bold').text('→', x + 135, 135, { width: 15, align: 'center' });
});

// Status workflow
doc.roundedRect(50, 220, 420, 100, 6).fill('#1E293B');
doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold').text('📊  Status Workflow', 65, 230, { width: 390 });
const statuses = ['NEW', 'RECEIVED', 'ASSIGNED', 'IN PROGRESS', 'RESOLVED', 'CLOSED'];
const statusColors = ['#3B82F6', '#6366F1', '#F59E0B', '#F97316', '#10B981', '#6B7280'];
statuses.forEach((s, i) => {
  const x = 65 + i * 68;
  doc.roundedRect(x, 252, 60, 20, 8).fill(statusColors[i]);
  doc.fillColor(WHITE).fontSize(6).font('Helvetica-Bold').text(s, x, 257, { width: 60, align: 'center' });
  if (i < 5) doc.fillColor(ACCENT).fontSize(8).text('→', x + 60, 254, { width: 8, align: 'center' });
});
doc.fillColor('#64748B').fontSize(7).font('Helvetica').text('+ Rejected, Duplicate, Invalid, Reopened, Escalated', 65, 280, { width: 390 });

// Real-time events
doc.roundedRect(490, 220, 420, 100, 6).fill('#1E293B');
doc.fillColor(WHITE).fontSize(10).font('Helvetica-Bold').text('🔄  Real-Time Events (Socket.IO)', 505, 230, { width: 390 });
const rtEvents = [
  '⚡ New complaint → Control room instantly notified',
  '⚡ Assignment → Officer gets push notification + SMS',
  '⚡ SLA Warning → Dashboard highlights at 75% time',
  '⚡ Resolution → Control room verifies & closes',
  '⚡ Closure SMS → Citizen receives confirmation',
];
rtEvents.forEach((e, i) => {
  doc.fillColor('#CBD5E1').fontSize(8).font('Helvetica').text(e, 505, 252 + i * 15, { width: 390 });
});

// Key principle
doc.rect(0, 340, W, 50).fill(PRIMARY_LIGHT);
doc.fillColor(WHITE).fontSize(10).font('Helvetica').text('🔑  Key Principle: Every complaint gets a unique number, never disappears, and every action is logged for complete accountability.', 0, 355, { width: W, align: 'center' });

drawFooter();

// ========== SLIDE 7: DO'S AND DON'TS ==========
newPage();
sectionHeader('Guidelines', 'Operational Do\'s & Don\'ts');
drawFooter();

// DO's
doc.roundedRect(50, 100, 420, 340, 8).fill('#ECFDF5').lineWidth(2).stroke('#A7F3D0');
doc.fillColor('#065F46').fontSize(15).font('Helvetica-Bold').text("✅  DO's", 70, 115, { width: 380 });
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
  doc.fillColor('#334155').fontSize(9).font('Helvetica').text(`✅  ${d}`, 70, 145 + i * 28, { width: 380 });
});

// DON'Ts
doc.roundedRect(490, 100, 420, 340, 8).fill('#FEF2F2').lineWidth(2).stroke('#FECACA');
doc.fillColor('#991B1B').fontSize(15).font('Helvetica-Bold').text("❌  DON'Ts", 510, 115, { width: 380 });
const donts = [
  "Don't skip GPS tagging — location is critical for navigation",
  "Don't use paper QR codes — they won't survive weather",
  "Don't place QR below 3 ft — will be damaged/blocked",
  "Don't leave complaints unassigned for more than 30 min",
  "Don't close complaints without verifying resolution photo",
  "Don't share complainant's personal info publicly",
  "Don't allow officers to resolve without reaching location",
  "Don't hardcode business rules — use admin configuration",
  "Don't delete complaints — maintain complete history",
  "Don't ignore SLA breach warnings — escalate immediately",
];
donts.forEach((d, i) => {
  doc.fillColor('#334155').fontSize(9).font('Helvetica').text(`❌  ${d}`, 510, 145 + i * 28, { width: 380 });
});

// ========== SLIDE 8: WHY LIVEPRO ==========
newPage();
sectionHeader('Why Us', 'Why LIVEpro Software Solutions?');
drawFooter();

// Stats
const liveStats = [
  { n: '10+', l: 'Years Exp', c: PRIMARY },
  { n: '50+', l: 'Projects', c: ACCENT },
  { n: '100%', l: 'On-Time', c: SUCCESS },
  { n: '24×7', l: 'Support', c: '#8B5CF6' },
];
liveStats.forEach((s, i) => {
  const x = 50 + i * 220;
  doc.roundedRect(x, 100, 200, 70, 6).fill(s.c);
  doc.fillColor(WHITE).fontSize(22).font('Helvetica-Bold').text(s.n, x, 108, { width: 200, align: 'center' });
  doc.fillColor(WHITE).fontSize(8).font('Helvetica').text(s.l, x, 135, { width: 200, align: 'center' });
});

// USPs
const usps = [
  { icon: '🏠', title: 'Nagpur-Based Company', desc: 'Local team = on-site support, quick turnaround, understanding of local needs' },
  { icon: '💡', title: 'Domain Expertise', desc: 'Experience in government projects, smart city solutions, GIS applications' },
  { icon: '🔧', title: 'Full-Stack Capability', desc: 'Web, mobile, backend, GIS, real-time — all developed under one roof' },
  { icon: '📱', title: 'Mobile-First Approach', desc: 'Field operations designed for low-connectivity, rugged conditions' },
  { icon: '🤝', title: 'End-to-End Ownership', desc: 'From requirement → development → deployment → training → support' },
  { icon: '📊', title: 'Proven Technology', desc: 'Modern, scalable stack used by top enterprises — future-proof investment' },
];
usps.forEach((u, i) => {
  const y = 185 + i * 45;
  doc.roundedRect(50, y, 28, 28, 14).fill(ACCENT);
  doc.fontSize(14).text(u.icon, 53, y + 5, { width: 22, align: 'center' });
  doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(u.title, 88, y + 2, { width: 400 });
  doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(u.desc, 88, y + 16, { width: 800 });
});

// ========== SLIDE 9: IMPLEMENTATION TIMELINE ==========
newPage();
sectionHeader('Timeline', 'Implementation Roadmap — 12 Weeks');
drawFooter();

const phases = [
  { p: 'Week 1-2', t: 'Phase 1: Foundation & Setup', d: 'Infrastructure, DB design, authentication, user management', c: PRIMARY },
  { p: 'Week 3-4', t: 'Phase 2: Asset & GIS Module', d: 'Asset master, GIS survey, GPS capture, QR code generation', c: PRIMARY_LIGHT },
  { p: 'Week 5-6', t: 'Phase 3: Complaint Management', d: 'Public complaint, status workflow, assignment engine, SLA tracking', c: ACCENT },
  { p: 'Week 7-8', t: 'Phase 4: Control Room & Dashboard', d: 'Real-time dashboard, GIS map, Socket.IO integration', c: SUCCESS },
  { p: 'Week 9-10', t: 'Phase 5: Mobile Apps', d: 'Field officer app, surveyor app, QR scanning, offline support', c: '#8B5CF6' },
  { p: 'Week 11-12', t: 'Phase 6: Testing & Deployment', d: 'UAT, performance testing, training, production deployment', c: '#F59E0B' },
];

phases.forEach((p, i) => {
  const y = 100 + i * 55;
  doc.roundedRect(50, y, 80, 40, 4).fill(p.c);
  doc.fillColor(WHITE).fontSize(8).font('Helvetica-Bold').text(p.p, 50, y + 12, { width: 80, align: 'center' });
  doc.roundedRect(145, y, 350, 40, 4).fill(LIGHT);
  doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold').text(p.t, 155, y + 6, { width: 330 });
  doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(p.d, 155, y + 22, { width: 330 });
  if (i < 5) doc.rect(88, y + 40, 3, 15).fill('#CBD5E1');
});

// Deliverables
doc.roundedRect(520, 100, 390, 300, 8).fill(WHITE).lineWidth(2).stroke(SUCCESS);
doc.fillColor(SUCCESS).fontSize(13).font('Helvetica-Bold').text('📦  Deliverables', 540, 115, { width: 350 });
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
  doc.fillColor('#334155').fontSize(10).font('Helvetica').text(d, 540, 145 + i * 28, { width: 350 });
});

// ========== SLIDE 10: THANK YOU ==========
newPage(PRIMARY);

doc.roundedRect(W/2 - 30, 50, 60, 60, 10).fill(ACCENT);
doc.fillColor(WHITE).fontSize(28).font('Helvetica-Bold').text('L', W/2 - 10, 62, { width: 40, align: 'center' });

doc.fillColor(WHITE).fontSize(20).font('Helvetica-Bold').text('LIVEpro Software Solutions', 0, 125, { width: W, align: 'center' });
doc.fillColor('#94A3B8').fontSize(10).font('Helvetica').text('Raghuji Nagar, Nagpur – 440024', 0, 148, { width: W, align: 'center' });

doc.fillColor(WHITE).fontSize(38).font('Helvetica-Bold').text('Thank You', 0, 200, { width: W, align: 'center' });
doc.rect(W/2 - 40, 245, 80, 3).fill(ACCENT);

doc.fillColor('#CBD5E1').fontSize(12).font('Helvetica')
  .text('We look forward to partnering with you to build a smarter, safer, more connected Mela experience for lakhs of citizens.', 150, 265, { width: W - 300, align: 'center', lineGap: 4 });

// Contact card
doc.roundedRect(W/2 - 160, 310, 320, 120, 10).fill('#FFFFFF22');
doc.fillColor(WHITE).fontSize(13).font('Helvetica-Bold').text('📞  Let\'s Connect', 0, 320, { width: W, align: 'center' });
doc.fillColor('#CBD5E1').fontSize(10).font('Helvetica')
  .text('🏢  LIVEpro Software Solutions\n📍  Raghuji Nagar, Nagpur – 440024\n📧  info@liveprosoft.com\n🌐  www.liveprosoft.com', 0, 345, { width: W, align: 'center', lineGap: 4 });

doc.fillColor('#475569').fontSize(7).font('Helvetica')
  .text('© 2026 LIVEpro Software Solutions. All Rights Reserved.', 0, H - 40, { width: W, align: 'center' });

// Finalize
doc.end();

stream.on('finish', () => {
  console.log(`✅ PDF saved to: ${outputPath}`);
  console.log(`   File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
});
