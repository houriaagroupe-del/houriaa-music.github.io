const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const os = require('os');

const SRC  = 'D:\\Bureau\\Projets et groupes\\Houriaa\\Site Internet\\vidéos';
const DEST = path.join(__dirname, 'videos');

const jobs = [
  { from: 'IMG_9845.mov',     to: 'live_1.mp4' },
  { from: 'IMG_9855 (2).mov', to: 'live_2.mp4' },
  { from: 'IMG_9859.mov',     to: 'live_3.mp4' },
];

for (const { from, to } of jobs) {
  const src  = path.join(SRC, from);
  const dest = path.join(DEST, to);
  const tmp  = path.join(os.tmpdir(), 'houriaa_' + Date.now() + path.extname(from));
  const srcMB = (fs.statSync(src).size / 1024 / 1024).toFixed(1);

  process.stdout.write(`  → ${to.padEnd(12)} (${srcMB} MB) ... copie... `);
  try {
    fs.copyFileSync(src, tmp);
    const t0 = Date.now();
    execSync(
      `"${ffmpeg}" -y -i "${tmp}" -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset fast -c:a copy -movflags +faststart "${dest}"`,
      { stdio: 'pipe' }
    );
    const destMB = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
    const saved  = Math.round((1 - fs.statSync(dest).size / fs.statSync(src).size) * 100);
    console.log(`OK  ${srcMB} MB → ${destMB} MB  (−${saved}%)  [${((Date.now()-t0)/1000).toFixed(1)}s]`);
  } catch (e) {
    console.log('ERREUR');
    const lines = (e.stderr || Buffer.alloc(0)).toString().split('\n');
    console.error('   ', lines.filter(l => /error|fail|Qavg/i.test(l)).slice(-2).join(' ') || e.message);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}
