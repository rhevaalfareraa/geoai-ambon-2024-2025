function card(label,value,unit,color,icon){return `<article class="kpi-card" style="--kpi-color:${color}"><span class="kpi-icon"><i class="fa-solid ${icon}"></i></span><span class="kpi-label">${label}</span><strong class="kpi-value">${value}</strong><span class="kpi-unit">${unit||''}</span></article>`}function getSummary(){return APP_STATE.data.summary?.[0]||{}}function renderKPIs(customSummary){const s=customSummary||getSummary();document.getElementById('kpi-grid').innerHTML=[card('Luas Kota',safeNumber(s.luas_kota_ha||APP_CONFIG.fallback.cityArea),'ha','#102c3a','fa-expand'),card('Vegetasi 2024',safeNumber(s.luas_vegetasi_2024_ha),'ha','#27ae60','fa-tree'),card('Vegetasi 2025',safeNumber(s.luas_vegetasi_2025_ha),'ha','#2980b9','fa-tree'),card('Gain Vegetasi',safeNumber(s.luas_gain_ha),'ha','#f1c40f','fa-arrow-trend-up'),card('Loss Vegetasi',safeNumber(s.luas_loss_ha),'ha','#e74c3c','fa-arrow-trend-down'),card('Perubahan Bersih',(num(s.perubahan_bersih_ha)>=0?'+':'')+safeNumber(s.perubahan_bersih_ha),'ha','#27ae60','fa-chart-line'),card('Perubahan terhadap 2024',(num(s.persen_perubahan_terhadap_2024)>=0?'+':'')+safeNumber(s.persen_perubahan_terhadap_2024),'%','#f39c12','fa-percent')].join('')}function renderMethodology(){
  const items=[['fa-satellite','Dataset','COPERNICUS/S2_SR_HARMONIZED'],['fa-calendar-days','Periode','1 Jan–31 Des 2024 dan 2025'],['fa-cloud','Cloud Filter','CLOUDY_PIXEL_PERCENTAGE < 20%'],['fa-layer-group','Komposit','Cloud masking SCL dan median composite'],['fa-wave-square','Fitur','B2, B3, B4, B8, B11, B12, NDVI, NDWI, NDBI, BSI'],['fa-location-dot','Ground Truth','400 titik spasial; 200 sampel per tahun'],['fa-code-branch','Split','70% training dan 30% testing, seed 42'],['fa-tree','Model','Random Forest, 150 trees']];
  document.getElementById('method-cards').innerHTML=items.map(x=>`<article class="dashboard-card info-card"><span class="kpi-icon"><i class="fa-solid ${x[0]}"></i></span><div><strong>${x[1]}</strong><p>${x[2]}</p></div></article>`).join('');
  const flow=[
    ['fa-satellite-dish','Akuisisi Sentinel-2','Citra SR Harmonized tahun 2024 dan 2025'],
    ['fa-cloud-arrow-down','Cloud Filtering','CLOUDY_PIXEL_PERCENTAGE < 20%'],
    ['fa-cloud-sun','Cloud Masking','Eksklusi kelas SCL awan, bayangan, dan piksel tidak valid'],
    ['fa-images','Median Composite','Membentuk citra tahunan yang lebih stabil'],
    ['fa-wave-square','Band & Indeks','6 band spektral + NDVI, NDWI, NDBI, BSI'],
    ['fa-cubes-stacked','Feature Stack','Menggabungkan 10 fitur prediktor'],
    ['fa-location-crosshairs','Ground Truth','200 titik per tahun untuk vegetasi dan nonvegetasi'],
    ['fa-vial','Sampling Piksel','Ekstraksi nilai feature stack pada titik referensi'],
    ['fa-code-branch','Split 70:30','Training dan testing dengan seed tetap 42'],
    ['fa-tree','Random Forest','Pelatihan model ensemble dengan 150 trees'],
    ['fa-chart-column','Evaluasi Model','Confusion matrix, accuracy, precision, recall, F1, kappa'],
    ['fa-map','Klasifikasi Tahunan','Prediksi vegetasi dan nonvegetasi 2024–2025'],
    ['fa-code-compare','Change Detection','Gain, loss, tetap vegetasi, tetap nonvegetasi'],
    ['fa-globe','Publikasi WebGIS','Peta, statistik, insight, dan data unduhan']
  ];
  document.getElementById('workflow').innerHTML=flow.map((x,i)=>`<article class="flow-step"><span class="flow-number">${i+1}</span><i class="fa-solid ${x[0]}"></i><div><strong>${x[1]}</strong><p>${x[2]}</p></div></article>${i<flow.length-1?'<div class="flow-arrow"><i class="fa-solid fa-arrow-right"></i></div>':''}`).join('');
  const rows=[
    ['Sentinel-2 SR Harmonized','2024–2025','Raster multispektral','Sumber band dan indeks'],
    ['boundary_kota_ambon.geojson','—','GeoJSON • 1 fitur','Batas wilayah studi'],
    ['kecamatan_ambon.geojson','—','GeoJSON • 5 fitur','Filter administratif'],
    ['target_vegetasi_ambon_2024.geojson','2024','GeoJSON • 306 fitur','Hasil klasifikasi vegetasi'],
    ['target_vegetasi_ambon_2025.geojson','2025','GeoJSON • 277 fitur','Hasil klasifikasi vegetasi'],
    ['gain_vegetasi_ambon_2024_2025.geojson','2024–2025','GeoJSON • 769 fitur','Penambahan vegetasi'],
    ['loss_vegetasi_ambon_2024_2025.geojson','2024–2025','GeoJSON • 510 fitur','Kehilangan vegetasi'],
    ['Ground truth','2024–2025','GeoJSON • 400 titik','Training dan testing'],
    ['Feature stack samples','2024–2025','GeoJSON • 400 titik','Nilai 10 fitur spektral'],
    ['CSV evaluasi dan statistik','2024–2025','CSV','KPI, chart, dan validasi model']
  ];
  document.getElementById('dataset-table').innerHTML=`<table class="data-table"><thead><tr><th>Dataset</th><th>Tahun</th><th>Format/Jumlah</th><th>Fungsi</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table>`;
}
function renderEvaluation(){const rows=APP_STATE.data.evaluation||[],train=rows.find(r=>String(r.dataset).toLowerCase()==='training')||{},test=rows.find(r=>String(r.dataset).toLowerCase()==='testing')||{};document.getElementById('eval-kpis').innerHTML=[card('Training',safeNumber(train.jumlah_samples,0),'sampel','#102c3a','fa-database'),card('Testing',safeNumber(test.jumlah_samples,0),'sampel','#f1c40f','fa-vial'),card('Accuracy',safeNumber(num(test.overall_accuracy)*100),'%','#2980b9','fa-bullseye'),card('Precision',safeNumber(num(test.precision_target_1)*100),'%','#8bc34a','fa-crosshairs'),card('Recall',safeNumber(num(test.recall_target_1)*100),'%','#27ae60','fa-magnifying-glass-chart'),card('F1-score',safeNumber(num(test.f1_score_target_1)*100),'%','#f39c12','fa-scale-balanced'),card('Kappa',safeNumber(num(test.kappa)*100),'%','#102c3a','fa-handshake')].join('');renderAPRFChart(test);renderFeatureImportanceChart();renderSampleSplitChart(num(train.jumlah_samples),num(test.jumlah_samples));document.getElementById('confusion-matrix').innerHTML=`<div class="matrix-grid"><div></div><div class="matrix-label">Prediksi<br>Nonvegetasi</div><div class="matrix-label">Prediksi<br>Vegetasi</div><div class="matrix-label">Aktual<br>Nonvegetasi</div><div class="matrix-cell correct">${safeNumber(test.true_negative,0)}<span class="matrix-sub">TN</span></div><div class="matrix-cell error">${safeNumber(test.false_positive,0)}<span class="matrix-sub">FP</span></div><div class="matrix-label">Aktual<br>Vegetasi</div><div class="matrix-cell error">${safeNumber(test.false_negative,0)}<span class="matrix-sub">FN</span></div><div class="matrix-cell correct">${safeNumber(test.true_positive,0)}<span class="matrix-sub">TP</span></div></div>`;const sampleBox=document.getElementById('sample-distribution');if(sampleBox)sampleBox.innerHTML=`<div><b>${safeNumber(num(train.jumlah_samples)+num(test.jumlah_samples),0)}</b><span>Total sampel</span></div><div><b>70:30</b><span>Rasio split</span></div><div><b>42</b><span>Seed</span></div>`;const gap=(num(train.overall_accuracy)-num(test.overall_accuracy))*100;document.getElementById('evaluation-narrative').innerHTML=`<article class="narrative-card"><i class="fa-solid fa-circle-check"></i><h3>Generalisasi Baik</h3><p>Akurasi testing ${safeNumber(num(test.overall_accuracy)*100)}% menunjukkan performa tinggi pada data yang tidak digunakan melatih model.</p></article><article class="narrative-card"><i class="fa-solid fa-triangle-exclamation"></i><h3>Jenis Kesalahan</h3><p>Terdapat ${safeNumber(test.false_positive,0)} false positive dan ${safeNumber(test.false_negative,0)} false negative. Kesalahan lebih banyak berupa area nonvegetasi yang diprediksi sebagai vegetasi.</p></article><article class="narrative-card"><i class="fa-solid fa-code-compare"></i><h3>Selisih Training–Testing</h3><p>Selisih akurasi sekitar ${safeNumber(gap)} poin persentase. Ini perlu dipantau, tetapi belum menunjukkan penurunan generalisasi yang ekstrem.</p></article>`}function topFeatures(data,n=5){return (data?.features||[]).map((f,i)=>({f,i,area:num(f.properties?.area_ha),center:featureCenter(f)})).sort((a,b)=>b.area-a.area).slice(0,n)}function renderRanking(id,key){const items=topFeatures(APP_STATE.data[key]);document.getElementById(id).innerHTML=items.map((x,r)=>`<div class="rank-item" onclick="focusFeature('${key}',${x.i})"><span class="rank-num">${r+1}</span><span class="rank-info"><strong>${safeValue(x.f.properties?.category)}</strong><small>${x.center?x.center[1].toFixed(5)+', '+x.center[0].toFixed(5):'Koordinat tidak tersedia'}</small></span><span class="rank-area">${safeNumber(x.area)} ha</span></div>`).join('')}function renderInsights(){const s=getSummary(),change=APP_STATE.data.changeArea||[];document.getElementById('insight-summary').innerHTML=[card('Tetap Nonvegetasi',safeNumber(s.luas_tetap_nonvegetasi_ha),'ha','#bdc3c7','fa-square'),card('Gain',safeNumber(s.luas_gain_ha),'ha','#f1c40f','fa-plus'),card('Loss',safeNumber(s.luas_loss_ha),'ha','#e74c3c','fa-minus'),card('Tetap Vegetasi',safeNumber(s.luas_tetap_vegetasi_ha),'ha','#27ae60','fa-tree'),card('Vegetasi 2024',safeNumber(s.persen_vegetasi_2024),'%','#27ae60','fa-chart-pie'),card('Vegetasi 2025',safeNumber(s.persen_vegetasi_2025),'%','#2980b9','fa-chart-pie'),card('Net Change',(num(s.perubahan_bersih_ha)>=0?'+':'')+safeNumber(s.perubahan_bersih_ha),'ha','#f39c12','fa-chart-line')].join('');renderAreaChart(s);renderChangeChart(change);renderRanking('top-gain','gain');renderRanking('top-loss','loss');document.getElementById('insight-text').innerHTML=`<p>Luas vegetasi meningkat dari <b>${safeNumber(s.luas_vegetasi_2024_ha)} ha</b> pada 2024 menjadi <b>${safeNumber(s.luas_vegetasi_2025_ha)} ha</b> pada 2025. Perubahan bersih yang tercatat sebesar <b>${num(s.perubahan_bersih_ha)>=0?'+':''}${safeNumber(s.perubahan_bersih_ha)} ha</b>.</p><p>Gain seluas ${safeNumber(s.luas_gain_ha)} ha lebih besar daripada loss seluas ${safeNumber(s.luas_loss_ha)} ha. Hasil ini menunjukkan kecenderungan peningkatan tutupan yang diklasifikasikan sebagai vegetasi, tetapi belum dapat langsung disimpulkan sebagai keberhasilan rehabilitasi tanpa verifikasi lapangan dan pemeriksaan faktor musiman.</p>`;document.getElementById('limitations').innerHTML='<ul><li>Ground truth dibuat secara manual sehingga masih bergantung pada interpretasi visual.</li><li>Jumlah sampel 400 titik masih terbatas untuk mewakili seluruh variasi wilayah.</li><li>Resolusi 10 meter dapat menghasilkan piksel campuran.</li><li>Perbedaan musim, atmosfer, awan, dan bayangan dapat memengaruhi nilai spektral.</li><li>Model hanya membedakan vegetasi dan nonvegetasi.</li><li>Penyebab gain/loss belum diverifikasi melalui survei lapangan.</li></ul>'}
function pressureCategory(value){
  if(value>3)return ['Tinggi','pressure-high'];
  if(value>=1)return ['Sedang','pressure-medium'];
  return ['Rendah','pressure-low'];
}

