import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist'), prefix='/zhishijie/';
async function walk(dir){const files=await readdir(dir,{withFileTypes:true});return (await Promise.all(files.map(f=>f.isDirectory()?walk(join(dir,f.name)):[join(dir,f.name)]))).flat();}
const files=(await walk(root)).filter(f=>f.endsWith('.html'));
assert.equal(files.length,31,'Expected exactly 31 pages');
const titles=new Set(),descriptions=new Set();let links=0;
for(const file of files){
 const html=await readFile(file,'utf8');
 assert(!/(?:\bSEO\b|seoTitle|seoDescription|SwiftLunar|测试基准|资料与时间说明|中国农业博物馆|原创赏析|尚未逐项|数据生成：)/i.test(html), `${file}: internal editorial copy exposed`);
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1],description=html.match(/name="description" content="([^"]+)"/)?.[1];
 assert(title&&description,`${file}: missing page metadata`);assert(!titles.has(title),`Duplicate title ${title}`);titles.add(title);assert(!descriptions.has(description),`Duplicate description ${file}`);descriptions.add(description);
 assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,`${file}: H1 count`);
 assert(html.includes('rel="canonical" href="https://zhigui.github.io/zhishijie/'),`${file}: canonical`);
 assert(!/(?:id="customs"|href="#customs"|传统习俗)/.test(html), `${file}: removed customs module exposed`);
 const ids=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]));
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const href=match[1].replaceAll('&amp;','&');if(/^(https?:|data:|mailto:)/.test(href))continue;
  if(href.startsWith('#')){assert(ids.has(href.slice(1)),`${file}: missing anchor ${href}`);continue;}
  assert(href.startsWith(prefix),`${file}: missing project prefix ${href}`);
  const [path,hash]=href.slice(prefix.length).split('#');let target=resolve(root,decodeURIComponent(path.split('?')[0]));
  try{const info=await stat(target);if(info.isDirectory())target=join(target,'index.html');await stat(target);}catch{assert.fail(`${file}: missing target ${href}`);}
  if(hash&&target.endsWith('.html'))assert((await readFile(target,'utf8')).includes(`id="${hash}"`),`Missing target hash ${href}`);links++;
 }
 if(file.includes('/solar-terms/')&&!file.endsWith('/solar-terms/index.html'))for(const id of ['date','phenology','poetry'])assert(ids.has(id),`${file}: missing ${id}`);
}
for(const year of [2026,2027]){const data=JSON.parse(await readFile(`src/data/solar-term-dates/${year}.json`,'utf8'));assert.equal(data.terms.length,24);assert.equal(new Set(data.terms.map(t=>t.slug)).size,24);assert(data.terms.every(t=>t.datetime.startsWith(String(year))&&t.datetime.endsWith('+08:00')));}
const sitemap=await readFile(join(root,'sitemap-0.xml'),'utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,30);assert(!sitemap.includes('404'));assert(sitemap.includes(prefix));
console.log(`PASS: ${files.length} static pages; unique page metadata, headings, ${links} internal links/assets, anchors, 48 dates, 30 sitemap URLs; no internal editorial copy.`);
