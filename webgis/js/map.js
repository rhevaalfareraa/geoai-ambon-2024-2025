let webgisMap, baseMaps, legendControl, basemapSwitcher, activeBaseKey = 'map';
let swipeLeftLayer = null, swipeRightLayer = null, swipeActive = false, swipePercent = 50;

const CHANGE_CLASSES = [
  ['Tetap non-vegetasi', '#bdc3c7'],
  ['Gain vegetasi', '#f1c40f'],
  ['Loss vegetasi', '#e74c3c'],
  ['Tetap vegetasi', '#27ae60']
];

const CHANGE_MAP_EXCLUSIVE_LAYERS = [
  'vegetation2024',
  'vegetation2025',
  'gain',
  'loss'
];

const LAYER_META = {
  changeMap: ['Perubahan Tutupan Lahan 2024–2025', '#27ae60', 'raster'],
  boundary: ['Boundary Kota Ambon', '#102c3a', 'line'],
  districts: ['Batas Kecamatan', '#8bc34a', 'line'],
  vegetation2024: ['Vegetasi 2024', '#27ae60', 'polygon'],
  vegetation2025: ['Vegetasi 2025', '#2980b9', 'polygon'],
  gain: ['Gain Vegetasi', '#f1c40f', 'polygon'],
  loss: ['Loss Vegetasi', '#e74c3c', 'polygon'],
  groundTruth2024: ['Ground Truth 2024', '#27ae60', 'point'],
  groundTruth2025: ['Ground Truth 2025', '#e74c3c', 'point'],
  featureSamples2024: ['Feature Samples 2024', '#8bc34a', 'point'],
  featureSamples2025: ['Feature Samples 2025', '#f39c12', 'point'],
  priorityZones: ['Zona Prioritas Indikatif', '#c0392b', 'polygon']
};

let selectedDistrictBoundaryLayer = null;

const THEMATIC_LAYER_KEYS = [
  'changeMap',
  'vegetation2024',
  'vegetation2025',
  'gain',
  'loss',
  'groundTruth2024',
  'groundTruth2025',
  'featureSamples2024',
  'featureSamples2025',
  'priorityZones'
];

function initializeMap(){
  if(window.webgisMap) window.webgisMap.remove();

  const topo = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
  );
  const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
  );
  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 20,
      subdomains: ['a','b','c']
    }
  );

  baseMaps = { map: topo, osm, satellite };
  webgisMap = L.map('map', {
    center: APP_CONFIG.map.center,
    zoom: APP_CONFIG.map.zoom,
    minZoom: APP_CONFIG.map.minZoom,
    maxZoom: APP_CONFIG.map.maxZoom,
    layers: [topo],
    fullscreenControl: true,
    zoomControl: true
  });
  window.webgisMap = webgisMap;
  webgisMap.on('zoomend moveend resize',()=>{if(swipeActive)requestAnimationFrame(()=>updateNativeSwipe(swipePercent))});

  L.control.scale({ imperial:false, position:'bottomright' }).addTo(webgisMap);
  addBasemapSwitcher();
  addDrawingTools();

  legendControl = L.control({position:'bottomleft'});
  legendControl.onAdd = () => {
    const d = L.DomUtil.create('div','map-legend change-map-legend');
    d.id = 'dynamic-legend';
    L.DomEvent.disableClickPropagation(d);
    return d;
  };
  legendControl.addTo(webgisMap);

  const layerButton = document.getElementById('floating-layer-button');
  const panel = document.getElementById('floating-layer-panel');
  const close = document.getElementById('close-layer-panel');
  layerButton?.addEventListener('click',()=>panel?.classList.toggle('open'));
  close?.addEventListener('click',()=>panel?.classList.remove('open'));
}

function addBasemapSwitcher(){
  const Control = L.Control.extend({
    options:{position:'topright'},
    onAdd(){
      const wrap=L.DomUtil.create('div','basemap-switcher leaflet-bar');
      wrap.innerHTML='<button type="button" data-base="map" class="active">Map</button><button type="button" data-base="osm">OSM</button><button type="button" data-base="satellite">Satellite</button>';
      L.DomEvent.disableClickPropagation(wrap);
      wrap.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
        const key=btn.dataset.base;
        if(key===activeBaseKey)return;
        webgisMap.removeLayer(baseMaps[activeBaseKey]);
        baseMaps[key].addTo(webgisMap).bringToBack();
        activeBaseKey=key;
        wrap.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.base===key));
      }));
      return wrap;
    }
  });
  basemapSwitcher=new Control().addTo(webgisMap);
}

function addDrawingTools(){
  if(!L.Control.Draw)return;
  const drawnItems=new L.FeatureGroup().addTo(webgisMap);
  const drawControl=new L.Control.Draw({
    position:'topleft',
    draw:{polygon:true,polyline:true,rectangle:true,marker:true,circle:false,circlemarker:false},
    edit:{featureGroup:drawnItems,edit:false,remove:true}
  });
  webgisMap.addControl(drawControl);
  webgisMap.on(L.Draw.Event.CREATED,e=>drawnItems.addLayer(e.layer));
}

