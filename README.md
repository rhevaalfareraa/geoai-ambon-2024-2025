# GeoAI Kota Ambon 2024–2025

## Analisis Perubahan Vegetasi Menggunakan Sentinel-2, Random Forest, dan WebGIS

Repositori ini berisi kode Google Earth Engine, data pendukung, hasil pemodelan, dan WebGIS statis untuk menganalisis perubahan vegetasi di **Kota Ambon, Provinsi Maluku**, pada tahun **2024–2025**.

Analisis dilakukan menggunakan citra **Sentinel-2 Surface Reflectance Harmonized**, enam band spektral, empat indeks spektral, dan algoritma **Random Forest**. Hasil klasifikasi tahunan dibandingkan untuk mengidentifikasi area yang tetap, mengalami penambahan vegetasi (_gain_), atau mengalami kehilangan vegetasi (_loss_). Hasil tersebut kemudian disajikan melalui WebGIS interaktif.

---

## Tautan Proyek

| Sumber                       | Tautan                                              |
| ---------------------------- | --------------------------------------------------- |
| Repository GitHub            | https://github.com/rhevaalfareraa/geoai-ambon-2024-2025                     |
| WebGIS publik                | https://ambon-vegetation-change.vercel.app                               |
| Laporan akhir PDF            | https://drive.google.com/drive/folders/1QLcenh_mQwFGC6YtiH3DaE_xrRTRNSgY?usp=sharing                               |
| Unduhan data berukuran besar | https://drive.google.com/drive/folders/1wRfvb2dTbw1T-yricVFguRaPfswNqwo_?usp=sharing |

---

## Identitas Proyek

| Komponen             | Keterangan                                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Kelompok             | 2 |
| Judul                | Analisis Perubahan Vegetasi Kota Ambon Tahun 2024–2025 Menggunakan Sentinel-2 dan Random Forest pada Google Earth Engine |
| Mata kuliah          | Maha Data dan Kapita Selekta Sistem Informasi                                                                            |
| Program studi        | Sistem Informasi                                                                                                         |
| Institusi            | Universitas Bakrie                                                                                                       |
| Semester             | Genap 2025/2026                                                                                                          |
| Wilayah studi        | Kota Ambon, Provinsi Maluku, Indonesia                                                                                   |
| Objek analisis       | Vegetasi dan non-vegetasi                                                                                                |
| Tahun pengamatan     | 2024 dan 2025                                                                                                            |
| Platform analisis    | Google Earth Engine                                                                                                      |
| Platform visualisasi | WebGIS statis berbasis Leaflet                                                                                           |
| Algoritma            | Random Forest                                                                                                            |
| Jumlah pohon         | 150                                                                                                                      |
| Resolusi analisis    | 10 meter                                                                                                                 |

---

## Anggota Kelompok 2

| Nama                         | NIM        | Fokus Kontribusi                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rheva Alfarera Mahfud        | 1232002030 | Sentinel-2 2025, NDVI dan feature stack, ground truth dan ekspor data, split training-testing, training Random Forest, evaluasi model, klasifikasi 2024–2025, change detection, perhitungan gain, loss, dan net change, ekspor GeoJSON, pengujian layer, finalisasi WebGIS, perbaikan struktur WebGIS, sinkronisasi dan validasi data, GitHub, README, rumusan masalah dan alasan pemilihan, draft latar belakang, dan laporan |
| Eka Saputra                  | 1232002076 | Sentinel-2 2024, NDVI dan feature stack, ground truth dan ekspor data, pengecekan objek target vegetasi, screenshot hasil dan visualisasi, pengecekan tautan GitHub dan WebGIS, serta penyusunan PPT presentasi                                                                                                                                                                                                                |
| Tegar Firmansyah             | 1232002079 | Wilayah, boundary, dan konsep analisis, Sentinel-2 2025, ground truth dan ekspor data, serta screenshot hasil dan visualisasi                                                                                                                                                                                                                                                                                                  |
| Aurellia Sheyda Ivory Tuakia | 1242002022 | Sentinel-2 2024, ground truth dan ekspor data, pengembangan WebGIS, demo WebGIS, serta penyusunan PPT presentasi                                                                                                                                                                                                                                                                                                               |
| Alecia Dwendy Putri Adhani   | 1242002007 | Pengembangan WebGIS, penyusunan PPT presentasi                                                                                                                                                                                                                                                                                                                                                                                 |

### Rincian Kontribusi

#### Rheva Alfarera Mahfud

