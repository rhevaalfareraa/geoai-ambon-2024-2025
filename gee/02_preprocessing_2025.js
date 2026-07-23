// ============================================================
// GEOAI UAS — KOTA AMBON
// PEMBUATAN GT + PREPROCESSING SENTINEL-2 TAHUN 2024
//
// IMPORTS WAJIB:
// - vegetasi     : FeatureCollection, 100 titik
// - non_vegetasi : FeatureCollection, 100 titik
//s
// GROUND TRUTH:
// - Vegetasi     = 100 titik
// - Non-Vegetasi = 100 titik
// - Total        = 200 titik
//
// DATA:
// COPERNICUS/S2_SR_HARMONIZED
//
// PERIODE CITRA:
// 1 Januari 2024 – 31 Desember 2024
//
// OUTPUT:
// 1. Ground Truth 2024 sebanyak 200 Point
// 2. Composite median Sentinel-2 2024
// 3. NDVI, NDWI, NDBI, dan BSI
// 4. Feature Stack 2024
// 5. Sampel valid Ground Truth
// 6. Export Ground Truth dan Feature Stack
// ============================================================

// ============================================================
// 1. KONFIGURASI UTAMA
// ============================================================

var CONFIG = {
  boundaryAsset: "projects/gee-rheva-alfarera/assets/kota_ambon",

  groundTruthOutputAsset:
    "projects/gee-rheva-alfarera/assets/ground_truth_2024_200_v2",

  featureStackAsset:
    "projects/gee-rheva-alfarera/assets/feature_stack_2024_200_v2",

  sentinelDataset: "COPERNICUS/S2_SR_HARMONIZED",

  // 1 Januari 2024
  startDate: "2025-01-01",

  // Eksklusif: 1 Januari 2025 tidak ikut.
  // Dengan demikian, 31 Desember 2024 tetap tercakup.
  endDate: "2026-01-01",

  cloudPercentage: 20,

  scale: 10,

  exportFolder: "GeoAI_UAS",

  exportCRS: "EPSG:4326",

  maxPixels: 1e13,

  targetVegetasi: 100,

  targetNonVegetasi: 100,

  targetTotal: 200,
};

print("Konfigurasi preprocessing 2024:", CONFIG);

// ============================================================
// 2. DAFTAR BAND DAN FITUR
// ============================================================

var spectralBands = ["B2", "B3", "B4", "B8", "B11", "B12"];

var featureBands = [
  "B2",
  "B3",
  "B4",
  "B8",
  "B11",
  "B12",
  "NDVI",
  "NDWI",
  "NDBI",
  "BSI",
];

print("Band spektral:", spectralBands);

print("Fitur Feature Stack:", featureBands);

// ============================================================
// 3. LOAD BOUNDARY KOTA AMBON
// ============================================================

var boundary = ee.FeatureCollection(CONFIG.boundaryAsset);

var studyArea = boundary.geometry();

// Digunakan agar lebih ringan dibanding Map.centerObject().
Map.setCenter(128.2, -3.7, 11);

print("Jumlah fitur boundary:", boundary.size());

var boundaryStyle = boundary.style({
  color: "000000",
  fillColor: "00000000",
  width: 2,
});

// ============================================================
// 4. MEMBUAT GROUND TRUTH VEGETASI 2024 SEBAGAI POINT
// ============================================================

var gtVegetasi2024 = ee.FeatureCollection(vegetation).map(function (feature) {
  feature = ee.Feature(feature);

  // Memaksa geometry menjadi Point.
  // Jika input sudah Point, posisinya tetap sama.
  // Jika input bukan Point, digunakan titik centroid.
  var pointGeometry = feature.geometry().centroid(1);

  return ee.Feature(pointGeometry, {
    class: 1,
    year: 2024,
    label: "vegetasi",
  });
});

// ============================================================
// 5. MEMBUAT GROUND TRUTH NON-VEGETASI 2024 SEBAGAI POINT
// ============================================================

var gtNonVegetasi2024 = ee
  .FeatureCollection(non_vegetation)
  .map(function (feature) {
    feature = ee.Feature(feature);

    var pointGeometry = feature.geometry().centroid(1);

    return ee.Feature(pointGeometry, {
      class: 0,
      year: 2024,
      label: "non_vegetasi",
    });
  });