function getDistrictAnalytics(){
  const features=APP_STATE.data.districts?.features||[];
  return features.map(f=>{
    const name=safeValue(f.properties?.NAME_3);
    const s=calculateDistrictStats(name);
    const pressure=s.luas_vegetasi_2024_ha?((s.luas_loss_ha/s.luas_vegetasi_2024_ha)*100):0;
    return {name,...s,pressure};
  }).sort((a,b)=>b.luas_loss_ha-a.luas_loss_ha);
}

function renderDistrictRanking(){
  const rows=getDistrictAnalytics();
  const el=document.getElementById('district-ranking');
  if(!el)return;
  el.innerHTML=`<table class="data-table"><thead><tr><th>Rank</th><th>Kecamatan</th><th>Vegetasi 2024</th><th>Vegetasi 2025</th><th>Gain</th><th>Loss</th><th>Net change</th><th>Tekanan</th></tr></thead><tbody>${rows.map((r,i)=>{const [label,cls]=pressureCategory(r.pressure);return `<tr><td>${i+1}</td><td><button class="district-link" onclick="openDistrictFromInsight('${String(r.name).replaceAll("'","\\'")}')">${r.name}</button></td><td>${safeNumber(r.luas_vegetasi_2024_ha)} ha</td><td>${safeNumber(r.luas_vegetasi_2025_ha)} ha</td><td>${safeNumber(r.luas_gain_ha)} ha</td><td>${safeNumber(r.luas_loss_ha)} ha</td><td>${r.perubahan_bersih_ha>=0?'+':''}${safeNumber(r.perubahan_bersih_ha)} ha</td><td><span class="pressure-badge ${cls}">${label} • ${safeNumber(r.pressure)}%</span></td></tr>`}).join('')}</tbody></table>`;
}

