function $(s){ return document.querySelector(s); }
const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

function renderGallery(list){
  const root = $('#galleryRoot'); root.innerHTML = '';
  const groups = {};
  for (const p of list){
    const d = p.get('uploadedAt') || p.createdAt;
    const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    (groups[ym] ||= []).push(p);
  }
  const months = Object.keys(groups).sort().reverse();
  for (const ym of months){
    const h = document.createElement('h3'); h.className='month'; h.textContent=ym; root.appendChild(h);
    const grid = document.createElement('div'); grid.className='gallery'; root.appendChild(grid);
    for (const p of groups[ym]) grid.appendChild(photoCard(p));
  }
}

function photoCard(obj){
  const url=obj.get('url'); const tags=obj.get('tags')||[]; const id=obj.id;
  const box=document.createElement('div'); box.className='item';
  const img=document.createElement('img'); img.className='thumb'; img.src=url; img.alt=tags.join(','); box.appendChild(img);
  const meta=document.createElement('div'); meta.className='meta';
  const tagsRow=document.createElement('div');
  for (const t of tags){ const s=document.createElement('span'); s.className='tag'; s.textContent=t; tagsRow.appendChild(s); }
  const del=document.createElement('button'); del.className='btn'; del.textContent='删除';
  del.onclick=async()=>{
    try{
      let pin=''; if (DELETE_PIN) pin = prompt('请输入删除 PIN：') || '';
      if (!confirm('确定删除这张照片吗？')) return;
      await apiDeletePhoto(id, pin);
      document.dispatchEvent(new CustomEvent('refresh-gallery'));
    }catch(e){ alert('删除失败：'+e.message); }
  };
  meta.appendChild(tagsRow); meta.appendChild(del); box.appendChild(meta); return box;
}