// ============================================================
// 6. TAMBAHKAN SAMPLE ID VEGETASI
// ============================================================

var vegetationList2024 = gtVegetasi2024.toList(gtVegetasi2024.size());

var vegetationIndexes2024 = ee.List.sequence(
  0,
  gtVegetasi2024.size().subtract(1),
);

var gtVegetasi2024WithId = ee.FeatureCollection(
  vegetationIndexes2024.map(function (index) {
    index = ee.Number(index);

    var feature = ee.Feature(vegetationList2024.get(index));

    var sampleId = ee.String("VEG_2024_").cat(index.add(1).format("%03d"));

    return feature.set({
      sample_id: sampleId,
      class: 1,
      year: 2024,
      label: "vegetasi",
    });
  }),
);

// ============================================================
// 7. TAMBAHKAN SAMPLE ID NON-VEGETASI
// ============================================================

var nonVegetationList2024 = gtNonVegetasi2024.toList(gtNonVegetasi2024.size());

var nonVegetationIndexes2024 = ee.List.sequence(
  0,
  gtNonVegetasi2024.size().subtract(1),
);

var gtNonVegetasi2024WithId = ee.FeatureCollection(
  nonVegetationIndexes2024.map(function (index) {
    index = ee.Number(index);

    var feature = ee.Feature(nonVegetationList2024.get(index));

    var sampleId = ee.String("NONVEG_2024_").cat(index.add(1).format("%03d"));

    return feature.set({
      sample_id: sampleId,
      class: 0,
      year: 2024,
      label: "non_vegetasi",
    });
  }),
);

// ============================================================
// 8. GABUNGKAN GROUND TRUTH 2024
// ============================================================

var groundTruth2024 = gtVegetasi2024WithId.merge(gtNonVegetasi2024WithId);

// ============================================================
// TAMBAHKAN KOORDINAT PADA SETIAP TITIK
// ============================================================

groundTruth2024 = groundTruth2024.map(function (feature) {
  feature = ee.Feature(feature);

  var pointGeometry = feature.geometry().centroid(1);

  var coordinates = pointGeometry.coordinates();

  var longitude = ee.Number(coordinates.get(0));

  var latitude = ee.Number(coordinates.get(1));

  return ee.Feature(pointGeometry, feature.toDictionary()).set({
    longitude: longitude,
    latitude: latitude,
    geometry_type: pointGeometry.type(),
  });
});

var jumlahGTVegetasi2024 = gtVegetasi2024WithId.size();

var jumlahGTNonVegetasi2024 = gtNonVegetasi2024WithId.size();

var jumlahTotalGT2024 = groundTruth2024.size();

print("========================================");
print("PEMERIKSAAN GROUND TRUTH 2024");
print("========================================");

print("Jumlah GT Vegetasi 2024:", jumlahGTVegetasi2024);

print("Jumlah GT Non-Vegetasi 2024:", jumlahGTNonVegetasi2024);

print("Jumlah seluruh Ground Truth 2024:", jumlahTotalGT2024);

print(
  "Distribusi kelas Ground Truth 2024:",
  groundTruth2024.aggregate_histogram("class"),
);

print(
  "Distribusi tahun Ground Truth 2024:",
  groundTruth2024.aggregate_histogram("year"),
);

print(
  "Jenis geometry Ground Truth:",
  groundTruth2024.first().geometry().type(),
);

print(
  "Koordinat Ground Truth pertama:",
  groundTruth2024.first().geometry().coordinates(),
);

print(
  "Distribusi geometry type:",
  groundTruth2024.aggregate_histogram("geometry_type"),
);

print("Properti Ground Truth:", groundTruth2024.first().propertyNames());

print("Contoh Ground Truth 2024:", groundTruth2024.limit(5));

// ============================================================
// 9. VALIDASI JUMLAH GROUND TRUTH
// ============================================================

var statusVegetasi = ee.Algorithms.If(
  jumlahGTVegetasi2024.eq(CONFIG.targetVegetasi),
  "SESUAI: Vegetasi = 100 Point",
  "BELUM SESUAI: Vegetasi bukan 100 Point",
);

var statusNonVegetasi = ee.Algorithms.If(
  jumlahGTNonVegetasi2024.eq(CONFIG.targetNonVegetasi),
  "SESUAI: Non-vegetasi = 100 Point",
  "BELUM SESUAI: Non-vegetasi bukan 100 Point",
);