- Melakukan preprocessing citra Sentinel-2 tahun 2025.
- Menghitung NDVI dan menyusun feature stack 2024–2025.
- Menyusun ground truth dan melakukan ekspor data.
- Membagi data menjadi 70% training dan 30% testing.
- Melatih model Random Forest untuk klasifikasi tahun 2024 dan 2025.
- Melakukan evaluasi model.
- Menyusun hasil klasifikasi 2024–2025 dan change detection.
- Menghitung gain, loss, dan net change vegetasi.
- Melakukan ekspor hasil dalam format GeoJSON.
- Melakukan pengujian layer WebGIS.
- Melakukan finalisasi WebGIS, perbaikan struktur, serta sinkronisasi dan validasi data.
- Menyiapkan repository GitHub dan README.
- Menyusun rumusan masalah, alasan pemilihan wilayah, draft latar belakang, dan laporan.

#### Eka Saputra

- Melakukan preprocessing citra Sentinel-2 tahun 2024.
- Menghitung NDVI dan menyusun feature stack 2024–2025.
- Menyusun ground truth dan melakukan ekspor data.
- Melakukan pengecekan objek target vegetasi.
- Menyiapkan screenshot dan visualisasi hasil.
- Memeriksa keaktifan tautan GitHub dan WebGIS.
- Menyusun laporan
- Menyusun PPT presentasi.

#### Tegar Firmansyah

- Menyiapkan boundary Kota Ambon.
- Menyusun konsep analisis dan visualisasi QGIS.
- Melakukan preprocessing citra Sentinel-2 tahun 2025.
- Menyusun ground truth dan melakukan ekspor data.
- Menyiapkan screenshot dan visualisasi hasil.

#### Aurellia Sheyda Ivory Tuakia

- Melakukan preprocessing citra Sentinel-2 tahun 2024.
- Menyusun ground truth dan melakukan ekspor data.
- Mengembangkan WebGIS.
- Menyiapkan demo WebGIS.
- Menyusun PPT presentasi.

#### Alecia Dwendy Putri Adhani

- Mengembangkan WebGIS.
- Menyusun PPT presentasi.

---

## Tujuan Proyek

Proyek ini bertujuan untuk:

1. membentuk komposit Sentinel-2 tahun 2024 dan 2025 dengan konfigurasi preprocessing yang setara;
2. membangun _feature stack_ yang terdiri atas band spektral dan indeks spektral;
3. mengklasifikasikan wilayah menjadi kelas vegetasi dan non-vegetasi;
4. mengevaluasi model Random Forest menggunakan data testing;
5. menghitung luas vegetasi dan non-vegetasi pada setiap tahun;
6. mengidentifikasi area _gain_, _loss_, tetap vegetasi, dan tetap non-vegetasi;
7. mengekspor raster, GeoJSON, dan CSV untuk kebutuhan laporan, QGIS, dan WebGIS;
8. menyajikan hasil melalui WebGIS interaktif sebagai media eksplorasi dan pendukung pengambilan keputusan.

---

## Wilayah dan Objek Analisis

Wilayah penelitian mencakup batas administratif **Kota Ambon**. Data batas lima kecamatan digunakan sebagai pendukung filter dan analisis wilayah pada WebGIS.

Kelas yang diprediksi adalah:

```text
0 = Non-vegetasi
1 = Vegetasi
```

Perbandingan kelas tahun 2024 dan 2025 menghasilkan empat kondisi perubahan:

```text
0 = Tetap non-vegetasi
1 = Gain vegetasi
2 = Loss vegetasi
3 = Tetap vegetasi
```

Kode perubahan dibentuk menggunakan:

```javascript
var changeMap = classification2024.multiply(2).add(classification2025);
```

---

## Data yang Digunakan

### Citra satelit

| Parameter            | Nilai                                |
| -------------------- | ------------------------------------ |
| Dataset              | `COPERNICUS/S2_SR_HARMONIZED`        |
| Tahun 2024           | `2024-01-01` sampai `2025-01-01`     |
| Tahun 2025           | `2025-01-01` sampai `2026-01-01`     |
| Tanggal akhir        | Eksklusif pada fungsi `filterDate()` |
| Filter metadata awan | `CLOUDY_PIXEL_PERCENTAGE < 20`       |
| Komposit             | Median                               |
| Resolusi proses      | 10 meter                             |
| Skala reflektansi    | Nilai band dibagi `10000`            |

### Cloud masking

Cloud masking menggunakan band `SCL`. Kelas berikut dikeluarkan:

```text
0  = No data
1  = Saturated or defective
3  = Cloud shadow
8  = Cloud medium probability
9  = Cloud high probability
10 = Thin cirrus
11 = Snow or ice
```

### Feature stack

Model menggunakan 10 fitur:

```text
B2
B3
B4
B8
B11
B12
NDVI
NDWI
NDBI
BSI
```

Rumus indeks:

```text
NDVI = (B8 - B4) / (B8 + B4)

NDWI = (B3 - B8) / (B3 + B8)

NDBI = (B11 - B8) / (B11 + B8)

BSI = ((B11 + B4) - (B8 + B2)) /
      ((B11 + B4) + (B8 + B2))
```

