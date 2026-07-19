async function loadGeoJSON(path){
  const r=await fetch(path);if(!r.ok)throw new Error(`Gagal memuat ${path}: ${r.status}`);
  const d=await r.json();if(!d||d.type!=='FeatureCollection'||!Array.isArray(d.features))throw new Error(`GeoJSON tidak valid: ${path}`);return d;
}
async function loadJSON(path){const r=await fetch(path);if(!r.ok)throw new Error(`Gagal memuat ${path}: ${r.status}`);return r.json()}
function loadCSV(path){return new Promise((resolve,reject)=>Papa.parse(path,{download:true,header:true,dynamicTyping:true,skipEmptyLines:true,complete:r=>resolve(r.data),error:reject}))}
function loaderFor(path){if(path.endsWith('.geojson'))return loadGeoJSON(path);if(path.endsWith('.json'))return loadJSON(path);return loadCSV(path)}
async function loadDataKey(key){
  if(APP_STATE.data[key]!==undefined)return APP_STATE.data[key];
  if(APP_STATE.loadingKeys.has(key))return APP_STATE.loadingKeys.get(key);
  const path=APP_CONFIG.paths[key];if(!path)return null;
  const job=loaderFor(path).then(v=>{APP_STATE.data[key]=v;return v}).catch(e=>{console.error(key,e);APP_STATE.data[key]=null;return null}).finally(()=>APP_STATE.loadingKeys.delete(key));
  APP_STATE.loadingKeys.set(key,job);return job;
}
async function loadKeys(keys){await Promise.allSettled(keys.map(loadDataKey));return APP_STATE.data}
async function loadAllData(){
  // Ringan saat startup: data utama, statistik, dan data insight. Layer polygon besar dimuat saat dipilih.
  return loadKeys(['boundary','districts','gain','loss','evaluation','area2024','area2025','changeArea','summary','testing','samples','districtStats']);
}
function safeValue(v,f='-'){return v!==undefined&&v!==null&&v!==''?v:f}
function safeNumber(v,d=2){const n=Number(v);return Number.isFinite(n)?n.toLocaleString('id-ID',{minimumFractionDigits:d,maximumFractionDigits:d}):'-'}
function num(v,f=0){const n=Number(v);return Number.isFinite(n)?n:f}