var statusTotal = ee.Algorithms.If(
  jumlahTotalGT2024.eq(CONFIG.targetTotal),
  "SESUAI: Total Ground Truth = 200 Point",
  "BELUM SESUAI: Total Ground Truth bukan 200 Point",
);

var statusSeimbang = ee.Algorithms.If(
  jumlahGTVegetasi2024.eq(jumlahGTNonVegetasi2024),
  "GROUND TRUTH SEIMBANG",
  "GROUND TRUTH TIDAK SEIMBANG",
);

print("Status GT Vegetasi:", statusVegetasi);

print("Status GT Non-Vegetasi:", statusNonVegetasi);

print("Status total Ground Truth:", statusTotal);

print("Status distribusi kelas:", statusSeimbang);

// ============================================================
// 10. TAMPILKAN GROUND TRUTH
// ============================================================

Map.addLayer(
  gtVegetasi2024WithId,
  {
    color: "00FF00",
    pointSize: 5,
  },
  "GT Vegetasi 2024 — 100 Point",
  false,
);

Map.addLayer(
  gtNonVegetasi2024WithId,
  {
    color: "FF0000",
    pointSize: 5,
  },
  "GT Non-Vegetasi 2024 — 100 Point",
  false,
);

// ============================================================
// 11. FUNGSI CLOUD MASKING SENTINEL-2
// ============================================================
//
// Kelas SCL yang dihapus:
//
// 0  = No data
// 1  = Saturated/defective
// 3  = Cloud shadow
// 8  = Cloud medium probability
// 9  = Cloud high probability
// 10 = Thin cirrus
// 11 = Snow/ice
//
// Nilai reflektansi dibagi 10.000.
// ============================================================

function maskS2Clouds(image) {
  var scl = image.select("SCL");

  var clearMask = scl
    .neq(0)
    .and(scl.neq(1))
    .and(scl.neq(3))
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  return image
    .select(spectralBands)
    .divide(10000)
    .updateMask(clearMask)
    .copyProperties(image, ["system:time_start", "CLOUDY_PIXEL_PERCENTAGE"]);
}

// ============================================================
// 12. KOLEKSI SENTINEL-2 TAHUN 2024
// ============================================================

var sentinel2024 = ee
  .ImageCollection(CONFIG.sentinelDataset)
  .filterBounds(studyArea)
  .filterDate(CONFIG.startDate, CONFIG.endDate)
  .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", CONFIG.cloudPercentage))
  .map(maskS2Clouds);

print("========================================");
print("PEMERIKSAAN SENTINEL-2 2024");
print("========================================");

print("Periode filterDate:", CONFIG.startDate, CONFIG.endDate);

print("Jumlah citra Sentinel-2 2024:", sentinel2024.size());

var statusKoleksi = ee.Algorithms.If(
  sentinel2024.size().gt(0),
  "KOLEKSI SENTINEL-2 2024 TERSEDIA",
  "ERROR: KOLEKSI SENTINEL-2 2024 KOSONG",
);

print("Status koleksi:", statusKoleksi);

// ============================================================
// 12A. DAFTAR TANGGAL AKUISISI SENTINEL-2 2024
// ============================================================
//
// Menampilkan:
// 1. Jumlah seluruh scene/citra yang lolos filter
// 2. Seluruh tanggal akuisisi
// 3. Tanggal akuisisi unik
// 4. Jumlah hari akuisisi unik
// 5. Jumlah scene pada setiap tanggal
//
// CATATAN:
// - Periode analisis = 1 Januari–31 Desember 2024
// - Tahun 2024 memiliki 366 hari kalender
// - Jumlah hari akuisisi unik tidak selalu 366 hari
// ============================================================

var sentinel2024WithDate = sentinel2024.map(function (image) {
  var acquisitionDate = ee
    .Date(image.get("system:time_start"))
    .format("YYYY-MM-dd");

  return image.set({
    acquisition_date: acquisitionDate,
  });
});

var seluruhTanggalAkuisisi2024 = ee
  .List(sentinel2024WithDate.aggregate_array("acquisition_date"))
  .sort();

var tanggalAkuisisiUnik2024 = seluruhTanggalAkuisisi2024.distinct().sort();

