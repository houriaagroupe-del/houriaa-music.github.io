const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SRC = 'D:\\Bureau\\Projets et groupes\\Houriaa\\Site Internet';
const DEST = path.join(__dirname, 'images');

const files = [
  { from: 'photo 1.jpg',                        to: 'photo_1.jpg' },
  { from: 'photo 2.jpg',                        to: 'photo_2.jpg' },
  { from: 'image album noir sur blanc.jpg',     to: 'image_album_noir_sur_blanc.jpg' },
  { from: 'image 1.jpg',                        to: 'image_1.jpg' },
  { from: 'image 2.jpg',                        to: 'image_2.jpg' },
  { from: 'image 3.jpg',                        to: 'image_3.jpg' },
  { from: 'photo scène 1.jpg',                  to: 'photo_scene_1.jpg' },
  { from: 'photo scène 2.jpg',                  to: 'photo_scene_2.jpg' },
  { from: 'photo scène 3.jpg',                  to: 'photo_scene_3.jpg' },
  { from: 'photo scène 4.jpg',                  to: 'photo_scene_4.jpg' },
  { from: 'photo scène 5.jpg',                  to: 'photo_scene_5.jpg' },
  { from: 'photo scène 6.jpg',                  to: 'photo_scene_6.jpg' },
  { from: 'photo scène 7.jpg',                  to: 'photo_scene_7.jpg' },
  { from: 'photo scène 8.jpg',                  to: 'photo_scene_8.jpg' },
  { from: 'photo signature.jpg',                to: 'photo_signature.jpg' },
  { from: 'tour 2026.jpg',                      to: 'tour_2026.jpg' },
];

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

async function run() {
  let ok = 0, skip = 0, fail = 0;

  for (const { from, to } of files) {
    const src = path.join(SRC, from);
    const dest = path.join(DEST, to);

    if (!fs.existsSync(src)) {
      console.log(`  SKIP  ${from}  (introuvable)`);
      skip++;
      continue;
    }

    try {
      const info = await sharp(src)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toFile(dest);

      const srcKB  = Math.round(fs.statSync(src).size / 1024);
      const destKB = Math.round(info.size / 1024);
      const saved  = Math.round((1 - info.size / fs.statSync(src).size) * 100);
      console.log(`  OK    ${to.padEnd(38)} ${srcKB} KB → ${destKB} KB  (−${saved}%)`);
      ok++;
    } catch (e) {
      console.error(`  FAIL  ${from}  ${e.message}`);
      fail++;
    }
  }

  console.log(`\nTerminé : ${ok} compressé(s), ${skip} ignoré(s), ${fail} erreur(s).`);
}

run();
