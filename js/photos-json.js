/* 从 ./photos/index.json 读数据，提供 apiListPhotos 以兼容现有 UI/搜索/标签 */
(function(){
  function wrap(item){
    return {
      id: item.url,
      createdAt: item.date ? new Date(item.date) : new Date(0),
      get(k){
        if (k === 'url')      return item.url;
        if (k === 'tags')     return item.tags || [];
        if (k === 'filename') return item.url.split('/').pop();
      }
    };
  }

  window.apiListPhotos = async function(basicTags){
    const res = await fetch('./photos/index.json?v=' + Date.now());
    if (!res.ok) throw new Error('无法读取 photos/index.json');
    let list = await res.json();

    if (basicTags && basicTags.length){
      const need = basicTags.map(s=>String(s).trim().toLowerCase()).filter(Boolean);
      list = list.filter(it=>{
        const tags = (it.tags || []).map(t=>String(t).toLowerCase());
        return need.every(k=>tags.some(t=>t.includes(k)));
      });
    }
    list.sort((a,b)=> new Date(b.date||0) - new Date(a.date||0));
    return list.map(wrap);
  };
})();
