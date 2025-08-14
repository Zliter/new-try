const PhotoClass = AV.Object.extend('Photo');

function splitTags(text){
  return (text || '').split(/[,，\s]+/).map(s=>s.trim()).filter(Boolean);
}

async function apiUploadFiles(files, tagsText){
  const tags = splitTags(tagsText);
  const saved = [];
  for (const file of files){
    const avFile = new AV.File(file.name, file);
    const savedFile = await avFile.save();
    const photo = new PhotoClass();
    photo.set('url', savedFile.url());
    photo.set('filename', file.name);
    photo.set('size', file.size);
    photo.set('tags', tags);
    photo.set('uploadedAt', new Date());
    saved.push(await photo.save());
  }
  return saved;
}

async function apiListPhotos(keywords=[]){
  const q = new AV.Query('Photo');
  q.descending('createdAt');
  q.limit(PAGE_LIMIT);
  const list = await q.find();
  if (!keywords.length) return list;
  const kw = keywords.map(s=>s.toLowerCase());
  return list.filter(p=>{
    const tags = (p.get('tags')||[]).map(t=>String(t).toLowerCase());
    return kw.every(k=>tags.some(t=>t.includes(k)));
  });
}

async function apiDeletePhoto(objectId, pinText=''){
  if (DELETE_PIN && pinText !== DELETE_PIN) throw new Error('PIN 不正确');
  const obj = AV.Object.createWithoutData('Photo', objectId);
  await obj.fetch();
  try{
    const url = obj.get('url');
    if (url){
      const fq = new AV.Query('_File');
      fq.equalTo('url', url);
      const f = await fq.first();
      if (f) await f.destroy();
    }
  }catch(e){ console.warn('删文件失败（忽略）：', e.message); }
  await obj.destroy();
  return true;
}