function openDistrictFromInsight(name){
  activateTab('map-tab');
  setTimeout(()=>{
    const select=document.getElementById('district-filter');
    if(select)select.value=name;
    Promise.resolve(applyDistrictFilter(name));
    webgisMap.invalidateSize();
  },250);
}

function renderUncertainty(){
  const rows=APP_STATE.data.evaluation||[];
  const test=rows.find(r=>String(r.dataset).toLowerCase()==='testing')||{};
  const accuracy=num(test.overall_accuracy)*100;
  const el=document.getElementById('uncertainty-panel');
  if(!el)return;
  el.innerHTML=`<div class="confidence-score"><div class="confidence-ring" style="--score:${accuracy}"><strong>${safeNumber(accuracy)}%</strong></div><div class="confidence-copy"><h3>Performa testing tinggi</h3><p>Akurasi testing menunjukkan model bekerja baik pada sampel pengujian, tetapi tidak menjamin seluruh area perubahan pasti benar di lapangan.</p></div></div><div class="confidence-list"><div><span>Precision vegetasi</span><b>${safeNumber(num(test.precision_target_1)*100)}%</b></div><div><span>Recall vegetasi</span><b>${safeNumber(num(test.recall_target_1)*100)}%</b></div><div><span>F1-score</span><b>${safeNumber(num(test.f1_score_target_1)*100)}%</b></div><div><span>Resolusi spasial</span><b>10 meter</b></div><div><span>Ground truth</span><b>400 titik</b></div><div><span>Kelas model</span><b>2 kelas</b></div></div>`;
}

