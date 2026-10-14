import sharp from 'sharp';
import {mkdir, copyFile, stat} from 'node:fs/promises';

await Promise.all(['public/brand', 'public/fonts', 'public/images'].map(path => mkdir(path, {recursive:true})));
await copyFile('Logo/Horizontal- Main/Logo.svg', 'public/brand/logo.svg');
await copyFile('Logo/Vertical/Logo Vertical.svg', 'public/brand/logo-vertical.svg');
await copyFile('Fonts/Arabic/Alexandria[wght].ttf', 'public/fonts/alexandria.ttf');
const images = {
  hero: 'hero-learning-environment.png',
  factory: 'smart-factory-staff-uniform.png',
  media: 'educational-media.png',
  emergency: 'school-in-a-box-concept.png',
};
for (const [name, source] of Object.entries(images)) {
  const target = `public/images/${name}.webp`;
  await sharp(`public/images/generated/${source}`).resize({width:1920, withoutEnlargement:true}).webp({quality:85}).toFile(target);
  console.log(`${target}: ${Math.round((await stat(target)).size/1024)} KB`);
}