### Ground truth

Ground truth dibuat secara manual dan disimpan sebagai geometri `Point`.

| Tahun     | Vegetasi | Non-vegetasi |   Total |
| --------- | -------: | -----------: | ------: |
| 2024      |      100 |          100 |     200 |
| 2025      |      100 |          100 |     200 |
| **Total** |  **200** |      **200** | **400** |

Atribut minimum yang disarankan:

```text
sample_id
class
year
label
longitude
latitude
```

---

## Konfigurasi Random Forest

| Parameter               |                        Nilai |
| ----------------------- | ---------------------------: |
| Jumlah pohon            |                          150 |
| Variables per split     |                            3 |
| Minimum leaf population |                            2 |
| Bag fraction            |                          0.7 |
| Maximum nodes           |                          256 |
| Random seed             |                           42 |
| Pembagian data          | 70% training dan 30% testing |
| Jumlah fitur            |                           10 |
| Kelas target            |                 1 = Vegetasi |
| Scale                   |                     10 meter |
| Tile scale              |                            4 |

Ground truth 2024 dan 2025 digabungkan setelah nilai piksel diekstraksi. Sampel yang memiliki nilai `null` pada salah satu fitur dikeluarkan sebelum pembagian data. Dengan 400 sampel valid, pembagian final menghasilkan:

```text
Training = 280 sampel
Testing  = 120 sampel
```

Satu model Random Forest yang sama digunakan untuk mengklasifikasikan feature stack 2024 dan 2025 agar hasil antartahun konsisten.

---

## Ringkasan Evaluasi Model

Hasil berikut merupakan evaluasi pada data testing dari konfigurasi final 70:30.

### Confusion matrix testing

| Aktual \ Prediksi | Non-vegetasi | Vegetasi |
| ----------------- | -----------: | -------: |
| Non-vegetasi      |           51 |        4 |
| Vegetasi          |            1 |       64 |

### Metrik testing

| Metrik                   |  Nilai |
| ------------------------ | -----: |
| Overall accuracy         | 95,83% |
| Kappa                    | 91,57% |
| Precision kelas vegetasi | 94,12% |
| Recall kelas vegetasi    | 98,46% |
| F1-score kelas vegetasi  | 96,24% |

Nilai pada README perlu diperbarui apabila kode dijalankan ulang dengan ground truth, parameter, atau asset yang berbeda.

---

## Struktur Repository

Struktur berikut direkomendasikan agar kode GEE, WebGIS, data, hasil, dan laporan dapat diperiksa secara terpisah.