async function loadChangeRaster(){
  if(APP_STATE.layers.changeMap)return APP_STATE.layers.changeMap;

  if(!APP_STATE.data.boundary){
    await loadDataKey('boundary');
  }

  const response=await fetch('./data/raster/RF_Change_Map_Ambon_2024_2025.tif',{cache:'no-store'});
  if(!response.ok)throw new Error(`GeoTIFF Change Map gagal dimuat: HTTP ${response.status}`);

  const arrayBuffer=await response.arrayBuffer();
  if(!arrayBuffer.byteLength)throw new Error('GeoTIFF Change Map kosong');

  if(typeof parseGeoraster!=='function'){
    throw new Error('Library georaster tidak tersedia');
  }
  if(typeof GeoRasterLayer!=='function'){
    throw new Error('Library GeoRasterLayer tidak tersedia');
  }

  const georaster=await parseGeoraster(arrayBuffer);
  const boundaryMask=APP_STATE.data.boundary;

  const layer=new GeoRasterLayer({
    georaster,
    opacity:0.92,
    resolution:192,
    mask:boundaryMask,
    mask_srs:'EPSG:4326',
    mask_strategy:'outside',
    pixelValuesToColorFn:values=>{
      const v=Math.round(Number(values?.[0]));
      if(v===0)return '#bdc3c7';
      if(v===1)return '#f1c40f';
      if(v===2)return '#e74c3c';
      if(v===3)return '#27ae60';
      return null;
    }
  });

  layer.on?.('error',event=>console.error('GeoRasterLayer error:',event));
  APP_STATE.layers.changeMap=layer;
  return layer;
}


function districtNameForFeature(feature){
  try{
    if(!window.turf || !APP_STATE.data.districts) return '—';
    const center=featureCenter(feature);
    if(!center) return '—';
    const point=turf.point(center);
    const district=APP_STATE.data.districts.features.find(item=>{
      try{return turf.booleanPointInPolygon(point,item)}catch(_){return false}
    });
    return safeValue(district?.properties?.NAME_3,'—');
  }catch(_){return '—'}
}

function showLayerError(layerName,error){
  const panel=document.getElementById('layer-error-panel');
  if(!panel)return;
  panel.classList.remove('hidden');
  panel.innerHTML=`<i class="fa-solid fa-triangle-exclamation"></i><div><strong>Layer ${layerName} tidak dapat dimuat.</strong><span>Pastikan file tersedia di folder data dan WebGIS dijalankan melalui local server.</span><small>${safeValue(error?.message,'Kesalahan pemuatan data')}</small></div><button type="button" aria-label="Tutup pesan"><i class="fa-solid fa-xmark"></i></button>`;
  panel.querySelector('button')?.addEventListener('click',()=>panel.classList.add('hidden'),{once:true});
}

function setSwipeLabels(show){
  document.getElementById('swipe-label-left')?.classList.toggle('hidden',!show);
  document.getElementById('swipe-label-right')?.classList.toggle('hidden',!show);
  document.getElementById('native-swipe-control')?.classList.toggle('hidden',!show);
}

function makeSwipePolygonLayer(key,data,paneName,styleOverride={}){
  if(!webgisMap.getPane(paneName)){
    const pane=webgisMap.createPane(paneName);
    pane.style.zIndex='430';
    pane.style.pointerEvents='auto';
    pane.classList.add('native-swipe-pane');
  }

  const color=styleOverride.fillColor||APP_CONFIG.colors[key]||'#777777';
  const outline=styleOverride.color||color;

  return L.geoJSON(data,{
    pane:paneName,
    renderer:L.svg({pane:paneName,padding:0.5}),
    style:()=>({
      pane:paneName,
      color:outline,
      weight:styleOverride.weight??0.65,
      opacity:styleOverride.opacity??1,
      fillColor:color,
      fillOpacity:styleOverride.fillOpacity??0.72
    }),
    onEachFeature:(feature,layer)=>{
      layer.bindPopup(polygonPopup(feature,key));
      const title={
        vegetation2024:'Vegetasi 2024',
        vegetation2025:'Vegetasi 2025',
        gain:'Gain Vegetasi',
        loss:'Loss Vegetasi'
      }[key]||key;
      layer.bindTooltip(`${title} • ${safeNumber(feature.properties?.area_ha)} ha`,{sticky:true});
    }
  });
}

function updateNativeSwipe(value){
  swipePercent=Math.max(5,Math.min(95,Number(value)||50));

  const leftPane=webgisMap?.getPane('swipe-left-pane');
  const rightPane=webgisMap?.getPane('swipe-right-pane');

  const leftClip=`inset(0 ${100-swipePercent}% 0 0)`;
  const rightClip=`inset(0 0 0 ${swipePercent}%)`;

  if(leftPane){
    leftPane.style.clipPath=leftClip;
    leftPane.style.webkitClipPath=leftClip;
  }
  if(rightPane){
    rightPane.style.clipPath=rightClip;
    rightPane.style.webkitClipPath=rightClip;
  }

  const divider=document.getElementById('native-swipe-divider');
  if(divider)divider.style.left=`${swipePercent}%`;

  const range=document.getElementById('native-swipe-range');
  if(range&&Number(range.value)!==swipePercent)range.value=swipePercent;

  const compareText=document.getElementById('compare-value');
  if(compareText)compareText.textContent=`2024 ${swipePercent}% • 2025 ${100-swipePercent}%`;
}

function initializeNativeSwipeInput(){
  const range=document.getElementById('native-swipe-range');
  if(!range || range.dataset.ready==='true')return;
  range.dataset.ready='true';
  L.DomEvent.disableClickPropagation(range);
  L.DomEvent.disableScrollPropagation(range);
  range.addEventListener('input',event=>updateNativeSwipe(event.target.value));
  range.addEventListener('pointerdown',event=>event.stopPropagation());
  range.addEventListener('touchstart',event=>event.stopPropagation(),{passive:true});
}