function renderGovernmentRecommendations(){
  const items=[
    ['fa-binoculars','Verifikasi area loss terbesar','Periksa patch loss prioritas menggunakan citra resolusi tinggi, data izin, dan survei lapangan sebelum menetapkan penyebab perubahan.','DLH • Kecamatan'],
    ['fa-bell','Sistem peringatan dini','Gunakan WebGIS sebagai alat screening tahunan untuk mendeteksi lokasi perubahan baru dan mengarahkan inspeksi lebih cepat.','Bappeda • DLH'],
    ['fa-mountain-sun','Prioritas lereng dan kawasan rawan','Overlay area loss dengan kemiringan lereng, longsor, DAS, sempadan, dan kawasan lindung untuk menentukan tingkat urgensi.','BPBD • PUPR'],
    ['fa-map','Sinkronisasi tata ruang','Bandingkan loss dengan RTRW, pola ruang, izin bangunan, jaringan jalan, dan rencana pembangunan agar perubahan dapat dinilai secara kontekstual.','Bappeda • PUPR'],
    ['fa-seedling','Rehabilitasi terarah','Prioritaskan penghijauan pada loss yang luas, mengelompok, berulang, atau berada dekat wilayah rawan banjir dan longsor.','DLH'],
    ['fa-clipboard-check','Validasi gain vegetasi','Bedakan regenerasi alami, pertanian, penghijauan, dan efek musiman agar peningkatan vegetasi tidak langsung dianggap keberhasilan program.','DLH • Bappeda']
  ];
  const el=document.getElementById('government-recommendations');
  if(el)el.innerHTML=items.map(x=>`<article class="recommendation-item"><i class="fa-solid ${x[0]}"></i><h3>${x[1]}</h3><p>${x[2]}</p><span class="owner">${x[3]}</span></article>`).join('');
}

