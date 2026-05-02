const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const os = require('os');

const SRC = 'D:\\Bureau\\Projets et groupes\\Houriaa\\Site Internet\\vidéos';
const DEST = path.join(__dirname, 'videos');

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

const mapping = [
  { pattern: /TEASER.*V3/i,                    to: 'teaser_v3.mp4' },
  { pattern: /IMG_9845(?!\d)/i,                to: 'live_1.mp4' },
  { pattern: /IMG_9855/i,                      to: 'live_2.mp4' },
  { pattern: /IMG_9859/i,                      to: 'live_3.mp4' },
  { pattern: /1a15cfaf/i,                      to: 'live_4.mp4' },
  { pattern: /9e0b01ae/i,                      to: 'live_5.mp4' },
  { pattern: /262fa3f8/i,                      to: 'live_6.mp4' },
  { pattern: /5626ee8a/i,                      to: 'live_7.mp4' },
  { pattern: /9049f8d5/i,                      to: 'live_8.mp4' },
  { pattern: /Non confirm/i,                   to: null },
];

function matchFile(name) {
  for (const m of mapping) {
    if (m.pattern.test(name)) return m.to;
  }
  return undefined;
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m${s.toString().padStart(2,'0')}s`;
}

let files;
try {
  files = fs.readdirSync(SRC);
} catch (e) {
  console.error(`Impossible d'ouvrir le dossier source : ${SRC}`);
  console.error(e.message);
  process.exit(1);
}

const jobs = [];
for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!['.mp4', '.mov', '.avi', '.mkv', '.m4v'].includes(ext)) continue;

  const dest = matchFile(file);
  if (dest === null) {
    console.log(`  SKIP  ${file}  (ignoré par mapping)`);
    continue;
  }
  if (dest === undefined) {
    console.log(`  SKIP  ${file}  (pas de règle de renommage)`);
    continue;
  }
  jobs.push({ src: path.join(SRC, file), dest: path.join(DEST, dest), name: file, out: dest });
}

if (jobs.length === 0) {
  console.log('Aucune vidéo à traiter.');
  process.exit(0);
}

console.log(`\n${jobs.length} vidéo(s) à compresser...\n`);

for (const { src, dest, name, out } of jobs) {
  const srcMB = (fs.statSync(src).size / 1024 / 1024).toFixed(1);
  process.stdout.write(`  → ${out.padEnd(18)} (source: ${name}, ${srcMB} MB) ... `);

  const tmp = path.join(os.tmpdir(), 'houriaa_' + Date.now() + path.extname(src));
  const start = Date.now();
  try {
    // Copie locale d'abord pour contourner le verrou OneDrive/réseau
    process.stdout.write('copie... ');
    fs.copyFileSync(src, tmp);

    execSync(
      `"${ffmpeg}" -y -i "${tmp}" -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k -ar 44100 -ac 2 -movflags +faststart "${dest}"`,
      { stdio: 'pipe' }
    );
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const destMB  = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
    const saved   = Math.round((1 - fs.statSync(dest).size / fs.statSync(src).size) * 100);
    console.log(`OK  ${srcMB} MB → ${destMB} MB  (−${saved}%)  [${elapsed}s]`);
  } catch (e) {
    console.log('ERREUR');
    console.error('    ', e.stderr?.toString().split('\n').slice(-3).join(' ') || e.message);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

console.log('\nTerminé.');