var jumlahHariKalender2024 = ee
  .Date(CONFIG.endDate)
  .difference(ee.Date(CONFIG.startDate), "day");

var jumlahHariAkuisisiUnik2024 = tanggalAkuisisiUnik2024.size();

var tabelTanggalAkuisisi2024 = ee.FeatureCollection(
  tanggalAkuisisiUnik2024.map(function (dateString) {
    dateString = ee.String(dateString);

    var tanggalMulai = ee.Date.parse("YYYY-MM-dd", dateString);

    var tanggalBerikutnya = tanggalMulai.advance(1, "day");

    var koleksiPerTanggal = sentinel2024WithDate.filterDate(
      tanggalMulai,
      tanggalBerikutnya,
    );

    return ee.Feature(null, {
      tanggal_akuisisi: dateString,
      jumlah_scene: koleksiPerTanggal.size(),
    });
  }),
);

print("========================================");
print("RINGKASAN TANGGAL AKUISISI 2024");
print("========================================");

print("Periode analisis:", CONFIG.startDate, "sampai 31 Desember 2024");

print("Jumlah hari kalender:", jumlahHariKalender2024);

print("Jumlah seluruh scene/citra yang lolos filter:", sentinel2024.size());

print("Seluruh tanggal akuisisi:", seluruhTanggalAkuisisi2024);

print("Tanggal akuisisi unik:", tanggalAkuisisiUnik2024);

print("Jumlah hari akuisisi unik:", jumlahHariAkuisisiUnik2024);

print("Jumlah scene per tanggal:", tabelTanggalAkuisisi2024);

// ============================================================
// 13. COMPOSITE MEDIAN SENTINEL-2 2024
// ============================================================

var composite2024 = sentinel2024.median().clip(studyArea).toFloat();

print("Band Composite 2024:", composite2024.bandNames());

// ============================================================
// 14. HITUNG NDVI 2024
// ============================================================
//
// NDVI = (B8 - B4) / (B8 + B4)
// ============================================================

var ndvi2024 = composite2024
  .normalizedDifference(["B8", "B4"])
  .rename("NDVI")
  .toFloat();

// ============================================================
// 15. HITUNG NDWI 2024
// ============================================================
//
// NDWI = (B3 - B8) / (B3 + B8)
// ============================================================

var ndwi2024 = composite2024
  .normalizedDifference(["B3", "B8"])
  .rename("NDWI")
  .toFloat();

// ============================================================
// 16. HITUNG NDBI 2024
// ============================================================
//
// NDBI = (B11 - B8) / (B11 + B8)
// ============================================================

var ndbi2024 = composite2024
  .normalizedDifference(["B11", "B8"])
  .rename("NDBI")
  .toFloat();

// ============================================================
// 17. HITUNG BSI 2024
// ============================================================
//
// BSI =
// ((B11 + B4) - (B8 + B2))
// ---------------------------
// ((B11 + B4) + (B8 + B2))
// ============================================================

var bsi2024 = composite2024
  .expression(
    "((SWIR1 + RED) - (NIR + BLUE)) / " + "((SWIR1 + RED) + (NIR + BLUE))",
    {
      SWIR1: composite2024.select("B11"),

      RED: composite2024.select("B4"),

      NIR: composite2024.select("B8"),

      BLUE: composite2024.select("B2"),
    },
  )
  .rename("BSI")
  .toFloat();

// ============================================================
// 18. MEMBUAT FEATURE STACK 2024
// ============================================================

var featureStack2024 = composite2024
  .select(spectralBands)
  .addBands(ndvi2024)
  .addBands(ndwi2024)
  .addBands(ndbi2024)
  .addBands(bsi2024)
  .select(featureBands)
  .toFloat()
  .clip(studyArea);

print("Band Feature Stack 2024:", featureStack2024.bandNames());

print("Jumlah band Feature Stack 2024:", featureStack2024.bandNames().size());

print(
  "Apakah semua fitur tersedia?",
  featureStack2024.bandNames().containsAll(featureBands),
);

// ============================================================
// 19. PARAMETER VISUALISASI
// ============================================================

var rgbVis = {
  bands: ["B4", "B3", "B2"],
  min: 0,
  max: 0.3,
  gamma: 1.2,
};