async function enableSwipeComparison(){
  if(swipeActive)return;
  setMapStatus('Menyiapkan Swipe Comparison 2024–2025…',true);

  try{
    await Promise.all([
      loadDataKey('vegetation2024'),
      loadDataKey('vegetation2025'),
      loadDataKey('gain'),
      loadDataKey('loss')
    ]);

    if(!APP_STATE.data.vegetation2024||!APP_STATE.data.vegetation2025){
      throw new Error('GeoJSON vegetasi 2024/2025 tidak tersedia');
    }

    await toggleLayer('vegetation2024',false);
    await toggleLayer('vegetation2025',false);
    await toggleLayer('gain',false);
    await toggleLayer('loss',false);
    await toggleLayer('changeMap',false);

    const leftVegetation=makeSwipePolygonLayer(
      'vegetation2024',
      APP_STATE.data.vegetation2024,
      'swipe-left-pane',
      {fillColor:'#27ae60',color:'#176b39',fillOpacity:0.72,weight:0.55}
    );

    const leftLoss=APP_STATE.data.loss
      ? makeSwipePolygonLayer(
          'loss',
          APP_STATE.data.loss,
          'swipe-left-pane',
          {fillColor:'#e74c3c',color:'#a93226',fillOpacity:0.96,weight:1.1}
        )
      : null;

    const rightVegetation=makeSwipePolygonLayer(
      'vegetation2025',
      APP_STATE.data.vegetation2025,
      'swipe-right-pane',
      {fillColor:'#2980b9',color:'#185a82',fillOpacity:0.72,weight:0.55}
    );

    const rightGain=APP_STATE.data.gain
      ? makeSwipePolygonLayer(
          'gain',
          APP_STATE.data.gain,
          'swipe-right-pane',
          {fillColor:'#f1c40f',color:'#b7950b',fillOpacity:0.98,weight:1.1}
        )
      : null;

    swipeLeftLayer=L.featureGroup([leftVegetation,leftLoss].filter(Boolean)).addTo(webgisMap);
    swipeRightLayer=L.featureGroup([rightVegetation,rightGain].filter(Boolean)).addTo(webgisMap);

    swipeActive=true;
    initializeNativeSwipeInput();
    setSwipeLabels(true);

    const leftLabel=document.getElementById('swipe-label-left');
    const rightLabel=document.getElementById('swipe-label-right');
    if(leftLabel)leftLabel.innerHTML='<b>Vegetasi 2024</b><small>Loss ditandai merah</small>';
    if(rightLabel)rightLabel.innerHTML='<b>Vegetasi 2025</b><small>Gain ditandai kuning</small>';

    updateNativeSwipe(50);

    document.getElementById('toggle-swipe')?.classList.add('active');
    const buttonText=document.querySelector('#toggle-swipe span');
    if(buttonText)buttonText.textContent='Nonaktifkan Swipe Comparison';

    if(APP_STATE.layers.boundary)APP_STATE.layers.boundary.bringToFront();
    if(APP_STATE.layers.districts)APP_STATE.layers.districts.bringToFront();

    if(APP_STATE.layers.boundary?.getBounds){
      webgisMap.fitBounds(APP_STATE.layers.boundary.getBounds(),{padding:[10,10]});
    }

    requestAnimationFrame(()=>{
      webgisMap.invalidateSize(false);
      updateNativeSwipe(swipePercent);
    });
    setTimeout(()=>updateNativeSwipe(swipePercent),150);

    updateLegend();
  }catch(error){
    console.error('Swipe comparison gagal:',error);
    showLayerError('Swipe Comparison',error);
    disableSwipeComparison(false);
  }finally{
    setMapStatus('',false);
  }
}

function disableSwipeComparison(restoreChange=true){
  [swipeLeftLayer,swipeRightLayer].forEach(layer=>{if(layer&&webgisMap.hasLayer(layer))webgisMap.removeLayer(layer)});
  swipeLeftLayer=null;swipeRightLayer=null;swipeActive=false;
  const leftPane=webgisMap?.getPane('swipe-left-pane');
  const rightPane=webgisMap?.getPane('swipe-right-pane');
  if(leftPane)leftPane.style.clipPath='';
  if(rightPane)rightPane.style.clipPath='';
  setSwipeLabels(false);
  document.getElementById('toggle-swipe')?.classList.remove('active');
  const buttonText=document.querySelector('#toggle-swipe span');
  if(buttonText)buttonText.textContent='Aktifkan Swipe Comparison';
  const compareText=document.getElementById('compare-value');
  if(compareText)compareText.textContent='Swipe 2024 ↔ 2025';
  if(restoreChange)toggleLayer('changeMap',true).then(renderLayerToggles);
  updateLegend();
}

async function toggleSwipeComparison(){
  if(swipeActive)disableSwipeComparison(true);
  else await enableSwipeComparison();
}