```text
geoai-ambon-2024-2025/
├── README.md
│
├── data/
│   ├── boundary/
│   │   └── kecamatan_ambon copy.geojson
│   │
│   ├── ground_truth/
│   │   ├── ground_truth_ambon_2024_200_webgis copy.geojson
│   │   └── ground_truth_ambon_2025_200_webgis copy.geojson
│   │
│   └── samples/
│       ├── feature_stack_samples_ambon_2024_200_v2 copy.geojson
│       └── feature_stack_samples_ambon_2025_200 copy.geojson
│
├── gee/
│   ├── 01_preprocessing_2024.js
│   ├── 02_preprocessing_2025.js
│   └── 03_random_forest_change_detection.js
│
├── report/
│   ├── Laporan_Team2_GeoAI_Kota_Ambon_2024_2025.pdf
│   └── Powerpoint_Team2_GeoAI_Kota_Ambon_2024_2025.pdf
│
├── results/
│   ├── figures/
│   │   ├── chart_feature_importance.png
│   │   ├── confusion_matrix_testing.png
│   │   ├── visualisasi_change_map_2024_2025.jpg
│   │   ├── visualisasi_klasifikasi_2024.png
│   │   └── visualisasi_klasifikasi_2025.png
│   │
│   ├── raster/
│   │   ├── RF_Change_Map_Ambon_2024_2025 copy.tif
│   │   ├── RF_Klasifikasi_Biner_Ambon_2024 copy.tif
│   │   ├── RF_Klasifikasi_Biner_Ambon_2025 copy.tif
│   │   └── RF_Status_Perubahan_Ambon_2024_2025 copy.tif
│   │
│   ├── statistics/
│   │   ├── Evaluasi_APRF_RF_Ambon_2024_2025 copy.csv
│   │   ├── Luas_Change_Map_RF_Ambon_2024_2025 copy.csv
│   │   ├── Luas_Kelas_RF_Ambon_2024 copy.csv
│   │   ├── Luas_Kelas_RF_Ambon_2025 copy.csv
│   │   ├── Ringkasan_Perubahan_Kuantitatif_Ambon_2024_2025 copy.csv
│   │   └── statistik_kecamatan_prahitung copy.json
│   │
│   ├── supporting/
│   │   ├── RF_Samples_Ambon_2024_2025 copy.csv
│   │   └── RF_Testing_Result_Ambon_2024_2025 copy.csv
│   │
│   └── vector/
│       ├── gain_vegetasi_ambon_2024_2025 copy.geojson
│       ├── loss_vegetasi_ambon_2024_2025 copy.geojson
│       ├── rf_change_map_ambon_2024_2025 copy.geojson
│       ├── target_vegetasi_ambon_2024 copy.geojson
│       └── target_vegetasi_ambon_2025 copy.geojson
│
└── webgis/
    ├── index.html
    ├── README.md
    ├── FITUR_LENGKAP.txt
    │
    ├── assets/
    │   ├── Lambang_Ambon.png
    │   └── workflow-diagram.png
    │
    ├── css/
    │   └── style.css
    │
    ├── js/
    │   ├── app.js
    │   ├── charts.js
    │   ├── config.js
    │   ├── dashboard.js
    │   ├── data-loader.js
    │   └── map.js
    │
    └── data/
        ├── raster/
        │   ├── RF_Change_Map_Ambon_2024_2025.tif
        │   ├── RF_Klasifikasi_Biner_Ambon_2024.tif
        │   ├── RF_Klasifikasi_Biner_Ambon_2025.tif
        │   └── RF_Status_Perubahan_Ambon_2024_2025.tif
        │
        ├── spatial/
        │   ├── boundary_kota_ambon.geojson
        │   ├── cakupan_data_ambon.geojson
        │   ├── feature_stack_samples_ambon_2024_200_v2.geojson
        │   ├── feature_stack_samples_ambon_2025_200.geojson
        │   ├── gain_vegetasi_ambon_2024_2025.geojson
        │   ├── ground_truth_ambon_2024_200_webgis.geojson
        │   ├── ground_truth_ambon_2025_200_webgis.geojson
        │   ├── kecamatan_ambon.geojson
        │   ├── loss_vegetasi_ambon_2024_2025.geojson
        │   ├── rf_change_map_ambon_2024_2025.geojson
        │   ├── target_vegetasi_ambon_2024.geojson
        │   └── target_vegetasi_ambon_2025.geojson
        │
        ├── statistics/
        │   ├── Evaluasi_APRF_RF_Ambon_2024_2025.csv
        │   ├── Luas_Change_Map_RF_Ambon_2024_2025.csv
        │   ├── Luas_Kelas_RF_Ambon_2024.csv
        │   ├── Luas_Kelas_RF_Ambon_2025.csv
        │   ├── Ringkasan_Perubahan_Kuantitatif_Ambon_2024_2025.csv
        │   └── statistik_kecamatan_prahitung.json
        │
        └── supporting/
            ├── RF_Samples_Ambon_2024_2025.csv
            └── RF_Testing_Result_Ambon_2024_2025.csv
```

Nama file aktual dapat berbeda. Semua path WebGIS harus disinkronkan melalui `webgis/js/config.js`.

---

# Reproducibility Google Earth Engine

## 1. Persyaratan

Siapkan:

- akun Google;
- akses Google Earth Engine;
- Google Cloud Project yang telah didaftarkan untuk Earth Engine;
- browser modern;
- data boundary dan ground truth dari folder `data/`.

Buka Google Earth Engine Code Editor:

```text
https://code.earthengine.google.com/
```

---

## 2. Clone atau Unduh Repository

```bash
git clone https://github.com/rhevaalfareraa/geoai-ambon-2024-2025
cd geoai-ambon-2024-2025
```

Repository juga dapat diunduh melalui menu **Code → Download ZIP** pada GitHub.

---

## 3. Buat Struktur Asset GEE

Gunakan Cloud Project milik masing-masing pengguna. Contoh struktur:

```text
projects/PROJECT_ID_ANDA/assets/
├── kota_ambon
├── ground_truth_2024_200_v2
├── ground_truth_2025_200_v2
├── feature_stack_2024_200_v2
└── feature_stack_2025_200_v2
```

Jangan mengandalkan asset milik pembuat repository karena pengguna lain mungkin tidak memiliki izin akses.

---

## 4. Upload Boundary ke GEE Assets

Upload:

```text
data/boundary/boundary_kota_ambon.geojson
```

Nama asset yang disarankan:

```text
kota_ambon
```

Contoh path:

```text
projects/PROJECT_ID_ANDA/assets/kota_ambon
```

Boundary kecamatan tidak wajib untuk training model, tetapi digunakan pada WebGIS untuk filter wilayah.

---

## 5. Upload Ground Truth ke GEE Assets

Upload:

```text
data/ground_truth/ground_truth_ambon_2024_200_v2.geojson
data/ground_truth/ground_truth_ambon_2025_200_v2.geojson
```

Nama asset yang disarankan:

```text
ground_truth_2024_200_v2
ground_truth_2025_200_v2
```