var ndviVis = {
  min: -1,
  max: 1,
  palette: ["0000FF", "FFFFFF", "FFFF00", "008000"],
};

var ndwiVis = {
  min: -1,
  max: 1,
  palette: ["8C510A", "FFFFFF", "00BFFF", "0000FF"],
};

var ndbiVis = {
  min: -1,
  max: 1,
  palette: ["006400", "FFFFFF", "FFA500", "FF0000"],
};

var bsiVis = {
  min: -1,
  max: 1,
  palette: ["006400", "FFFFFF", "DEB887", "8B4513"],
};

// ============================================================
// 20. TAMPILKAN LAYER
// ============================================================

Map.addLayer(composite2024, rgbVis, "RGB Sentinel-2 Ambon 2024", true);

Map.addLayer(ndvi2024, ndviVis, "NDVI Ambon 2024", false);

Map.addLayer(ndwi2024, ndwiVis, "NDWI Ambon 2024", false);

Map.addLayer(ndbi2024, ndbiVis, "NDBI Ambon 2024", false);

Map.addLayer(bsi2024, bsiVis, "BSI Ambon 2024", false);

// ============================================================
// 21. AMBIL NILAI PIKSEL PADA GROUND TRUTH
// ============================================================

var samples2024Raw = featureStack2024.sampleRegions({
  collection: groundTruth2024,

  properties: ["sample_id", "class", "year", "label"],

  scale: CONFIG.scale,

  geometries: true,

  tileScale: 8,
});

// ============================================================
// 22. FILTER SAMPEL VALID
// ============================================================

var samples2024 = samples2024Raw.filter(
  ee.Filter.notNull(featureBands.concat(["class"])),
);

var jumlahSampelRaw = samples2024Raw.size();

var jumlahSampelValid = samples2024.size();

// Dibandingkan dengan jumlah GT awal,
// bukan jumlah sample raw.
var jumlahSampelTidakValid = jumlahTotalGT2024.subtract(jumlahSampelValid);

print("========================================");
print("VALIDASI SAMPEL GROUND TRUTH 2024");
print("========================================");

print("Jumlah Ground Truth awal:", jumlahTotalGT2024);

print("Jumlah sampel raw 2024:", jumlahSampelRaw);

print("Jumlah sampel valid 2024:", jumlahSampelValid);

print("Jumlah sampel tidak valid 2024:", jumlahSampelTidakValid);

print(
  "Distribusi kelas sampel valid:",
  samples2024.aggregate_histogram("class"),
);

print(
  "Sampel valid vegetasi:",
  samples2024.filter(ee.Filter.eq("class", 1)).size(),
);

print(
  "Sampel valid non-vegetasi:",
  samples2024.filter(ee.Filter.eq("class", 0)).size(),
);

// ============================================================
// 23. IDENTIFIKASI TITIK TIDAK VALID
// ============================================================

var validSampleIds = ee.List(samples2024.aggregate_array("sample_id"));

var invalidPoints2024 = groundTruth2024.filter(
  ee.Filter.inList("sample_id", validSampleIds).not(),
);

print("Jumlah titik tidak valid:", invalidPoints2024.size());

print(
  "Sample ID titik tidak valid:",
  invalidPoints2024.aggregate_array("sample_id"),
);

// ============================================================
// 24. TAMPILKAN TITIK VALID DAN TIDAK VALID
// ============================================================

Map.addLayer(
  samples2024,
  {
    color: "0000FF",
    pointSize: 4,
  },
  "Titik Valid 2024",
  false,
);

Map.addLayer(
  invalidPoints2024,
  {
    color: "FFFF00",
    pointSize: 8,
  },
  "Titik Tidak Valid 2024",
  false,
);

Map.addLayer(boundaryStyle, {}, "Boundary Kota Ambon", true);

// ============================================================
// 25. TABEL RINGKASAN GROUND TRUTH
// ============================================================

var groundTruthSummary = ee.FeatureCollection([
  ee.Feature(null, {
    year: 2024,

    periode_mulai: CONFIG.startDate,

    periode_akhir_eksklusif: CONFIG.endDate,

    jumlah_vegetasi: jumlahGTVegetasi2024,

    jumlah_non_vegetasi: jumlahGTNonVegetasi2024,

    jumlah_total_gt: jumlahTotalGT2024,

    jumlah_sampel_raw: jumlahSampelRaw,

    jumlah_sampel_valid: jumlahSampelValid,

    jumlah_sampel_tidak_valid: jumlahSampelTidakValid,

    target_total: CONFIG.targetTotal,

    status_distribusi: statusSeimbang,
  }),
]);