function polygonPopup(feature,key){
  const p=feature.properties||{};
  if(key==='boundary') return `<table class="popup-table"><tr><td>Wilayah</td><td><b>${safeValue(p.NAME_2,'Kota Ambon')}</b></td></tr><tr><td>Provinsi</td><td>${safeValue(p.NAME_1,'Maluku')}</td></tr><tr><td>Tipe</td><td>${safeValue(p.TYPE_2,'Kota')}</td></tr><tr><td>Geometry</td><td>${feature.geometry?.type||'-'}</td></tr></table>`;
  if(key==='districts') return `<table class="popup-table"><tr><td>Kecamatan</td><td><b>${safeValue(p.NAME_3)}</b></td></tr><tr><td>Kota</td><td>${safeValue(p.NAME_2,'Ambon')}</td></tr><tr><td>Provinsi</td><td>${safeValue(p.NAME_1,'Maluku')}</td></tr><tr><td>Geometry</td><td>${feature.geometry?.type||'-'}</td></tr></table>`;
  const area=num(p.area_ha),coords=featureCenter(feature);
  const cityArea=num(getSummary()?.luas_kota_ha,APP_CONFIG.fallback.cityArea);
  const percentage=cityArea>0?area/cityArea*100:0;
  const district=districtNameForFeature(feature);
  const category=safeValue(p.category,key==='vegetation2024'?'Vegetasi 2024':key==='vegetation2025'?'Vegetasi 2025':'—');
  const period=key==='gain'||key==='loss'?'2024–2025':safeValue(p.year,'2024–2025');
  return `<div class="popup-heading">${category}</div><table class="popup-table">
    <tr><td>Kota</td><td><b>Kota Ambon</b></td></tr>
    <tr><td>Kecamatan</td><td>${district}</td></tr>
    <tr><td>Objek target</td><td>Vegetasi</td></tr>
    <tr><td>Kategori</td><td><b>${category}</b></td></tr>
    <tr><td>Periode</td><td>${period}</td></tr>
    <tr><td>Luas polygon</td><td>${safeNumber(area)} ha</td></tr>
    <tr><td>Persentase kota</td><td>${safeNumber(percentage)}%</td></tr>
    <tr><td>Sumber</td><td>${safeValue(p.source,'Sentinel-2 SR Harmonized')}</td></tr>
    <tr><td>Model</td><td>${safeValue(p.model,'Random Forest 150 trees')}</td></tr>
    <tr><td>Resolusi</td><td>${safeValue(p.resolution_m,10)} m</td></tr>
    <tr><td>Centroid</td><td>${coords?coords[1].toFixed(5)+', '+coords[0].toFixed(5):'-'}</td></tr>
  </table>`;
}

function pointPopup(feature,key){
  const p=feature.properties||{};
  const featureStack=key.startsWith('featureSamples');
  return `<table class="popup-table"><tr><td>Sample ID</td><td><b>${safeValue(p.sample_id)}</b></td></tr><tr><td>Kelas</td><td>${safeValue(p.class)}</td></tr><tr><td>Label</td><td>${safeValue(p.label)}</td></tr><tr><td>Tahun</td><td>${safeValue(p.year)}</td></tr><tr><td>Longitude</td><td>${safeNumber(p.longitude,5)}</td></tr><tr><td>Latitude</td><td>${safeNumber(p.latitude,5)}</td></tr>${featureStack?`<tr><td>NDVI</td><td>${safeNumber(p.NDVI,4)}</td></tr><tr><td>NDWI</td><td>${safeNumber(p.NDWI,4)}</td></tr><tr><td>NDBI</td><td>${safeNumber(p.NDBI,4)}</td></tr><tr><td>BSI</td><td>${safeNumber(p.BSI,4)}</td></tr>`:''}</table>`;
}

function featureCenter(feature){try{return turflessCenter(feature.geometry)}catch{return null}}
function turflessCenter(g){let pts=[];const walk=a=>{if(typeof a[0]==='number')pts.push(a);else a.forEach(walk)};walk(g.coordinates);if(!pts.length)return null;let x=0,y=0;pts.forEach(p=>{x+=p[0];y+=p[1]});return[x/pts.length,y/pts.length]}
function layerOpacity(key){if(key==='vegetation2024')return num(document.getElementById('compare-slider')?.value,50)/100;if(key==='vegetation2025')return 1-num(document.getElementById('compare-slider')?.value,50)/100;if(key==='loss')return .84;if(key==='gain')return .82;return .45}

function buildPriorityZones(){
  const features=[...(APP_STATE.data.loss?.features||[])].sort((a,b)=>num(b.properties?.area_ha)-num(a.properties?.area_ha));
  if(!features.length)return {type:'FeatureCollection',features:[]};
  const max=Math.max(...features.map(f=>num(f.properties?.area_ha)));
  return {type:'FeatureCollection',features:features.map((f,i)=>{
    const area=num(f.properties?.area_ha),ratio=max?area/max:0;
    const level=ratio>=0.50?'Tinggi':ratio>=0.20?'Sedang':'Rendah';
    return {...f,properties:{...(f.properties||{}),priority_level:level,priority_rank:i+1,priority_basis:'Ukuran patch loss relatif'}};
  })};
}

function priorityPopup(feature){
  const p=feature.properties||{}, area=num(p.area_ha), c=featureCenter(feature);
  return `<div class="priority-popup"><h3>Zona Prioritas ${safeValue(p.priority_level)}</h3><table class="popup-table"><tr><td>Peringkat</td><td><b>#${safeValue(p.priority_rank)}</b></td></tr><tr><td>Luas loss</td><td>${safeNumber(area)} ha</td></tr><tr><td>Dasar</td><td>${safeValue(p.priority_basis)}</td></tr><tr><td>Centroid</td><td>${c?c[1].toFixed(5)+', '+c[0].toFixed(5):'-'}</td></tr></table><div class="priority-note">Zona ini bersifat indikatif dan perlu diverifikasi dengan citra resolusi tinggi, data tata ruang, serta survei lapangan.</div></div>`;
}