Contoh path:

```text
projects/PROJECT_ID_ANDA/assets/ground_truth_2024_200_v2
projects/PROJECT_ID_ANDA/assets/ground_truth_2025_200_v2
```

Setelah upload, periksa pada GEE:

```javascript
print(groundTruth.size());
print(groundTruth.aggregate_histogram("class"));
print(groundTruth.first().geometry().type());
```

Hasil yang diharapkan untuk setiap tahun:

```text
Jumlah fitur  = 200
Kelas 0       = 100
Kelas 1       = 100
Geometry type = Point
```

---

## 6. Sesuaikan Path pada Script

Pada `gee/01_preprocessing_2024.js`, sesuaikan:

```javascript
var CONFIG = {
  boundaryAsset: "projects/PROJECT_ID_ANDA/assets/kota_ambon",

  groundTruthAsset: "projects/PROJECT_ID_ANDA/assets/ground_truth_2024_200_v2",

  featureStackAsset:
    "projects/PROJECT_ID_ANDA/assets/feature_stack_2024_200_v2",
};
```

Pada `gee/02_preprocessing_2025.js`, sesuaikan:

```javascript
var CONFIG = {
  boundaryAsset: "projects/PROJECT_ID_ANDA/assets/kota_ambon",

  groundTruthAsset: "projects/PROJECT_ID_ANDA/assets/ground_truth_2025_200_v2",

  featureStackAsset:
    "projects/PROJECT_ID_ANDA/assets/feature_stack_2025_200_v2",
};
```

Pada `gee/03_random_forest_change_detection.js`, sesuaikan seluruh asset input:

```javascript
var CONFIG = {
  boundaryAsset: "projects/PROJECT_ID_ANDA/assets/kota_ambon",

  groundTruth2024Asset:
    "projects/PROJECT_ID_ANDA/assets/ground_truth_2024_200_v2",

  groundTruth2025Asset:
    "projects/PROJECT_ID_ANDA/assets/ground_truth_2025_200_v2",

  featureStack2024Asset:
    "projects/PROJECT_ID_ANDA/assets/feature_stack_2024_200_v2",

  featureStack2025Asset:
    "projects/PROJECT_ID_ANDA/assets/feature_stack_2025_200_v2",
};
```

Nama properti kelas harus tetap:

```text
class
```

---

## 7. Jalankan Preprocessing 2024

1. Buka `gee/01_preprocessing_2024.js`.
2. Salin seluruh kode ke GEE Code Editor.
3. Pilih Cloud Project yang telah terhubung dengan Earth Engine.
4. Pastikan seluruh asset path pada `CONFIG` benar.
5. Klik **Run**.
6. Periksa Console:
   - jumlah citra Sentinel-2;
   - nama band composite;
   - daftar 10 fitur;
   - jumlah ground truth;
   - distribusi kelas;
   - jumlah sampel valid dan tidak valid.
7. Periksa layer pada Map.
8. Buka tab **Tasks**.
9. Klik **Run** pada export feature stack 2024.
10. Pastikan output tersimpan sebagai:

```text
projects/PROJECT_ID_ANDA/assets/feature_stack_2024_200_v2
```

> Menekan tombol **Run** pada editor tidak otomatis menjalankan export. Setiap proses export harus dikonfirmasi kembali melalui tab **Tasks**.

---

## 8. Jalankan Preprocessing 2025

Lakukan langkah yang sama menggunakan:

```text
gee/02_preprocessing_2025.js
```

Pastikan output tersimpan sebagai:

```text
projects/PROJECT_ID_ANDA/assets/feature_stack_2025_200_v2
```

Sebelum melanjutkan, periksa bahwa feature stack 2024 dan 2025 memiliki band yang sama dan berurutan:

```javascript
print(featureStack2024.bandNames());
print(featureStack2025.bandNames());
```

Hasil yang diharapkan:

```text
[B2, B3, B4, B8, B11, B12, NDVI, NDWI, NDBI, BSI]
```

---

## 9. Jalankan Random Forest dan Change Detection

1. Buka `gee/03_random_forest_change_detection.js`.
2. Sesuaikan asset path.
3. Klik **Run**.
4. Periksa Console:
   - jumlah sampel valid;
   - distribusi kelas;
   - jumlah training dan testing;
   - confusion matrix training;
   - confusion matrix testing;
   - accuracy;
   - precision;
   - recall;
   - F1-score;
   - kappa;
   - producer accuracy;
   - consumer accuracy;
   - feature importance;
   - luas kelas 2024;
   - luas kelas 2025;
   - luas empat kelas perubahan;
   - gain, loss, dan perubahan bersih.
5. Periksa layer klasifikasi dan change map pada Map.
6. Buka tab **Tasks**.
7. Jalankan seluruh export yang diperlukan.