print("Ringkasan Ground Truth 2024:", groundTruthSummary);

// ============================================================
// 26. TABEL REPRODUCIBILITY
// ============================================================

var reproducibilityTable2024 = ee.FeatureCollection([
  ee.Feature(null, {
    wilayah: "Kota Ambon",

    tahun: 2024,

    boundary_asset: CONFIG.boundaryAsset,

    ground_truth_output_asset: CONFIG.groundTruthOutputAsset,

    feature_stack_output_asset: CONFIG.featureStackAsset,

    dataset: CONFIG.sentinelDataset,

    periode_mulai: CONFIG.startDate,

    periode_akhir_eksklusif: CONFIG.endDate,

    periode_deskriptif: "1 Januari 2024 - 31 Desember 2024",

    cloud_filter_percent: CONFIG.cloudPercentage,

    cloud_mask: "SCL 0, 1, 3, 8, 9, 10, 11",

    reflectance_scale: "Dibagi 10000",

    composite_method: "Median",

    spectral_bands: spectralBands.join(", "),

    indices: "NDVI, NDWI, NDBI, BSI",

    feature_stack: featureBands.join(", "),

    scale_meter: CONFIG.scale,

    jumlah_citra: sentinel2024.size(),

    jumlah_ground_truth: jumlahTotalGT2024,

    jumlah_sampel_valid: jumlahSampelValid,

    jumlah_sampel_tidak_valid: jumlahSampelTidakValid,
  }),
]);

print("Reproducibility Table 2024:", reproducibilityTable2024);

// ============================================================
// 27. EXPORT GROUND TRUTH 2024 KE ASSET
// ============================================================

Export.table.toAsset({
  collection: groundTruth2024,

  description: "Export_Ground_Truth_Ambon_2024_200_Point_With_Coordinates",

  assetId: CONFIG.groundTruthOutputAsset,
});

// ============================================================
// 28. EXPORT GROUND TRUTH 2024 KE GEOJSON
// ============================================================

Export.table.toDrive({
  collection: groundTruth2024,

  description: "Ground_Truth_Ambon_2024_200_Point_GeoJSON",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "ground_truth_ambon_2024_200_point",

  fileFormat: "GeoJSON",
});

// ============================================================
// 29. EXPORT GROUND TRUTH 2024 KE CSV
// ============================================================

Export.table.toDrive({
  collection: groundTruth2024,

  description: "Ground_Truth_Ambon_2024_200_Point_CSV",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "ground_truth_ambon_2024_200_point",

  fileFormat: "CSV",

  selectors: [
    "sample_id",
    "class",
    "year",
    "label",
    "longitude",
    "latitude",
    "geometry_type",
    ".geo",
  ],
});

// ============================================================
// 30. EXPORT COMPOSITE SENTINEL-2 2024
// ============================================================

Export.image.toDrive({
  image: composite2024,

  description: "Composite_Sentinel2_Ambon_2024",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "Composite_Sentinel2_Ambon_2024",

  region: studyArea,

  scale: CONFIG.scale,

  crs: CONFIG.exportCRS,

  maxPixels: CONFIG.maxPixels,

  fileFormat: "GeoTIFF",
});

// ============================================================
// 31. EXPORT NDVI 2024
// ============================================================

Export.image.toDrive({
  image: ndvi2024,

  description: "NDVI_Ambon_2024",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "NDVI_Ambon_2024",

  region: studyArea,

  scale: CONFIG.scale,

  crs: CONFIG.exportCRS,

  maxPixels: CONFIG.maxPixels,

  fileFormat: "GeoTIFF",
});

// ============================================================
// 32. EXPORT NDWI 2024
// ============================================================

Export.image.toDrive({
  image: ndwi2024,

  description: "NDWI_Ambon_2024",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "NDWI_Ambon_2024",

  region: studyArea,

  scale: CONFIG.scale,

  crs: CONFIG.exportCRS,

  maxPixels: CONFIG.maxPixels,

  fileFormat: "GeoTIFF",
});