function makeLayer(key,data){
  if(key==='priorityZones'){
    const colorByLevel={Tinggi:'#c0392b',Sedang:'#f39c12',Rendah:'#f1c40f'};
    return L.geoJSON(data,{style:f=>({color:colorByLevel[f.properties?.priority_level]||'#c0392b',weight:1.5,fillColor:colorByLevel[f.properties?.priority_level]||'#c0392b',fillOpacity:.55,dashArray:f.properties?.priority_level==='Rendah'?'4 3':null}),onEachFeature:(f,l)=>{l.bindPopup(priorityPopup(f));l.bindTooltip(`Prioritas ${safeValue(f.properties?.priority_level)} • ${safeNumber(f.properties?.area_ha)} ha`,{sticky:true})}});
  }
  if(['groundTruth2024','groundTruth2025','featureSamples2024','featureSamples2025'].includes(key)){
    return L.geoJSON(data,{pointToLayer:(f,ll)=>{const p=f.properties||{};let color;if(key.startsWith('groundTruth'))color=Number(p.class)===1?APP_CONFIG.colors.groundTruthVeg:APP_CONFIG.colors.groundTruthNon;else color=key==='featureSamples2024'?APP_CONFIG.colors.feature2024:APP_CONFIG.colors.feature2025;return L.circleMarker(ll,{radius:key.startsWith('groundTruth')?5:4,color:'#fff',weight:1,fillColor:color,fillOpacity:.88})},onEachFeature:(f,l)=>{l.bindPopup(pointPopup(f,key));l.bindTooltip(`${safeValue(f.properties?.sample_id)} • ${safeValue(f.properties?.label)}`,{sticky:true})}})
  }
  const c=APP_CONFIG.colors[key];const lineOnly=['boundary','districts'].includes(key);
  return L.geoJSON(data,{style:()=>({color:key==='boundary'?'#102c3a':key==='districts'?'#8bc34a':c,weight:key==='boundary'?2.4:key==='districts'?1.1:1,opacity:1,fillColor:c,fillOpacity:lineOnly?0:layerOpacity(key),dashArray:null}),onEachFeature:(f,l)=>{
    l.bindPopup(polygonPopup(f,key));
    if(key==='districts')l.bindTooltip(safeValue(f.properties?.NAME_3),{sticky:true});
    else if(!lineOnly)l.bindTooltip(`${safeValue(f.properties?.category)} • ${safeNumber(f.properties?.area_ha)} ha`,{sticky:true});
    if(!lineOnly)l.on({mouseover:e=>e.target.setStyle({weight:3,fillOpacity:Math.min(.95,(e.target.options.fillOpacity||.4)+.12)}),mouseout:e=>APP_STATE.layers[key].resetStyle(e.target)});
  }});
}


function getDistrictName(feature){
  const properties=feature?.properties||{};
  return String(
    properties.NAME_3 ??
    properties.name ??
    properties.NAMOBJ ??
    properties.kecamatan ??
    ''
  ).trim();
}

function findDistrict(name){
  if(!name||name==='all')return null;

  const features=APP_STATE.data.districts?.features||[];
  const normalized=String(name).trim().toLowerCase();

  return features.find(feature=>
    getDistrictName(feature).toLowerCase()===normalized
  )||null;
}

function populateDistrictFilter(){
  const select=document.getElementById('district-filter');
  if(!select)return;

  const names=(APP_STATE.data.districts?.features||[])
    .map(getDistrictName)
    .filter(Boolean)
    .filter((name,index,array)=>array.indexOf(name)===index)
    .sort((a,b)=>a.localeCompare(b,'id'));

  const selected=APP_STATE.selectedDistrict||'all';

  select.innerHTML=[
    '<option value="all">Seluruh Kota Ambon</option>',
    ...names.map(name=>`<option value="${name}">${name}</option>`)
  ].join('');

  select.value=names.includes(selected)?selected:'all';
}

function removeSelectedDistrictBoundary(){
  if(selectedDistrictBoundaryLayer&&webgisMap.hasLayer(selectedDistrictBoundaryLayer)){
    webgisMap.removeLayer(selectedDistrictBoundaryLayer);
  }
  selectedDistrictBoundaryLayer=null;
}

function showOnlySelectedDistrictBoundary(districtFeature){
  removeSelectedDistrictBoundary();

  // Boundary kota dan seluruh batas kecamatan disembunyikan.
  ['boundary','districts'].forEach(key=>{
    const layer=APP_STATE.layers[key];
    if(layer&&webgisMap.hasLayer(layer))webgisMap.removeLayer(layer);
    APP_STATE.activeOverlays.delete(key);
  });

  selectedDistrictBoundaryLayer=L.geoJSON(districtFeature,{
    style:{
      color:'#102c3a',
      weight:3.2,
      opacity:1,
      fillColor:'#8bc34a',
      fillOpacity:.08
    },
    onEachFeature:(feature,layer)=>{
      const name=getDistrictName(feature);
      layer.bindTooltip(`Kecamatan ${name}`,{
        permanent:false,
        sticky:true,
        direction:'top'
      });
      layer.bindPopup(`
        <div class="popup-heading">Boundary Kecamatan</div>
        <table class="popup-table">
          <tr><td>Kecamatan</td><td><b>${name||'—'}</b></td></tr>
          <tr><td>Kota</td><td>${feature.properties?.NAME_2||'Ambon'}</td></tr>
          <tr><td>Provinsi</td><td>${feature.properties?.NAME_1||'Maluku'}</td></tr>
          <tr><td>Geometry</td><td>${feature.geometry?.type||'—'}</td></tr>
        </table>
      `);
    }
  }).addTo(webgisMap);

  if(selectedDistrictBoundaryLayer.getBounds().isValid()){
    webgisMap.fitBounds(
      selectedDistrictBoundaryLayer.getBounds(),
      {padding:[24,24],maxZoom:13}
    );
  }
}