function renderActionPlan(){
  const items=[
    ['JANGKA PENDEK','0–6 bulan','Verifikasi prioritas','Validasi 5–10 patch loss terbesar, cek citra resolusi tinggi, dan dokumentasikan penyebab serta status lapangan.'],
    ['JANGKA MENENGAH','6–18 bulan','Integrasi data kebijakan','Tambahkan RTRW, rawan bencana, izin, jalan, permukiman, dan kawasan lindung untuk membangun zona prioritas yang lebih kuat.'],
    ['JANGKA PANJANG','Tahunan','Pemantauan berkelanjutan','Lakukan pembaruan citra dan ground truth secara berkala, evaluasi program penghijauan, dan bandingkan tren antarperiode.']
  ];
  const el=document.getElementById('action-plan');
  if(el)el.innerHTML=items.map((x,i)=>`<article class="timeline-item"><span class="timeline-num">${i+1}</span><span>${x[0]} • ${x[1]}</span><h3>${x[2]}</h3><p>${x[3]}</p></article>`).join('');
}

function renderInsightStatus(){
  const s=getSummary();
  const positive=document.getElementById('status-positive-text');
  const attention=document.getElementById('status-attention-text');
  if(positive)positive.innerHTML=`Vegetasi bertambah bersih <b>${safeNumber(s.perubahan_bersih_ha)} ha</b> atau <b>${safeNumber(s.persen_perubahan_terhadap_2024)}%</b> dibandingkan 2024.`;
  if(attention)attention.innerHTML=`Masih terdapat loss seluas <b>${safeNumber(s.luas_loss_ha)} ha</b> yang perlu diverifikasi dan dipantau.`;
}

function renderInsightEnhancements(){
  renderInsightStatus();
  renderDistrictRanking();
  renderUncertainty();
  renderGovernmentRecommendations();
  renderActionPlan();
  const button=document.getElementById('show-priority-layer');
  if(button&&!button.dataset.bound){
    button.dataset.bound='true';
    button.addEventListener('click',()=>{
      activateTab('map-tab');
      setTimeout(()=>{toggleLayer('priorityZones',true);renderLayerToggles();focusLayer('priorityZones');webgisMap.invalidateSize()},250);
    });
  }
}

const originalRenderInsights=renderInsights;
renderInsights=function(){
  originalRenderInsights();
  renderInsightEnhancements();
};