Urutan kerja harus tetap:

```text
Preprocessing 2024
→ export feature stack 2024
→ tunggu task selesai
→ preprocessing 2025
→ export feature stack 2025
→ tunggu task selesai
→ Random Forest dan change detection
→ export hasil
```

---

## 10. Output dari Script Random Forest

Output utama yang digunakan dalam laporan dan WebGIS meliputi:

### Raster

```text
RF_Klasifikasi_Ambon_2024.tif
RF_Klasifikasi_Ambon_2025.tif
RF_Change_Map_Ambon_2024_2025.tif
```

### GeoJSON

```text
target_vegetasi_ambon_2024.geojson
target_vegetasi_ambon_2025.geojson
gain_vegetasi_ambon_2024_2025.geojson
loss_vegetasi_ambon_2024_2025.geojson
Boundary_Kota_Ambon.geojson
```

GeoJSON hasil vektorisasi harus memiliki geometri `Polygon` atau `MultiPolygon`. Pastikan file tidak hanya berisi atribut dengan `geometry: null`.

### CSV

```text
Evaluasi_APRF_RF_Ambon_2024_2025.csv
Luas_Kelas_RF_Ambon_2024.csv
Luas_Kelas_RF_Ambon_2025.csv
Luas_Change_Map_RF_Ambon_2024_2025.csv
Ringkasan_Perubahan_Kuantitatif_Ambon_2024_2025.csv
RF_Testing_Result_Ambon_2024_2025.csv
RF_Samples_Ambon_2024_2025.csv
```

---

## 11. Memindahkan Output ke WebGIS

Setelah export selesai:

1. Unduh hasil dari Google Drive.
2. Ekstrak file ZIP atau arsip jika diperlukan.
3. Salin GeoJSON ke:

```text
webgis/data/spatial/
```

4. Salin CSV ke:

```text
webgis/data/statistics/
```

atau:

```text
webgis/data/supporting/
```

5. Salin raster perubahan ke lokasi yang dibaca aplikasi.
6. Periksa objek `APP_CONFIG.paths` pada:

```text
webgis/js/config.js
```

Contoh:

```javascript
const APP_CONFIG = {
  paths: {
    boundary: "data/spatial/Boundary_Kota_Ambon.geojson",

    districts: "data/spatial/kecamatan_ambon.geojson",

    vegetation2024: "data/spatial/target_vegetasi_ambon_2024.geojson",

    vegetation2025: "data/spatial/target_vegetasi_ambon_2025.geojson",

    gain: "data/spatial/gain_vegetasi_ambon_2024_2025.geojson",

    loss: "data/spatial/loss_vegetasi_ambon_2024_2025.geojson",
  },
};
```

Gunakan path relatif. Jangan menggunakan path lokal seperti:

```text
/Users/nama/...
C:\Users\nama\...
file:///...
```

---

# Menjalankan WebGIS

## Persyaratan

WebGIS menggunakan:

```text
HTML5
CSS3
JavaScript Vanilla
Leaflet.js
Chart.js
PapaParse
Turf.js
Leaflet Fullscreen
Font Awesome
```

Koneksi internet diperlukan apabila library, basemap, logo, atau ikon dimuat melalui CDN atau sumber eksternal.

---

## Menjalankan Secara Lokal

### Windows, macOS, atau Linux

1. Buka Terminal.
2. Masuk ke folder WebGIS:

```bash
cd geoai-ambon-2024-2025/webgis
```

3. Jalankan local server:

```bash
python -m http.server 8000
```

Apabila perintah tersebut tidak tersedia, gunakan:

```bash
python3 -m http.server 8000
```

4. Buka browser:

```text
http://localhost:8000
```

5. Hentikan server dengan:

```text
Ctrl + C
```

Jangan membuka `index.html` langsung menggunakan skema `file://` karena browser dapat memblokir pembacaan CSV, GeoJSON, dan raster.

---

## Tampilan dan Fitur WebGIS

WebGIS memiliki empat tab utama:

### 1. Peta Hasil

- landing page pengantar Kota Ambon;
- peta klasifikasi dan perubahan vegetasi;
- boundary Kota Ambon dan lima kecamatan;
- Esri World Topographic sebagai basemap default;
- opsi basemap satelit;
- raster change map empat kelas;
- filter kecamatan;
- swipe comparison vegetasi 2024 dan 2025;
- slider opacity;
- popup atribut;
- legenda;
- panel statistik;
- unduh GeoJSON;
- unduh statistik CSV;
- notifikasi error layer.

### 2. Data dan Proses

- sumber data;
- periode analisis;
- cloud masking;
- median composite;
- enam band spektral;
- NDVI, NDWI, NDBI, dan BSI;
- ground truth;
- pembagian training-testing;
- parameter Random Forest;
- diagram workflow;
- metadata dataset.

### 3. Evaluasi Model

