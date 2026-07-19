function fitMapToWholeAmbon(){
  if(!window.webgisMap)return;

  const applyFit=()=>{
    webgisMap.invalidateSize(false);

    const boundaryLayer=APP_STATE.layers?.boundary;
    if(boundaryLayer?.getBounds?.().isValid()){
      webgisMap.fitBounds(
        boundaryLayer.getBounds(),
        {
          paddingTopLeft:[55,55],
          paddingBottomRight:[55,55],
          maxZoom:11,
          animate:false
        }
      );
    }else{
      webgisMap.setView([-3.695,128.18],10,{animate:false});
    }
  };

  requestAnimationFrame(applyFit);
  setTimeout(applyFit,180);
  setTimeout(applyFit,420);
}

async function activateTab(id){
  document.querySelectorAll('.tab-panel').forEach(x=>x.classList.toggle('active',x.id===id));
  document.querySelectorAll('.tab-btn').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));
  document.getElementById('main-nav')?.classList.remove('open');
  if(id==='map-tab'&&window.webgisMap)fitMapToWholeAmbon();
  if(id==='evaluation-tab'&&!APP_STATE.loadedTabs.has(id)){renderEvaluation();APP_STATE.loadedTabs.add(id)}
  if(id==='insight-tab'&&!APP_STATE.loadedTabs.has(id)){
    const el=document.getElementById('district-ranking');if(el)el.innerHTML='<div class="inline-loading"><span class="mini-spinner"></span> Menyiapkan analisis kecamatan…</div>';
    await new Promise(r=>setTimeout(r,20));renderInsights();APP_STATE.loadedTabs.add(id);
  }
  window.scrollTo({top:0,behavior:'smooth'});
}
function initializeTabs(){
  document.querySelectorAll('.tab-btn').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.tab)));
  document.querySelectorAll('[data-open-tab]').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.openTab)));
  document.getElementById('mobile-menu')?.addEventListener('click',()=>document.getElementById('main-nav')?.classList.toggle('open'));
}
function setFocusButtonState(activeKey=null){
  const gainButton=document.getElementById('focus-gain-button');
  const lossButton=document.getElementById('focus-loss-button');

  gainButton?.classList.toggle('focus-active',activeKey==='gain');
  lossButton?.classList.toggle('focus-active',activeKey==='loss');
}

window.runFocusButton=async function(key,button){
  if(!['gain','loss'].includes(key))return;

  const originalText=key==='gain'?'Fokus Gain':'Fokus Loss';
  const label=button?.querySelector('span');

  try{
    document.getElementById('focus-gain-button')?.setAttribute('disabled','disabled');
    document.getElementById('focus-loss-button')?.setAttribute('disabled','disabled');

    button?.classList.add('is-loading');
    if(label)label.textContent='Memuat…';

    await focusLayer(key);
    setFocusButtonState(key);
  }catch(error){
    console.error(`Fokus ${key} gagal:`,error);
    showLayerError(
      key==='gain'?'Gain Vegetasi':'Loss Vegetasi',
      error
    );
  }finally{
    button?.classList.remove('is-loading');
    if(label)label.textContent=originalText;

    document.getElementById('focus-gain-button')?.removeAttribute('disabled');
    document.getElementById('focus-loss-button')?.removeAttribute('disabled');
  }
};

window.runResetMapButton=async function(button){
  const label=button?.querySelector('span');

  try{
    button?.setAttribute('disabled','disabled');
    button?.classList.add('is-loading');
    if(label)label.textContent='Mereset…';

    // Matikan seluruh layer yang sedang aktif.
    for(const key of Object.keys(APP_STATE.layers)){
      const layer=APP_STATE.layers[key];
      if(layer&&webgisMap.hasLayer(layer)){
        webgisMap.removeLayer(layer);
      }
    }

    // Bersihkan seluruh state toggle aktif.
    APP_STATE.activeOverlays.clear();

    // Hapus boundary kecamatan pilihan jika ada.
    removeSelectedDistrictBoundary?.();

    // Reset filter wilayah.
    APP_STATE.selectedDistrict='all';
    const districtFilter=document.getElementById('district-filter');
    if(districtFilter)districtFilter.value='all';

    // Aktifkan hanya layer default setelah reset.
    await toggleLayer('boundary',true);
    await toggleLayer('districts',true);
    await toggleLayer('changeMap',true);

    // Pastikan semua toggle lain benar-benar OFF di UI.
    syncLayerToggleUI();
    renderLayerToggles();
    setFocusButtonState(null);
    updateLegend();
    updateActiveLayerStats();

    if(APP_STATE.layers.boundary?.getBounds?.().isValid()){
      webgisMap.fitBounds(
        APP_STATE.layers.boundary.getBounds(),
        {padding:[12,12]}
      );
    }
  }catch(error){
    console.error('Reset peta gagal:',error);
    showLayerError('Reset Peta',error);
  }finally{
    button?.classList.remove('is-loading');
    button?.removeAttribute('disabled');
    if(label)label.textContent='Reset Peta';
  }
};

function initializeControls(){

  document.getElementById('district-filter')?.addEventListener(
    'change',
    async event=>await applyDistrictFilter(event.target.value)
  );

  document.getElementById('download-active')?.addEventListener(
    'click',
    downloadActiveLayers
  );

  document.getElementById('download-stats')?.addEventListener(
    'click',
    downloadStatistics
  );
}
function hideAppLoader(){document.getElementById('app-loader')?.classList.add('hidden')}
document.addEventListener('DOMContentLoaded',async()=>{
  const timeout=setTimeout(hideAppLoader,8000);
  try{
    window.scrollTo({top:0,behavior:'auto'});initializeTabs();initializeMap();initializeControls();await loadAllData();
    await renderMapLayers();renderKPIs();renderMethodology();await applyDistrictFilter('all');
  }catch(error){console.error('Inisialisasi gagal:',error);const status=document.getElementById('map-status');if(status){status.style.display='flex';status.textContent=''}}
  finally{clearTimeout(timeout);setTimeout(hideAppLoader,120)}
});