async function restoreAdministrativeBoundaries(){
  removeSelectedDistrictBoundary();

  await toggleLayer('boundary',true);
  await toggleLayer('districts',true);

  APP_STATE.layers.boundary?.bringToFront?.();
  APP_STATE.layers.districts?.bringToFront?.();
}

async function focusLayer(key){
  if(!['gain','loss','priorityZones'].includes(key))return;

  // Hanya satu layer fokus yang boleh terlihat.
  for(const otherKey of THEMATIC_LAYER_KEYS){
    await toggleLayer(otherKey,false);
  }

  await toggleLayer(key,true);

  // Boundary mengikuti filter kecamatan yang sedang dipilih.
  const selected=APP_STATE.selectedDistrict||'all';
  const district=findDistrict(selected);

  if(district){
    showOnlySelectedDistrictBoundary(district);
  }else{
    await restoreAdministrativeBoundaries();
  }

  const layer=APP_STATE.layers[key];
  if(layer?.getBounds?.().isValid()){
    webgisMap.fitBounds(layer.getBounds(),{
      padding:[24,24],
      maxZoom:13
    });
  }

  syncLayerToggleUI();
  updateLegend();
  updateActiveLayerStats();
}

async function renderMapLayers(){
  ['boundary','districts'].forEach(k=>{if(APP_STATE.data[k])APP_STATE.layers[k]=makeLayer(k,APP_STATE.data[k])});
  renderLayerToggles();
  await toggleLayer('boundary',true);
  await toggleLayer('districts',true);
  await toggleLayer('changeMap',true);
  populateDistrictFilter();
  const b=APP_STATE.layers.boundary;
  if(b?.getBounds?.().isValid()){
    webgisMap.invalidateSize(false);
    webgisMap.fitBounds(
      b.getBounds(),
      {
        paddingTopLeft:[55,55],
        paddingBottomRight:[55,55],
        maxZoom:11,
        animate:false
      }
    );
  }
  const status=document.getElementById('map-status');if(status)status.style.display='none';updateLegend();updateActiveLayerStats();
}

async function ensureLayer(key){
  if(APP_STATE.layers[key])return APP_STATE.layers[key];

  // Change Map memakai satu GeoJSON berisi empat kelas perubahan.
  if(key==='changeMap'){
    const data=await loadDataKey('changeMap');
    if(!data||data.type!=='FeatureCollection'){
      throw new Error('Change Map GeoJSON tidak valid atau tidak ditemukan.');
    }

    const labels={
      0:'Tetap non-vegetasi',
      1:'Gain vegetasi',
      2:'Loss vegetasi',
      3:'Tetap vegetasi'
    };
    const colors={
      0:'#bdc3c7',
      1:'#f1c40f',
      2:'#e74c3c',
      3:'#27ae60'
    };

    const layer=L.geoJSON(data,{
      style:feature=>{
        const p=feature.properties||{};
        const code=Number(
          p.change_code ??
          p.class_code ??
          p.class ??
          p.raster_value ??
          p.label
        );
        const color=colors[code]||'#999999';
        return {
          color,
          fillColor:color,
          weight:.45,
          opacity:1,
          fillOpacity:.74
        };
      },
      onEachFeature:(feature,item)=>{
        const p=feature.properties||{};
        const code=Number(
          p.change_code ??
          p.class_code ??
          p.class ??
          p.raster_value ??
          p.label
        );
        const area=num(p.area_ha,0);
        const cityArea=num(getSummary()?.luas_kota_ha,APP_CONFIG.fallback.cityArea);
        const percentage=cityArea>0?area/cityArea*100:0;

        item.bindPopup(`
          <div class="popup-heading">Perubahan Tutupan Lahan 2024–2025</div>
          <table class="popup-table">
            <tr><td>Kota</td><td><b>Kota Ambon</b></td></tr>
            <tr><td>Kategori</td><td><b>${labels[code]||'Tidak diketahui'}</b></td></tr>
            <tr><td>Change code</td><td>${Number.isFinite(code)?code:'—'}</td></tr>
            <tr><td>Periode</td><td>2024–2025</td></tr>
            <tr><td>Luas polygon</td><td>${safeNumber(area)} ha</td></tr>
            <tr><td>Persentase kota</td><td>${safeNumber(percentage)}%</td></tr>
            <tr><td>Geometry</td><td>${feature.geometry?.type||'—'}</td></tr>
          </table>
        `);
      }
    });

    APP_STATE.layers.changeMap=layer;
    return layer;
  }

  // Zona prioritas tidak memiliki file sendiri; dibuat dari polygon loss.
  if(key==='priorityZones'){
    const lossData=await loadDataKey('loss');
    if(!lossData||lossData.type!=='FeatureCollection'){
      throw new Error('Data loss diperlukan untuk membuat Zona Prioritas.');
    }
    APP_STATE.data.priorityZones=buildPriorityZones();
    const layer=makeLayer('priorityZones',APP_STATE.data.priorityZones);
    APP_STATE.layers.priorityZones=layer;
    return layer;
  }

  const supportedKeys=[
    'boundary','districts',
    'vegetation2024','vegetation2025',
    'gain','loss',
    'groundTruth2024','groundTruth2025',
    'featureSamples2024','featureSamples2025'
  ];

  if(supportedKeys.includes(key)){
    const data=await loadDataKey(key);
    if(!data||data.type!=='FeatureCollection'){
      throw new Error(`GeoJSON ${LAYER_META[key]?.[0]||key} tidak valid atau tidak ditemukan.`);
    }

    // Fungsi pembuat layer yang benar pada project ini adalah makeLayer().
    const layer=makeLayer(key,data);
    APP_STATE.layers[key]=layer;
    return layer;
  }

  throw new Error(`Layer ${key} belum memiliki loader.`);
}
function syncLayerToggleUI(){
  document.querySelectorAll('[data-layer]').forEach(input=>{
    input.checked=APP_STATE.activeOverlays.has(input.dataset.layer);
    input.disabled=false;
  });
}

