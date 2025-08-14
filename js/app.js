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
