document.getElementById('year').textContent = new Date().getFullYear();

const picker = document.getElementById('picker');
const uploadBtn = document.getElementById('uploadBtn');
const refreshBtn = document.getElementById('refreshBtn');
const tip = document.getElementById('tip');
const prog = document.getElementById('upProg');
const gallery = document.getElementById('galleryRoot');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');

let files = [];

// 选择文件
picker.addEventListener('change', e => {
  files = Array.from(e.target.files);
  tip.textContent = `已选择 ${files.length} 张图片`;
});

// 上传文件
uploadBtn.addEventListener('click', async () => {
  if (!files.length) return alert('请先选择文件');
  const tags = document.getElementById('tagInput').value
    .split(',').map(t => t.trim()).filter(Boolean);

  prog.style.display = 'block';
  prog.value = 0;

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const avFile = new AV.File(f.name, f);
    await avFile.save();
    await apiSavePhoto(avFile.url(), tags);
    prog.value = ((i + 1) / files.length) * 100;
  }

  tip.textContent = '上传完成！';
  prog.style.display = 'none';
  files = [];
  picker.value = '';
  loadGallery();
});

// 刷新相册
refreshBtn.addEventListener('click', loadGallery);
clearSearch.addEventListener('click', () => { searchInput.value = ''; loadGallery(); });

// 加载相册
async function loadGallery() {
  gallery.innerHTML = '加载中...';
  const tags = searchInput.value.trim() ? searchInput.value.split(/\s+/) : [];
  const photos = await apiListPhotos(tags);

  gallery.innerHTML = photos.map(p => {
    const url = p.get('url');
    return `<img src="${url}" class="thumb" style="max-width:150px;margin:5px;">`;
  }).join('');
}

loadGallery();