function removeLayerFromMap(key){
  const layer=APP_STATE.layers[key];
  if(layer&&webgisMap.hasLayer(layer))webgisMap.removeLayer(layer);
  APP_STATE.activeOverlays.delete(key);
}

async function toggleLayer(key,on){
  const label=LAYER_META[key]?.[0]||key;

  try{
    // Change Map adalah master layer empat kelas.
    if(on&&key==='changeMap'){
      if(swipeActive)disableSwipeComparison(false);

      CHANGE_MAP_EXCLUSIVE_LAYERS.forEach(removeLayerFromMap);
      removeLayerFromMap('priorityZones');

      setMapStatus('Memuat Change Map empat kelas…',true);
      const layer=await ensureLayer('changeMap');
      if(!layer)throw new Error('GeoJSON Change Map tidak menghasilkan layer');

      if(!webgisMap.hasLayer(layer))layer.addTo(webgisMap);
      layer.bringToBack?.();
      APP_STATE.activeOverlays.add('changeMap');
    }
    else if(!on&&key==='changeMap'){
      // Mematikan master Change Map tidak menyalakan layer lain otomatis.
      removeLayerFromMap('changeMap');
    }
    else{
      // Layer individual selalu mematikan Change Map agar tidak bertumpuk.
      if(on&&CHANGE_MAP_EXCLUSIVE_LAYERS.includes(key)){
        if(swipeActive)disableSwipeComparison(false);
        removeLayerFromMap('changeMap');
      }

      if(on){
        setMapStatus(`Memuat layer ${label}…`,true);
        const layer=await ensureLayer(key);
        if(!layer)throw new Error(`Layer ${label} tidak tersedia`);
        if(!webgisMap.hasLayer(layer))layer.addTo(webgisMap);
        APP_STATE.activeOverlays.add(key);
      }else{
        removeLayerFromMap(key);
      }
    }

    APP_STATE.layers.boundary?.bringToFront?.();
    APP_STATE.layers.districts?.bringToFront?.();
  }catch(error){
    console.error(`Gagal mengubah layer ${label}:`,error);
    removeLayerFromMap(key);
    showLayerError(label,error);
  }finally{
    setMapStatus('',false);
    syncLayerToggleUI();
    updateLegend();
    updateActiveLayerStats();
  }
}
function updateLegend(){
  const el=document.getElementById('dynamic-legend');
  if(!el)return;

  if(swipeActive){
    el.innerHTML=`
      <div class="legend-title">Swipe Comparison 2024–2025</div>
      <div class="legend-item"><i class="legend-swatch" style="background:#27ae60"></i><span>Kiri: Vegetasi 2024</span></div>
      <div class="legend-item"><i class="legend-swatch" style="background:#e74c3c"></i><span>Kiri: Loss menuju 2025</span></div>
      <div class="legend-item"><i class="legend-swatch" style="background:#2980b9"></i><span>Kanan: Vegetasi 2025</span></div>
      <div class="legend-item"><i class="legend-swatch" style="background:#f1c40f"></i><span>Kanan: Gain dari 2024</span></div>`;
    el.style.display='block';
    return;
  }

  if(APP_STATE.activeOverlays.has('changeMap')){
    el.innerHTML=`
      <div class="legend-title">Perubahan Tutupan Lahan 2024–2025</div>
      <div class="legend-item"><i class="legend-swatch" style="background:#bdc3c7"></i><span>Tetap non-vegetasi</span></div>
      <div class="legend-item"><i class="legend-swatch" style="background:#f1c40f"></i><span>Gain vegetasi</span></div>
      <div class="legend-item"><i class="legend-swatch" style="background:#e74c3c"></i><span>Loss vegetasi</span></div>
      <div class="legend-item"><i class="legend-swatch" style="background:#27ae60"></i><span>Tetap vegetasi</span></div>`;
    el.style.display='block';
    return;
  }

  const active=[...APP_STATE.activeOverlays].filter(key=>!['boundary','districts'].includes(key));

  if(!active.length){
    el.innerHTML=`
      <div class="legend-title">Legenda</div>
      <div class="legend-empty">Aktifkan layer tematik untuk menampilkan legenda.</div>`;
    el.style.display='block';
    return;
  }

  const rows=active.map(key=>{
    const meta=LAYER_META[key]||[key,'#999999','polygon'];
    const isLine=meta[2]==='line';
    const style=isLine
      ? `background:transparent;border:2px solid ${meta[1]}`
      : `background:${meta[1]}`;

    return `<div class="legend-item"><i class="legend-swatch ${isLine?'line':''}" style="${style}"></i><span>${meta[0]}</span></div>`;
  }).join('');

  el.innerHTML=`<div class="legend-title">Layer Aktif</div>${rows}`;
  el.style.display='block';
}