// ============================================================
// 33. EXPORT NDBI 2024
// ============================================================

Export.image.toDrive({
  image: ndbi2024,

  description: "NDBI_Ambon_2024",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "NDBI_Ambon_2024",

  region: studyArea,

  scale: CONFIG.scale,

  crs: CONFIG.exportCRS,

  maxPixels: CONFIG.maxPixels,

  fileFormat: "GeoTIFF",
});

// ============================================================
// 34. EXPORT BSI 2024
// ============================================================

Export.image.toDrive({
  image: bsi2024,

  description: "BSI_Ambon_2024",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "BSI_Ambon_2024",

  region: studyArea,

  scale: CONFIG.scale,

  crs: CONFIG.exportCRS,

  maxPixels: CONFIG.maxPixels,

  fileFormat: "GeoTIFF",
});

// ============================================================
// 35. EXPORT FEATURE STACK 2024 KE DRIVE
// ============================================================

Export.image.toDrive({
  image: featureStack2024,

  description: "Feature_Stack_Ambon_2024_200_v2",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "Feature_Stack_Ambon_2024_200_v2",

  region: studyArea,

  scale: CONFIG.scale,

  crs: CONFIG.exportCRS,

  maxPixels: CONFIG.maxPixels,

  fileFormat: "GeoTIFF",
});

// ============================================================
// 36. EXPORT FEATURE STACK 2024 KE ASSET
// ============================================================

Export.image.toAsset({
  image: featureStack2024,

  description: "Export_Feature_Stack_Ambon_2024_200_v2",

  assetId: CONFIG.featureStackAsset,

  region: studyArea,

  scale: CONFIG.scale,

  maxPixels: CONFIG.maxPixels,
});

// ============================================================
// 37. TAMBAHKAN KOORDINAT PADA SAMPEL FEATURE STACK
// ============================================================
//
// CATATAN:
// Feature Stack merupakan data raster sehingga tidak dapat
// diekspor langsung menjadi GeoJSON.
//
// Agar dapat ditampilkan di WebGIS, nilai 10 fitur raster
// diekstrak pada setiap titik Ground Truth. Hasilnya berupa
// FeatureCollection titik yang memiliki atribut:
// B2, B3, B4, B8, B11, B12, NDVI, NDWI, NDBI, BSI,
// sample_id, class, year, label, longitude, dan latitude.
// ============================================================

var samplesFeatureStackGeoJSON2024 = samples2024.map(function (feature) {
  feature = ee.Feature(feature);

  var pointGeometry = feature.geometry().centroid(1);

  var coordinates = pointGeometry.coordinates();

  return ee.Feature(pointGeometry, feature.toDictionary()).set({
    longitude: ee.Number(coordinates.get(0)),

    latitude: ee.Number(coordinates.get(1)),

    geometry_type: pointGeometry.type(),

    data_type: "feature_stack_sample",
  });
});

print(
  "Contoh Feature Stack GeoJSON 2024:",
  samplesFeatureStackGeoJSON2024.limit(5),
);

print(
  "Jumlah titik Feature Stack GeoJSON:",
  samplesFeatureStackGeoJSON2024.size(),
);

// ============================================================
// 38. EXPORT SAMPEL FEATURE STACK 2024 KE CSV
// ============================================================

Export.table.toDrive({
  collection: samplesFeatureStackGeoJSON2024,

  description: "Samples_Feature_Stack_Ambon_2024_200_v2_CSV",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "samples_feature_stack_ambon_2024_200_v2",

  fileFormat: "CSV",

  selectors: featureBands.concat([
    "sample_id",
    "class",
    "year",
    "label",
    "longitude",
    "latitude",
    "geometry_type",
    "data_type",
    ".geo",
  ]),
});

// ============================================================
// 39. EXPORT SAMPEL FEATURE STACK 2024 KE GEOJSON
// ============================================================
//
// File ini yang dapat dimuat langsung ke Leaflet/OpenLayers
// sebagai layer titik Feature Stack pada WebGIS.
// ============================================================

Export.table.toDrive({
  collection: samplesFeatureStackGeoJSON2024,

  description: "Feature_Stack_Samples_Ambon_2024_200_v2_GeoJSON",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "feature_stack_samples_ambon_2024_200_v2",

  fileFormat: "GeoJSON",
});