- confusion matrix;
- accuracy;
- precision;
- recall;
- F1-score;
- kappa;
- feature importance;
- perbandingan training dan testing;
- interpretasi false positive dan false negative.

### 4. Insight Hasil

- ringkasan gain, loss, tetap vegetasi, dan tetap non-vegetasi;
- ranking kecamatan berdasarkan kehilangan vegetasi;
- indeks tekanan vegetasi;
- zona prioritas indikatif;
- temuan utama;
- tingkat keyakinan;
- keterbatasan model;
- rekomendasi Pemerintah Kota Ambon;
- roadmap tindak lanjut.

Zona prioritas bersifat indikatif dan tidak boleh digunakan sebagai dasar tunggal untuk menetapkan pelanggaran atau keputusan hukum.

---

## Color Palette

```text
Primary dark    = #102c3a
Primary accent  = #8bc34a
Background      = #eef2f5
Gain            = #00bcd4
Loss            = #e74c3c
Vegetation 2024 = #27ae60
Vegetation 2025 = #2980b9
```

---

## Deployment WebGIS

### GitHub Pages

1. Push folder WebGIS ke repository GitHub.
2. Buka **Settings → Pages**.
3. Pilih branch publikasi.
4. Pilih folder root yang sesuai.
5. Simpan pengaturan.
6. Masukkan URL hasil deployment pada bagian **Tautan Proyek**.

### Netlify atau Vercel

WebGIS dapat dipublikasikan sebagai static site tanpa proses build. Pastikan folder publikasi berisi `index.html`.

### Server web biasa

Unggah seluruh isi folder `webgis/` tanpa mengubah struktur relatif file.

---

## File Berukuran Besar

File raster, GeoJSON hasil vektorisasi yang sangat besar, atau arsip WebGIS tidak harus disimpan langsung di GitHub.

File besar dapat disediakan melalui:

- Google Drive dengan akses publik;
- Zenodo;
- GitHub Releases;
- penyimpanan institusi;
- layanan object storage.

Gunakan tabel berikut:

| File               | Format  | Keterangan                          | Tautan       |
| ------------------ | ------- | ----------------------------------- | ------------ |
| Feature stack 2024 | GeoTIFF | 10 fitur model tahun 2024           | https://drive.google.com/file/d/18iRViIRv1FBUANU_GoV_E7sWqyIxXzuR/view?usp=drive_link |
| Feature stack 2025 | GeoTIFF | 10 fitur model tahun 2025           | https://drive.google.com/file/d/1MdWXiIZOhPPa1daSMiJxnh6mGyrQD3Ll/view?usp=drive_link |
| Klasifikasi 2024   | GeoTIFF | Hasil Random Forest 2024            | https://drive.google.com/file/d/19FLzOKmDHh3uuqSKzNzXpuuoLjaG-_Zp/view?usp=drive_link |
| Klasifikasi 2025   | GeoTIFF | Hasil Random Forest 2025            | https://drive.google.com/file/d/1B3ycAmcf-nRfWpLI0XdzDqdB63_rN5J-/view?usp=drive_link |
| Change map         | GeoTIFF | Empat kelas perubahan 2024–2025     | https://drive.google.com/file/d/1kAkMsiVSmvDb9TpgUMOLyT7TWqhJHlvB/view?usp=drive_link |

---

## Troubleshooting GEE

### Asset not found

Periksa:

- Cloud Project yang aktif;
- ejaan asset ID;
- izin akses asset;
- apakah export sebelumnya sudah selesai.

### Feature stack tidak ditemukan

Script Random Forest hanya dapat dijalankan setelah export feature stack 2024 dan 2025 selesai.

### Jumlah sampel kurang dari 400

Periksa titik yang berada pada piksel termask atau `no-data`. Script memfilter sampel yang tidak memiliki nilai lengkap pada seluruh 10 fitur.

### Band 2024 dan 2025 berbeda

Pastikan kedua script preprocessing menggunakan daftar dan urutan band yang sama.

### Export tidak berjalan

Setelah menjalankan script, buka tab **Tasks** dan klik **Run** pada setiap task.

### GeoJSON memiliki `geometry: null`

Gunakan koleksi polygon yang mempertahankan geometri saat export. Jangan membuang geometri melalui konfigurasi selector yang tidak sesuai.

### User memory limit exceeded

Kurangi beban vektorisasi dengan:

- menggunakan `tileScale`;
- menerapkan minimum patch;
- menyederhanakan geometri secara hati-hati;
- mengekspor per kelas;
- menggunakan raster sebagai layer utama;
- menyediakan file besar melalui tautan unduhan.

---

## Troubleshooting WebGIS

### Peta kosong

- pastikan WebGIS dijalankan melalui local server;
- pastikan koneksi internet aktif untuk basemap dan CDN;
- buka Developer Tools dan periksa Console;
- periksa path pada `js/config.js`.

