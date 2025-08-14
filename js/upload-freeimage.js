/* 直传到 Freeimage.host（前端表单 POST）
 * 覆盖 window.apiUploadFiles(files, tagString)
 * 上传成功后，把要追加到 photos/index.json 的 JSON 片段复制到剪贴板
 */
const FREEIMAGE_API_KEY = '6d207e02198a847aa98d0a2a901485a5'; // ← 换成你的

window.apiUploadFiles = async function(files, tagString=''){
  if (!FREEIMAGE_API_KEY) throw new Error('请先在 upload-freeimage.js 设置 FREEIMAGE_API_KEY');
  const tags = tagString.split(/[,，]/).map(s=>s.trim()).filter(Boolean);
  const entries = [];

  for (const file of files){
    const compact = await maybeCompress(file, 0.9, 1600); // 压到 ~1MB，省流量更快
    const form = new FormData();
    form.append('key', FREEIMAGE_API_KEY);
    form.append('action', 'upload');
    form.append('source', compact);          // 直接传文件
    form.append('format', 'json');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method:'POST',
      body: form
    }).then(r=>r.json());

    // 文档示例：status_code=200，image.url 是直链。 [oai_citation:2‡Freeimage.host](https://freeimage.host/page/api?lang=en)
    if (res && res.status_code === 200 && res.image && res.image.url){
      const url = res.image.url.replace(/^http:/,'https:'); // 用 https
      entries.push({ url, tags, date: todayStr() });
    }else{
      const msg = res?.error?.message || res?.status_txt || '上传失败';
      throw new Error(msg);
    }
  }

  const text = entries.length === 1 ? JSON.stringify(entries[0], null, 2)
                                    : JSON.stringify(entries, null, 2);

  try { await navigator.clipboard.writeText(text); } catch(e) {}
  alert(
`上传成功 ✅

已把要追加到 photos/index.json 的条目复制到剪贴板。
现在去 GitHub 打开 photos/index.json，粘到数组里（注意逗号），提交即可。

预览：
${text.slice(0, 400)}${text.length>400?'...':''}
`
  );

  document.dispatchEvent(new CustomEvent('refresh-gallery'));
};

// —— 简单压缩，控制到 ~1MB —— //
function maybeCompress(file, quality=0.9, maxSide=1600){
  if (file.size < 1.5*1024*1024) return Promise.resolve(file);
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.onload = ()=>{
      let w = img.width, h = img.height;
      if (Math.max(w,h) > maxSide){
        if (w>h){ h = Math.round(h*maxSide/w); w = maxSide; }
        else    { w = Math.round(w*maxSide/h); h = maxSide; }
      }
      const cvs = document.createElement('canvas');
      cvs.width = w; cvs.height = h;
      cvs.getContext('2d').drawImage(img,0,0,w,h);
      cvs.toBlob(b=>{
        if (!b) return reject(new Error('压缩失败'));
        resolve(new File([b], file.name.replace(/\.\w+$/i,'.jpg'), { type:'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    img.onerror = ()=>reject(new Error('图片读取失败'));
    const fr = new FileReader();
    fr.onload = ()=>{ img.src = fr.result; };
    fr.readAsDataURL(file);
  });
}
function todayStr(){ const d=new Date(),m=String(d.getMonth()+1).padStart(2,'0'),x=String(d.getDate()).padStart(2,'0'); return `${d.getFullYear()}-${m}-${x}`; }