// ============================================================
// 40. EXPORT GROUND TRUTH WEBGIS 2024 KE GEOJSON
// ============================================================
//
// Ekspor khusus WebGIS dengan atribut tambahan data_type.
// Ground Truth GeoJSON pada bagian sebelumnya tetap dipertahankan.
// ============================================================

var groundTruthWebGIS2024 = groundTruth2024.map(function (feature) {
  return ee.Feature(feature).set({
    data_type: "ground_truth",
  });
});

Export.table.toDrive({
  collection: groundTruthWebGIS2024,

  description: "Ground_Truth_Ambon_2024_200_WebGIS_GeoJSON",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "ground_truth_ambon_2024_200_webgis",

  fileFormat: "GeoJSON",
});

// ============================================================
// 41. EXPORT RINGKASAN GROUND TRUTH
// ============================================================

Export.table.toDrive({
  collection: groundTruthSummary,

  description: "Ringkasan_Ground_Truth_Ambon_2024_v2",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "Ringkasan_Ground_Truth_Ambon_2024_v2",

  fileFormat: "CSV",
});

// ============================================================
// 42. EXPORT TABEL REPRODUCIBILITY
// ============================================================

Export.table.toDrive({
  collection: reproducibilityTable2024,

  description: "Reproducibility_Preprocessing_Ambon_2024_v2",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "Reproducibility_Preprocessing_Ambon_2024_v2",

  fileFormat: "CSV",
});

// ============================================================
// 43. EXPORT DAFTAR TANGGAL AKUISISI 2024 KE CSV
// ============================================================

Export.table.toDrive({
  collection: tabelTanggalAkuisisi2024,

  description: "Daftar_Tanggal_Akuisisi_Sentinel2_Ambon_2024",

  folder: CONFIG.exportFolder,

  fileNamePrefix: "daftar_tanggal_akuisisi_sentinel2_ambon_2024",

  fileFormat: "CSV",

  selectors: ["tanggal_akuisisi", "jumlah_scene"],
});

// ============================================================
// RINGKASAN AKHIR
// ============================================================

print("========================================");
print("PREPROCESSING TAHUN 2024 SELESAI");
print("========================================");

print("Wilayah = Kota Ambon");

print("Tahun citra = 2024");

print("Periode citra = 1 Januari 2024 sampai 31 Desember 2024");

print("Jumlah hari kalender periode 2024:", jumlahHariKalender2024);

print(
  "Jumlah seluruh scene Sentinel-2 yang lolos filter:",
  sentinel2024.size(),
);

print("Jumlah hari akuisisi unik:", jumlahHariAkuisisiUnik2024);

print("Daftar tanggal akuisisi unik:", tanggalAkuisisiUnik2024);

print("Parameter filterDate:", CONFIG.startDate, CONFIG.endDate);

print("Jumlah aktual GT Vegetasi:", jumlahGTVegetasi2024);

print("Jumlah aktual GT Non-Vegetasi:", jumlahGTNonVegetasi2024);

print("Jumlah aktual seluruh GT:", jumlahTotalGT2024);

print(
  "Jenis geometry Ground Truth:",
  groundTruth2024.first().geometry().type(),
);

print(
  "Koordinat Ground Truth pertama:",
  groundTruth2024.first().geometry().coordinates(),
);

print(
  "Distribusi geometry type:",
  groundTruth2024.aggregate_histogram("geometry_type"),
);

print("Jumlah sampel valid:", jumlahSampelValid);

print("Jumlah sampel tidak valid:", jumlahSampelTidakValid);

print("Jumlah fitur = 10");

print("Fitur = B2, B3, B4, B8, B11, B12, NDVI, NDWI, NDBI, BSI");

print("Asset Ground Truth output:", CONFIG.groundTruthOutputAsset);

print("Asset Feature Stack output:", CONFIG.featureStackAsset);

print(
  "GeoJSON WebGIS Ground Truth:",
  "ground_truth_ambon_2024_200_webgis.geojson",
);

print(
  "GeoJSON WebGIS Feature Stack Samples:",
  "feature_stack_samples_ambon_2024_200_v2.geojson",
);

print(
  "Catatan GeoJSON:",
  "selectors dihapus agar geometry Point tetap tersimpan dan tidak menjadi null.",
);

print("Buka tab Tasks untuk menjalankan export.");
