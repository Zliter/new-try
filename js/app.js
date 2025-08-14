(function main(){
  const drop=$('#drop'), picker=$('#picker'), tagInput=$('#tagInput');
  const uploadBtn=$('#uploadBtn'), refreshBtn=$('#refreshBtn'), tip=$('#tip');
  const themeBtn=$('#themeBtn'), searchInput=$('#searchInput'), clearBtn=$('#clearSearch');
  let files=[];

  themeBtn.onclick=()=>document.documentElement.classList.toggle('light');
  picker.onchange=()=>{ files=Array.from(picker.files||[]); tip.textContent=`已选择 ${files.length} 个文件`; };
  ['dragenter','dragover','dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();}));
  drop.addEventListener('drop',e=>{ files=Array.from(e.dataTransfer.files||[]); tip.textContent=`已选择 ${files.length} 个文件`; });

  uploadBtn.onclick=async()=>{
    if(!files.length){ tip.textContent='请先选择文件'; return; }
    tip.textContent='正在上传…';
    try{
      await apiUploadFiles(files, tagInput.value);
      tip.textContent='✅ 上传成功'; files=[]; picker.value=''; tagInput.value='';
      document.dispatchEvent(new CustomEvent('refresh-gallery'));
    }catch(e){ tip.textContent='上传失败：'+e.message; }
  };

  refreshBtn.onclick=()=>document.dispatchEvent(new CustomEvent('refresh-gallery'));
  async function doSearch(){
    const kw=searchInput.value.trim(); const tags=kw?kw.split(/\s+/):[];
    const list=await apiListPhotos(tags); renderGallery(list);
  }
  searchInput.addEventListener('input', doSearch);
  clearBtn.onclick=()=>{ searchInput.value=''; doSearch(); };

  document.addEventListener('refresh-gallery', doSearch);
  doSearch();
})();
// ===== 标签目录（Tag Directory） =====
(function tagDirectoryInit(){
  const $ = s => document.querySelector(s);
  const openBtn = $('#openTagDir');
  const closeBtn = $('#closeTagDir');
  const panel   = $('#tagDir');
  const grid    = $('#tagDirGrid');
  const gallery = document.getElementById('galleryRoot');
  const searchInput = document.getElementById('searchInput');

  let ALL_CACHE = null;

  async function ensureAll(){
    if (ALL_CACHE) return ALL_CACHE;
    ALL_CACHE = await apiListPhotos([]); // 全量
    return ALL_CACHE;
  }

  async function buildTagDirectory(){
    const all = await ensureAll();
    const counter = new Map();
    for (const p of all){
      const tags = p.get('tags') || [];
      tags.forEach(t=>{
        if (!t) return;
        counter.set(t, (counter.get(t)||0)+1);
      });
    }
    grid.innerHTML = '';
    const items = Array.from(counter.entries()).sort((a,b)=>b[1]-a[1]);
    items.forEach(([tag, n])=>{
      const box = document.createElement('div');
      box.className = 'tagbox';
      box.innerHTML = `<span class="name">${tag}</span><span class="count">${n}</span>`;
      box.onclick = ()=>{
        if (searchInput) searchInput.value = tag;
        panel.classList.add('hide');
        document.dispatchEvent(new CustomEvent('refresh-gallery'));
        if (gallery && gallery.scrollIntoView) gallery.scrollIntoView({behavior:'smooth', block:'start'});
      };
      grid.appendChild(box);
    });
  }

  function openPanel(){
    panel.classList.remove('hide');
    buildTagDirectory();
  }
  function closePanel(){ panel.classList.add('hide'); }

  if (openBtn) openBtn.addEventListener('click', openPanel);
  if (closeBtn) closeBtn.addEventListener('click', closePanel);

  panel && panel.addEventListener('click', (e)=>{
    if (e.target === panel) closePanel();
  });

  document.addEventListener('refresh-gallery', async ()=>{
    if (!ALL_CACHE) ALL_CACHE = await apiListPhotos([]);
  });
})();
