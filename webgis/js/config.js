const APP_CONFIG = {
  title: 'Analisis Perubahan Vegetasi Kota Ambon 2024–2025',
  map: { center: [-3.68, 128.18], zoom: 11, minZoom: 9, maxZoom: 18 },
  paths: {
    changeMap: './data/spatial/rf_change_map_ambon_2024_2025.geojson',
    boundary: './data/spatial/boundary_kota_ambon.geojson',
    districts: './data/spatial/kecamatan_ambon.geojson',
    vegetation2024: './data/spatial/target_vegetasi_ambon_2024.geojson',
    vegetation2025: './data/spatial/target_vegetasi_ambon_2025.geojson',
    gain: './data/spatial/gain_vegetasi_ambon_2024_2025.geojson',
    loss: './data/spatial/loss_vegetasi_ambon_2024_2025.geojson',
    groundTruth2024: './data/spatial/ground_truth_ambon_2024_200_webgis.geojson',
    groundTruth2025: './data/spatial/ground_truth_ambon_2025_200_webgis.geojson',
    featureSamples2024: './data/spatial/feature_stack_samples_ambon_2024_200_v2.geojson',
    featureSamples2025: './data/spatial/feature_stack_samples_ambon_2025_200.geojson',
    evaluation: './data/statistics/Evaluasi_APRF_RF_Ambon_2024_2025.csv',
    area2024: './data/statistics/Luas_Kelas_RF_Ambon_2024.csv',
    area2025: './data/statistics/Luas_Kelas_RF_Ambon_2025.csv',
    changeArea: './data/statistics/Luas_Change_Map_RF_Ambon_2024_2025.csv',
    summary: './data/statistics/Ringkasan_Perubahan_Kuantitatif_Ambon_2024_2025.csv',
    testing: './data/supporting/RF_Testing_Result_Ambon_2024_2025.csv',
    samples: './data/supporting/RF_Samples_Ambon_2024_2025.csv',
    districtStats: './data/statistics/statistik_kecamatan_prahitung.json'
  },
  colors: {
    boundary: '#102c3a', districts: '#8bc34a', vegetation2024: '#27ae60', vegetation2025: '#2980b9',
    gain: '#f1c40f', loss: '#e74c3c', groundTruthVeg: '#27ae60', groundTruthNon: '#e74c3c',
    feature2024: '#8bc34a', feature2025: '#f39c12', stableNon: '#bdc3c7', stableVeg: '#27ae60'
  },
  fallback: { cityArea: 30414.180261 }
};
window.APP_STATE = { data: {}, layers: {}, charts: {}, activeOverlays: new Set(), loadedTabs: new Set(), loadingKeys: new Map() };
