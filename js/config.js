// 先占位，等会儿换成你自己的值
const LC_APP_ID  = 'dsUbx0qZY2bm2JIVbkkMz57B-MdYXbMMI';
const LC_APP_KEY = '1ZcwVDwv4NQsSEbKlwvFE3l6';
const LC_SERVER  = 'https://dsubx0qz.api.lncldglobal.com';

const DELETE_PIN = '';   // 可选：删图 PIN（留空=任何人可删）
const PAGE_LIMIT = 500;

AV.init({ appId: LC_APP_ID, appKey: LC_APP_KEY, serverURL: LC_SERVER });