function setMapStatus(message,show){const el=document.getElementById('map-status');if(!el)return;el.style.display=show?'flex':'none';if(show)el.innerHTML=`<span class="mini-spinner"></span>${message}`}
function renderLayerToggles(){
  const el=document.getElementById('layer-toggles');
  if(!el)return;

  el.innerHTML=Object.entries(LAYER_META).map(([key,[name,color,type]])=>{
    const isChangeMap=key==='changeMap';
    const swatchStyle=isChangeMap
      ? `background:linear-gradient(90deg,#bdc3c7 0 25%,#f1c40f 25% 50%,#e74c3c 50% 75%,#27ae60 75% 100%);border-color:#102c3a`
      : `background:${type==='line'?'transparent':color};border-color:${color}`;
    const helper=isChangeMap?'<small class="layer-helper">4 kelas perubahan</small>':'';

    return `<div class="layer-row ${isChangeMap?'change-map-row':''}">
      <span class="layer-name">
        <i class="swatch ${type==='line'?'line-swatch':''} ${isChangeMap?'multi-swatch':''}" style="${swatchStyle}"></i>
        <span>${name}${helper}</span>
      </span>
      <label class="switch" title="${isChangeMap?'Tampilkan empat kelas perubahan sekaligus':name}">
        <input type="checkbox" data-layer="${key}" ${APP_STATE.activeOverlays.has(key)?'checked':''}>
        <span class="slider"></span>
      </label>
    </div>`;
  }).join('');

  el.querySelectorAll('[data-layer]').forEach(input=>{
    input.addEventListener('change',async event=>{
      const current=event.currentTarget;
      const key=current.dataset.layer;
      const requested=current.checked;
      current.disabled=true;
      await toggleLayer(key,requested);
    });
  });

  syncLayerToggleUI();
}
async function applyDistrictFilter(name){
  APP_STATE.selectedDistrict=name||'all';

  const district=APP_STATE.selectedDistrict==='all'
    ? null
    : findDistrict(APP_STATE.selectedDistrict);

  if(district){
    showOnlySelectedDistrictBoundary(district);
  }else{
    APP_STATE.selectedDistrict='all';
    await restoreAdministrativeBoundaries();

    if(APP_STATE.layers.boundary?.getBounds?.().isValid()){
      webgisMap.fitBounds(
        APP_STATE.layers.boundary.getBounds(),
        {paddingTopLeft:[55,55],paddingBottomRight:[55,55],maxZoom:11,animate:false}
      );
    }
  }

  const stats=calculateDistrictStats(APP_STATE.selectedDistrict);
  renderKPIs(stats);

  const insight=document.getElementById('district-insight');
  if(insight){
    if(APP_STATE.selectedDistrict==='all'){
      insight.innerHTML=
        '<i class="fa-solid fa-circle-info"></i>'+
        '<span>Menampilkan ringkasan untuk seluruh Kota Ambon.</span>';
    }else{
      insight.innerHTML=`
        <i class="fa-solid fa-location-dot"></i>
        <span>
          Boundary yang ditampilkan hanya <b>Kecamatan ${APP_STATE.selectedDistrict}</b>.
          Vegetasi berubah dari
          ${safeNumber(stats.luas_vegetasi_2024_ha)} ha menjadi
          ${safeNumber(stats.luas_vegetasi_2025_ha)} ha,
          dengan perubahan bersih
          ${stats.perubahan_bersih_ha>=0?'+':''}${safeNumber(stats.perubahan_bersih_ha)} ha.
        </span>`;
    }
  }

  syncLayerToggleUI();
  updateActiveLayerStats();
}
function updateComparisonOpacity(value){const v=num(value,50);document.getElementById('compare-value').textContent=`${v} : ${100-v}`;['vegetation2024','vegetation2025'].forEach(k=>{const l=APP_STATE.layers[k];if(l)l.setStyle({fillOpacity:k==='vegetation2024'?v/100:(100-v)/100})})}
function activeLayerArea(key){if(!['vegetation2024','vegetation2025','gain','loss','priorityZones'].includes(key))return null;const selected=APP_STATE.selectedDistrict||'all';const stats=calculateDistrictStats(selected);return{vegetation2024:stats.luas_vegetasi_2024_ha,vegetation2025:stats.luas_vegetasi_2025_ha,gain:stats.luas_gain_ha,loss:stats.luas_loss_ha,priorityZones:stats.luas_loss_ha}[key]}
function updateActiveLayerStats(){const el=document.getElementById('active-layer-stats');if(!el)return;const active=[...APP_STATE.activeOverlays].filter(k=>!['boundary','districts'].includes(k));if(!active.length){el.innerHTML='<span class="section-label">LAYER AKTIF</span><strong>Belum ada layer tematik</strong><small>Aktifkan layer untuk melihat statistik.</small>';return}const key=active[active.length-1],meta=LAYER_META[key],data=APP_STATE.data[key];const area=activeLayerArea(key);el.innerHTML=`<span class="section-label">LAYER AKTIF</span><strong>${meta[0]}</strong><small>${key==='changeMap'?'GeoJSON empat kelas perubahan':`${data?.features?.length||0} fitur${area!==null?` • ${safeNumber(area)} ha`:''}`}</small>`}
function downloadBlob(filename,content,type){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function downloadActiveLayers(){const keys=[...APP_STATE.activeOverlays].filter(k=>APP_STATE.data[k]);if(!keys.length)return alert('Aktifkan minimal satu layer vektor terlebih dahulu.');const features=[];keys.forEach(k=>(APP_STATE.data[k].features||[]).forEach(f=>features.push({...f,properties:{...f.properties,webgis_layer:k}})));downloadBlob('layer_aktif_webgis_ambon.geojson',JSON.stringify({type:'FeatureCollection',features},null,2),'application/geo+json')}
function downloadStatistics(){const name=APP_STATE.selectedDistrict||'all',s=calculateDistrictStats(name);const rows=[['wilayah',name==='all'?'Kota Ambon':name],...Object.entries(s)];downloadBlob(`statistik_${name.replaceAll(' ','_')}.csv`,rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n'),'text/csv;charset=utf-8')}