### Data tidak muncul

- periksa nama file dan kapitalisasi;
- pastikan format GeoJSON valid;
- pastikan geometri tidak `null`;
- periksa apakah CRS data sesuai untuk penggunaan web.

### Chart tidak muncul

Pastikan Chart.js dan PapaParse berhasil dimuat serta file CSV memiliki kolom yang sesuai dengan kode dashboard.

### Peta salah ukuran setelah berpindah tab

Aplikasi harus menjalankan:

```javascript
map.invalidateSize();
```

setelah tab peta ditampilkan.

### Swipe tidak bekerja di Safari

Pastikan clipping menerapkan:

```css
clip-path: inset(...);
-webkit-clip-path: inset(...);
```

dan diperbarui setelah zoom, pan, atau resize.

### WebGIS lambat

Layer GeoJSON besar dimuat menggunakan lazy loading. Gunakan raster sebagai layer default dan aktifkan polygon detail hanya saat diperlukan.

---

## Validasi Sebelum Publikasi

### Google Earth Engine

- [ ] Boundary Kota Ambon berhasil dimuat.
- [ ] Ground truth 2024 berjumlah 200 titik.
- [ ] Ground truth 2025 berjumlah 200 titik.
- [ ] Distribusi kelas seimbang.
- [ ] Feature stack berisi 10 fitur.
- [ ] Urutan band 2024 dan 2025 sama.
- [ ] Training berjumlah 280 sampel.
- [ ] Testing berjumlah 120 sampel.
- [ ] Confusion matrix testing tercetak.
- [ ] APRF dan kappa tercetak.
- [ ] Luas kelas dan change matrix tercetak.
- [ ] Raster, CSV, dan GeoJSON berhasil diekspor.
- [ ] GeoJSON polygon memiliki geometri valid.

### WebGIS

- [ ] Tidak ada error JavaScript pada Console.
- [ ] Semua tab dapat dibuka.
- [ ] Boundary kota dan kecamatan tampil.
- [ ] Raster change map tampil.
- [ ] Vegetasi 2024 dan 2025 tampil.
- [ ] Gain dan loss tampil.
- [ ] Ground truth dan feature samples dapat dimuat.
- [ ] Filter kecamatan bekerja.
- [ ] Swipe comparison bekerja.
- [ ] Popup tidak menampilkan `undefined`, `null`, atau `NaN`.
- [ ] Chart dan KPI sinkron dengan CSV.
- [ ] Tombol unduh bekerja.
- [ ] Tampilan responsif.
- [ ] Tautan WebGIS dan laporan sudah diisi.

---

## Keterbatasan

Hasil klasifikasi dipengaruhi oleh kualitas citra, tutupan awan, piksel campuran, perbedaan kondisi musiman, posisi ground truth, parameter model, dan proses vektorisasi.

Kategori _gain_ dan _loss_ menunjukkan perubahan kelas spektral hasil model, bukan bukti langsung mengenai penyebab perubahan. Interpretasi lebih lanjut perlu didukung oleh:

- citra resolusi tinggi;
- data tata ruang;
- izin pemanfaatan lahan;
- data pembangunan;
- survei lapangan;
- verifikasi oleh instansi terkait.

---

## Disclaimer Akademik

Proyek ini dikembangkan untuk kebutuhan akademik. WebGIS berfungsi sebagai media visualisasi dan eksplorasi hasil model penginderaan jauh. Informasi di dalamnya tidak boleh digunakan sebagai satu-satunya dasar dalam penetapan kebijakan, pelanggaran, status legal lahan, atau tindakan penegakan hukum.

---

## Sitasi Proyek

Gunakan format berikut setelah identitas penulis dan tautan repository dilengkapi:

```text
Tim GeoAI Kota Ambon, “Analisis Perubahan Vegetasi Kota Ambon
Tahun 2024–2025 Menggunakan Sentinel-2 dan Random Forest
Berbasis WebGIS,” Universitas Bakrie, 2026.
```

---

## Lisensi

## Lisensi

Source code dalam repository ini, termasuk kode Google Earth Engine dan WebGIS, dikembangkan oleh Team 2 dan dilisensikan menggunakan MIT License.

Dokumentasi, laporan, diagram, dan visualisasi yang dibuat oleh Team 2 dilisensikan menggunakan Creative Commons Attribution 4.0 International (CC BY 4.0).

Hak cipta © 2026 Team 2 GeoAI Kota Ambon.

Lisensi tersebut hanya berlaku pada karya yang dibuat oleh Team 2. Data dan materi dari pihak ketiga, termasuk citra Sentinel-2, batas administrasi, basemap, library, logo, serta sumber eksternal lainnya, tetap mengikuti ketentuan lisensi dan atribusi dari masing-masing penyedia.
