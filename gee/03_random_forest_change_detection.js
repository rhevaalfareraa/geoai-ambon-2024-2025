// =====================================================
// GEOAI UAS - KOTA AMBON
// RANDOM FOREST VEGETASI DAN NON-VEGETASI 2024-2025
//
// Kelas:
// 0 = Non-Vegetasi / Non-target
// 1 = Vegetasi / Target
//
// Fitur:
// B2, B3, B4, B8, B11, B12,
// NDVI, NDWI, NDBI, BSI
//
// Model:
// Random Forest 150 Trees
//
// Pembagian:
// 70% Training, 30% Testing
//
// Output utama:
// - Raster klasifikasi biner 2024
// - Raster klasifikasi biner 2025
// - Change map 4 kondisi
// - Evaluasi APRF dari testing data
// - Statistik luas dan perubahan
// - GeoJSON target 2024, target 2025, gain, loss, dan change map lengkap
// =====================================================

// =====================================================
// 1. LOAD SELURUH ASSET
// =====================================================

var boundary = ee.FeatureCollection(
  "projects/gee-rheva-alfarera/assets/kota_ambon",
);

var featureStack2024 = ee.Image(
  "projects/gee-rheva-alfarera/assets/feature_stack_2024_200_v2",
);

var featureStack2025 = ee.Image(
  "projects/gee-rheva-alfarera/assets/feature_stack_2025_200_v2",
);

var groundTruth2024 = ee.FeatureCollection(
  "projects/gee-rheva-alfarera/assets/ground_truth_2024_200_v2",
);

var groundTruth2025 = ee.FeatureCollection(
  "projects/gee-rheva-alfarera/assets/ground_truth_2025_200_v2",
);

var boundaryGeometry = boundary.geometry();

Map.centerObject(boundary, 10);

Map.addLayer(boundary, { color: "red" }, "Boundary Kota Ambon", false);

print("Boundary Kota Ambon:", boundary);
print("Jumlah fitur boundary:", boundary.size());

// =====================================================
// 2. DAFTAR FITUR RANDOM FOREST
// =====================================================

var inputBands = [
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

print("Daftar fitur Random Forest:", inputBands);
print("Band Feature Stack 2024:", featureStack2024.bandNames());
print("Band Feature Stack 2025:", featureStack2025.bandNames());

var sameBands = featureStack2024
  .bandNames()
  .equals(featureStack2025.bandNames());

print("Apakah band 2024 dan 2025 sama?", sameBands);

// =====================================================
// 3. PEMERIKSAAN GROUND TRUTH
// =====================================================

print("Jumlah Ground Truth 2024:", groundTruth2024.size());
print("Jumlah Ground Truth 2025:", groundTruth2025.size());

print(
  "Distribusi Ground Truth 2024:",
  groundTruth2024.aggregate_histogram("class"),
);

print(
  "Distribusi Ground Truth 2025:",
  groundTruth2025.aggregate_histogram("class"),
);

Map.addLayer(
  groundTruth2024.filter(ee.Filter.eq("class", 1)),
  { color: "00ff00" },
  "GT Vegetasi 2024",
  false,
);

Map.addLayer(
  groundTruth2024.filter(ee.Filter.eq("class", 0)),
  { color: "ff0000" },
  "GT Non-Vegetasi 2024",
  false,
);

Map.addLayer(
  groundTruth2025.filter(ee.Filter.eq("class", 1)),
  { color: "00ffff" },
  "GT Vegetasi 2025",
  false,
);

Map.addLayer(
  groundTruth2025.filter(ee.Filter.eq("class", 0)),
  { color: "ff9900" },
  "GT Non-Vegetasi 2025",
  false,
);

// =====================================================
// 4. SAMPLING NILAI PIKSEL TAHUN 2024
// =====================================================

var samples2024Raw = featureStack2024.select(inputBands).sampleRegions({
  collection: groundTruth2024,
  properties: ["class", "year", "label"],
  scale: 10,
  geometries: true,
  tileScale: 4,
});

var samples2024 = samples2024Raw.filter(
  ee.Filter.notNull(inputBands.concat(["class"])),
);

var invalidCount2024 = groundTruth2024.size().subtract(samples2024.size());

print("Jumlah sampel valid 2024:", samples2024.size());
print("Jumlah sampel tidak valid 2024:", invalidCount2024);

print(
  "Distribusi sampel valid 2024:",
  samples2024.aggregate_histogram("class"),
);

// =====================================================
// 5. SAMPLING NILAI PIKSEL TAHUN 2025
// =====================================================

var samples2025Raw = featureStack2025.select(inputBands).sampleRegions({
  collection: groundTruth2025,
  properties: ["class", "year", "label"],
  scale: 10,
  geometries: true,
  tileScale: 4,
});

var samples2025 = samples2025Raw.filter(
  ee.Filter.notNull(inputBands.concat(["class"])),
);

var invalidCount2025 = groundTruth2025.size().subtract(samples2025.size());

print("Jumlah sampel valid 2025:", samples2025.size());
print("Jumlah sampel tidak valid 2025:", invalidCount2025);

print(
  "Distribusi sampel valid 2025:",
  samples2025.aggregate_histogram("class"),
);

// =====================================================
// 6. GABUNGKAN SAMPEL 2024 DAN 2025
// =====================================================

var allSamples = samples2024.merge(samples2025);

print("Total seluruh sampel valid:", allSamples.size());

print(
  "Distribusi seluruh sampel per kelas:",
  allSamples.aggregate_histogram("class"),
);

print(
  "Distribusi seluruh sampel per tahun:",
  allSamples.aggregate_histogram("year"),
);

// =====================================================
// 7. SPLIT TRAINING DAN TESTING 70:30
// =====================================================

var randomSeed = 42;

var samplesRandom = allSamples.randomColumn({
  columnName: "random",
  seed: randomSeed,
});

var trainingSamples = samplesRandom.filter(ee.Filter.lt("random", 0.7));

var testingSamples = samplesRandom.filter(ee.Filter.gte("random", 0.7));

print("Jumlah training 70%:", trainingSamples.size());
print("Jumlah testing 30%:", testingSamples.size());

print(
  "Distribusi kelas training:",
  trainingSamples.aggregate_histogram("class"),
);

print("Distribusi kelas testing:", testingSamples.aggregate_histogram("class"));

// =====================================================
// 8. TRAIN RANDOM FOREST 150 TREES
// =====================================================

var numberOfTrees = 150;

var randomForest = ee.Classifier.smileRandomForest({
  numberOfTrees: 150,
  variablesPerSplit: 3,
  minLeafPopulation: 2,
  bagFraction: 0.7,
  maxNodes: 256,
  seed: randomSeed,
}).train({
  features: trainingSamples,
  classProperty: "class",
  inputProperties: inputBands,
});

print("Model Random Forest:", randomForest);
print("Informasi model Random Forest:", randomForest.explain());

// =====================================================
// 9. FUNGSI EVALUASI MODEL
// =====================================================
// Fungsi ini menghitung:
// - Confusion matrix
// - Accuracy
// - Kappa
// - Precision kelas 1
// - Recall kelas 1
// - F1-score kelas 1
// =====================================================

function evaluateClassification(sampleCollection, classifier, evaluationName) {
  var prediction = sampleCollection.classify({
    classifier: classifier,
    outputName: "prediction",
  });

  var matrix = prediction.errorMatrix("class", "prediction", [0, 1]);

  var matrixArray = ee.Array(matrix.array());

  var trueNegative = ee.Number(matrixArray.get([0, 0]));

  var falsePositive = ee.Number(matrixArray.get([0, 1]));

  var falseNegative = ee.Number(matrixArray.get([1, 0]));

  var truePositive = ee.Number(matrixArray.get([1, 1]));

  var precisionTarget = ee.Number(
    ee.Algorithms.If(
      truePositive.add(falsePositive).neq(0),
      truePositive.divide(truePositive.add(falsePositive)),
      0,
    ),
  );

  var recallTarget = ee.Number(
    ee.Algorithms.If(
      truePositive.add(falseNegative).neq(0),
      truePositive.divide(truePositive.add(falseNegative)),
      0,
    ),
  );

  var f1Target = ee.Number(
    ee.Algorithms.If(
      precisionTarget.add(recallTarget).neq(0),
      precisionTarget
        .multiply(recallTarget)
        .multiply(2)
        .divide(precisionTarget.add(recallTarget)),
      0,
    ),
  );

  print("========================================");

  print("HASIL EVALUASI " + evaluationName);

  print("========================================");

  print("Confusion Matrix " + evaluationName + ":", matrix);

  print("Overall Accuracy " + evaluationName + ":", matrix.accuracy());

  print("Kappa " + evaluationName + ":", matrix.kappa());

  print(
    "Producer Accuracy per kelas " + evaluationName + ":",
    matrix.producersAccuracy(),
  );

  print(
    "Consumer Accuracy per kelas " + evaluationName + ":",
    matrix.consumersAccuracy(),
  );

  print("True Negative " + evaluationName + ":", trueNegative);

  print("False Positive " + evaluationName + ":", falsePositive);

  print("False Negative " + evaluationName + ":", falseNegative);

  print("True Positive " + evaluationName + ":", truePositive);

  print("Precision kelas target 1 " + evaluationName + ":", precisionTarget);

  print("Recall kelas target 1 " + evaluationName + ":", recallTarget);

  print("F1-score kelas target 1 " + evaluationName + ":", f1Target);

  return ee.Dictionary({
    name: evaluationName,
    prediction: prediction,
    confusionMatrix: matrix,
    trueNegative: trueNegative,
    falsePositive: falsePositive,
    falseNegative: falseNegative,
    truePositive: truePositive,
    accuracy: matrix.accuracy(),
    precision: precisionTarget,
    recall: recallTarget,
    f1Score: f1Target,
    kappa: matrix.kappa(),
  });
}

// =====================================================
// 10. EVALUASI TRAINING
// =====================================================

var trainingEvaluation = evaluateClassification(
  trainingSamples,
  randomForest,
  "TRAINING",
);

var trainingPrediction = ee.FeatureCollection(
  trainingEvaluation.get("prediction"),
);

var trainingConfusionMatrix = ee.ConfusionMatrix(
  trainingEvaluation.get("confusionMatrix"),
);

var trainingTrueNegative = ee.Number(trainingEvaluation.get("trueNegative"));

var trainingFalsePositive = ee.Number(trainingEvaluation.get("falsePositive"));

var trainingFalseNegative = ee.Number(trainingEvaluation.get("falseNegative"));

var trainingTruePositive = ee.Number(trainingEvaluation.get("truePositive"));

var trainingAccuracy = ee.Number(trainingEvaluation.get("accuracy"));

var trainingPrecision = ee.Number(trainingEvaluation.get("precision"));

var trainingRecall = ee.Number(trainingEvaluation.get("recall"));

var trainingF1 = ee.Number(trainingEvaluation.get("f1Score"));

var trainingKappa = ee.Number(trainingEvaluation.get("kappa"));

// =====================================================
// 11. EVALUASI TESTING
// =====================================================

var testingEvaluation = evaluateClassification(
  testingSamples,
  randomForest,
  "TESTING",
);

var testingPrediction = ee.FeatureCollection(
  testingEvaluation.get("prediction"),
);

var confusionMatrix = ee.ConfusionMatrix(
  testingEvaluation.get("confusionMatrix"),
);

var trueNegative = ee.Number(testingEvaluation.get("trueNegative"));

var falsePositive = ee.Number(testingEvaluation.get("falsePositive"));

var falseNegative = ee.Number(testingEvaluation.get("falseNegative"));

var truePositive = ee.Number(testingEvaluation.get("truePositive"));

var testingAccuracy = ee.Number(testingEvaluation.get("accuracy"));

var precisionTarget = ee.Number(testingEvaluation.get("precision"));

var recallTarget = ee.Number(testingEvaluation.get("recall"));

var f1Target = ee.Number(testingEvaluation.get("f1Score"));

var testingKappa = ee.Number(testingEvaluation.get("kappa"));

// =====================================================
// 12. PERBANDINGAN TRAINING DAN TESTING
// =====================================================

var accuracyGap = trainingAccuracy.subtract(testingAccuracy);

var precisionGap = trainingPrecision.subtract(precisionTarget);

var recallGap = trainingRecall.subtract(recallTarget);

var f1Gap = trainingF1.subtract(f1Target);

var kappaGap = trainingKappa.subtract(testingKappa);

print("========================================");
print("PERBANDINGAN TRAINING DAN TESTING");
print("========================================");

print("Accuracy TRAINING:", trainingAccuracy);
print("Accuracy TESTING:", testingAccuracy);
print("Selisih Accuracy TRAINING - TESTING:", accuracyGap);

print("Precision TRAINING:", trainingPrecision);
print("Precision TESTING:", precisionTarget);
print("Selisih Precision TRAINING - TESTING:", precisionGap);

print("Recall TRAINING:", trainingRecall);
print("Recall TESTING:", recallTarget);
print("Selisih Recall TRAINING - TESTING:", recallGap);

print("F1-score TRAINING:", trainingF1);
print("F1-score TESTING:", f1Target);
print("Selisih F1-score TRAINING - TESTING:", f1Gap);

print("Kappa TRAINING:", trainingKappa);
print("Kappa TESTING:", testingKappa);
print("Selisih Kappa TRAINING - TESTING:", kappaGap);

// =====================================================
// 13. INTERPRETASI POLA KESALAHAN TESTING
// =====================================================

var errorInterpretation = ee.Dictionary({
  target_class: 1,
  target_label: "Vegetasi",
  false_positive_testing: falsePositive,
  false_negative_testing: falseNegative,
  false_positive_meaning: "Aktual non-vegetasi tetapi diprediksi vegetasi",
  false_negative_meaning: "Aktual vegetasi tetapi diprediksi non-vegetasi",
  possible_confusion:
    "Vegetasi jarang, semak, permukiman berpohon, tanah terbuka lembap, pesisir, dan piksel campuran",
  model_limitation:
    "Ground truth manual terbatas, piksel Sentinel-2 dapat berisi campuran objek, dan kondisi citra antar-tahun dapat berbeda",
});

print("Interpretasi pola kesalahan testing:", errorInterpretation);

// =====================================================
// 14. TABEL RINGKASAN EVALUASI
// =====================================================

var evaluationSummary = ee.FeatureCollection([
  ee.Feature(null, {
    dataset: "Training",
    target_class: 1,
    target_label: "Vegetasi",
    number_of_trees: numberOfTrees,
    random_seed: randomSeed,
    split_ratio: "70:30",
    jumlah_samples: trainingSamples.size(),
    true_negative: trainingTrueNegative,
    false_positive: trainingFalsePositive,
    false_negative: trainingFalseNegative,
    true_positive: trainingTruePositive,
    overall_accuracy: trainingAccuracy,
    precision_target_1: trainingPrecision,
    recall_target_1: trainingRecall,
    f1_score_target_1: trainingF1,
    kappa: trainingKappa,
  }),

  ee.Feature(null, {
    dataset: "Testing",
    target_class: 1,
    target_label: "Vegetasi",
    number_of_trees: numberOfTrees,
    random_seed: randomSeed,
    split_ratio: "70:30",
    jumlah_samples: testingSamples.size(),
    true_negative: trueNegative,
    false_positive: falsePositive,
    false_negative: falseNegative,
    true_positive: truePositive,
    overall_accuracy: testingAccuracy,
    precision_target_1: precisionTarget,
    recall_target_1: recallTarget,
    f1_score_target_1: f1Target,
    kappa: testingKappa,
  }),
]);

print("Tabel evaluasi training dan testing:", evaluationSummary);

// =====================================================
// 15. TABEL SELISIH TRAINING DAN TESTING
// =====================================================

var comparisonSummary = ee.FeatureCollection([
  ee.Feature(null, {
    accuracy_training: trainingAccuracy,
    accuracy_testing: testingAccuracy,
    accuracy_gap: accuracyGap,

    precision_training: trainingPrecision,
    precision_testing: precisionTarget,
    precision_gap: precisionGap,

    recall_training: trainingRecall,
    recall_testing: recallTarget,
    recall_gap: recallGap,

    f1_training: trainingF1,
    f1_testing: f1Target,
    f1_gap: f1Gap,

    kappa_training: trainingKappa,
    kappa_testing: testingKappa,
    kappa_gap: kappaGap,
  }),
]);

print("Ringkasan perbandingan training-testing:", comparisonSummary);

// =====================================================
// 13. FEATURE IMPORTANCE
// =====================================================

var modelExplanation = ee.Dictionary(randomForest.explain());
var featureImportance = ee.Dictionary(modelExplanation.get("importance"));

print("Feature Importance:", featureImportance);

var importanceFeature = ee.Feature(null, featureImportance);

var importanceChart = ui.Chart.feature
  .byProperty(importanceFeature)
  .setChartType("ColumnChart")
  .setOptions({
    title: "Feature Importance Random Forest",
    legend: { position: "none" },
    hAxis: { title: "Band dan indeks" },
    vAxis: { title: "Nilai importance" },
  });

print(importanceChart);

// =====================================================
// 14. KLASIFIKASI BINER TAHUN 2024
// =====================================================

var classification2024 = featureStack2024
  .select(inputBands)
  .classify(randomForest)
  .rename("classification")
  .clip(boundaryGeometry)
  .toByte();

// =====================================================
// 15. KLASIFIKASI BINER TAHUN 2025
// =====================================================

var classification2025 = featureStack2025
  .select(inputBands)
  .classify(randomForest)
  .rename("classification")
  .clip(boundaryGeometry)
  .toByte();

var classificationVis = {
  min: 0,
  max: 1,
  palette: ["d7191c", "1a9641"],
};

Map.addLayer(
  classification2024,
  classificationVis,
  "RF Klasifikasi Biner 2024",
  false,
);

Map.addLayer(
  classification2025,
  classificationVis,
  "RF Klasifikasi Biner 2025",
  false,
);

// =====================================================
// 16. CHANGE MAP EMPAT KONDISI
// =====================================================

var change2024to2025 = classification2024
  .multiply(2)
  .add(classification2025)
  .rename("change")
  .clip(boundaryGeometry)
  .toByte();

var changeVis = {
  min: 0,
  max: 3,
  palette: ["bdbdbd", "00bfff", "ff0000", "006400"],
};

Map.addLayer(change2024to2025, changeVis, "Change Detection 2024-2025", true);

print(
  "Keterangan change code:",
  ee.Dictionary({
    0: "Tetap non-vegetasi",
    1: "Gain vegetasi",
    2: "Loss vegetasi",
    3: "Tetap vegetasi",
  }),
);

// =====================================================
// 17. LAYER TAMBAHAN BERUBAH VS TETAP
// =====================================================

var onlyChanged = change2024to2025.updateMask(
  change2024to2025.eq(1).or(change2024to2025.eq(2)),
);

var onlyChangedVis = {
  min: 1,
  max: 2,
  palette: ["00bfff", "ff0000"],
};

Map.addLayer(onlyChanged, onlyChangedVis, "Hanya Area yang Berubah", false);

var changeStatus = change2024to2025
  .eq(1)
  .or(change2024to2025.eq(2))
  .rename("change_status")
  .toByte();

var changeStatusVis = {
  min: 0,
  max: 1,
  palette: ["808080", "ffff00"],
};

Map.addLayer(
  changeStatus,
  changeStatusVis,
  "Status Berubah dan Tidak Berubah",
  false,
);

// =====================================================
// 18. LEGENDA CHANGE MAP
// =====================================================

var legend = ui.Panel({
  style: {
    position: "bottom-left",
    padding: "8px 15px",
    backgroundColor: "white",
  },
});

var legendTitle = ui.Label({
  value: "Perubahan Tutupan Lahan 2024-2025",
  style: {
    fontWeight: "bold",
    fontSize: "14px",
    margin: "0 0 8px 0",
  },
});

legend.add(legendTitle);

function makeLegendRow(color, label) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: color,
      padding: "8px",
      margin: "0 8px 4px 0",
    },
  });

  var description = ui.Label({
    value: label,
    style: {
      margin: "0 0 4px 0",
    },
  });

  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow("horizontal"),
  });
}

legend.add(makeLegendRow("#bdbdbd", "Tetap non-vegetasi"));
legend.add(makeLegendRow("#00bfff", "Gain vegetasi"));
legend.add(makeLegendRow("#ff0000", "Loss vegetasi"));
legend.add(makeLegendRow("#006400", "Tetap vegetasi"));

Map.add(legend);

// =====================================================
// 19. HITUNG LUAS KOTA AMBON
// =====================================================

var luasKotaHa = ee.Number(
  ee.Image.pixelArea()
    .divide(10000)
    .rename("area_ha")
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: boundaryGeometry,
      scale: 10,
      maxPixels: 1e13,
      tileScale: 4,
    })
    .get("area_ha"),
);

print("Luas Kota Ambon (ha):", luasKotaHa);
print("Luas Kota Ambon (km2):", luasKotaHa.divide(100));

// =====================================================
// 20. HITUNG LUAS KELAS PER TAHUN
// =====================================================

function calculateClassArea(classifiedImage, year) {
  var areaImage = ee.Image.pixelArea()
    .divide(10000)
    .rename("area_ha")
    .addBands(classifiedImage.rename("class"));

  var result = areaImage.reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: "class",
    }),
    geometry: boundaryGeometry,
    scale: 10,
    maxPixels: 1e13,
    tileScale: 4,
  });

  var groups = ee.List(result.get("groups"));

  return ee.FeatureCollection(
    groups.map(function (item) {
      item = ee.Dictionary(item);

      var classValue = ee.Number(item.get("class"));
      var areaHa = ee.Number(item.get("sum"));

      var category = ee.String(
        ee.Algorithms.If(classValue.eq(0), "Non-vegetasi", "Vegetasi"),
      );

      var percentageCity = areaHa.divide(luasKotaHa).multiply(100);

      return ee.Feature(null, {
        year: year,
        class: classValue,
        category: category,
        area_ha: areaHa,
        area_km2: areaHa.divide(100),
        percentage_of_city: percentageCity,
      });
    }),
  );
}

var areaClass2024 = calculateClassArea(classification2024, 2024);

var areaClass2025 = calculateClassArea(classification2025, 2025);

print("Luas kelas RF tahun 2024:", areaClass2024);
print("Luas kelas RF tahun 2025:", areaClass2025);

// =====================================================
// 21. LUAS DAN PERSENTASE VEGETASI
// =====================================================

var targetFeature2024 = areaClass2024.filter(ee.Filter.eq("class", 1)).first();

var targetFeature2025 = areaClass2025.filter(ee.Filter.eq("class", 1)).first();

var luasVegetasi2024Ha = ee.Number(
  ee.Algorithms.If(
    targetFeature2024,
    ee.Feature(targetFeature2024).get("area_ha"),
    0,
  ),
);

var luasVegetasi2025Ha = ee.Number(
  ee.Algorithms.If(
    targetFeature2025,
    ee.Feature(targetFeature2025).get("area_ha"),
    0,
  ),
);

var persenVegetasi2024 = ee.Number(
  ee.Algorithms.If(
    targetFeature2024,
    ee.Feature(targetFeature2024).get("percentage_of_city"),
    0,
  ),
);

var persenVegetasi2025 = ee.Number(
  ee.Algorithms.If(
    targetFeature2025,
    ee.Feature(targetFeature2025).get("percentage_of_city"),
    0,
  ),
);

print("Luas vegetasi 2024 (ha):", luasVegetasi2024Ha);
print("Persentase vegetasi 2024 terhadap kota (%):", persenVegetasi2024);

print("Luas vegetasi 2025 (ha):", luasVegetasi2025Ha);
print("Persentase vegetasi 2025 terhadap kota (%):", persenVegetasi2025);

// =====================================================
// 22. HITUNG LUAS CHANGE MAP
// =====================================================

var changeAreaImage = ee.Image.pixelArea()
  .divide(10000)
  .rename("area_ha")
  .addBands(change2024to2025.rename("change_code"));

var changeAreaResult = changeAreaImage.reduceRegion({
  reducer: ee.Reducer.sum().group({
    groupField: 1,
    groupName: "change_code",
  }),
  geometry: boundaryGeometry,
  scale: 10,
  maxPixels: 1e13,
  tileScale: 4,
});

var changeGroups = ee.List(changeAreaResult.get("groups"));

var changeAreaTable = ee.FeatureCollection(
  changeGroups.map(function (item) {
    item = ee.Dictionary(item);

    var code = ee.Number(item.get("change_code"));
    var areaHa = ee.Number(item.get("sum"));

    var category = ee.String(
      ee.Algorithms.If(
        code.eq(0),
        "Tetap non-vegetasi",
        ee.Algorithms.If(
          code.eq(1),
          "Gain vegetasi",
          ee.Algorithms.If(code.eq(2), "Loss vegetasi", "Tetap vegetasi"),
        ),
      ),
    );

    return ee.Feature(null, {
      change_code: code,
      category: category,
      area_ha: areaHa,
      area_km2: areaHa.divide(100),
      percentage_of_city: areaHa.divide(luasKotaHa).multiply(100),
    });
  }),
);

print("Tabel luas change map:", changeAreaTable);

// =====================================================
// 23. PERUBAHAN KUANTITATIF
// =====================================================

function getChangeArea(changeCode) {
  var selectedFeature = changeAreaTable
    .filter(ee.Filter.eq("change_code", changeCode))
    .first();

  return ee.Number(
    ee.Algorithms.If(
      selectedFeature,
      ee.Feature(selectedFeature).get("area_ha"),
      0,
    ),
  );
}

var luasTetapNonVegetasiHa = getChangeArea(0);
var luasGainHa = getChangeArea(1);
var luasLossHa = getChangeArea(2);
var luasTetapVegetasiHa = getChangeArea(3);

var perubahanBersihHa = luasVegetasi2025Ha.subtract(luasVegetasi2024Ha);

var perubahanGainLossHa = luasGainHa.subtract(luasLossHa);

var persenPerubahanTerhadap2024 = ee.Number(
  ee.Algorithms.If(
    luasVegetasi2024Ha.neq(0),
    perubahanBersihHa.divide(luasVegetasi2024Ha).multiply(100),
    0,
  ),
);

print("Luas tetap non-vegetasi (ha):", luasTetapNonVegetasiHa);
print("Luas gain vegetasi (ha):", luasGainHa);
print("Luas loss vegetasi (ha):", luasLossHa);
print("Luas vegetasi yang tetap (ha):", luasTetapVegetasiHa);

print("Perubahan bersih vegetasi 2025 - 2024 (ha):", perubahanBersihHa);

print("Pemeriksaan gain - loss (ha):", perubahanGainLossHa);

print(
  "Persentase perubahan terhadap vegetasi 2024 (%):",
  persenPerubahanTerhadap2024,
);

var quantitativeChangeSummary = ee.FeatureCollection([
  ee.Feature(null, {
    luas_kota_ha: luasKotaHa,
    luas_vegetasi_2024_ha: luasVegetasi2024Ha,
    persen_vegetasi_2024: persenVegetasi2024,
    luas_vegetasi_2025_ha: luasVegetasi2025Ha,
    persen_vegetasi_2025: persenVegetasi2025,
    luas_gain_ha: luasGainHa,
    luas_loss_ha: luasLossHa,
    luas_tetap_vegetasi_ha: luasTetapVegetasiHa,
    luas_tetap_nonvegetasi_ha: luasTetapNonVegetasiHa,
    perubahan_bersih_ha: perubahanBersihHa,
    pemeriksaan_gain_minus_loss_ha: perubahanGainLossHa,
    persen_perubahan_terhadap_2024: persenPerubahanTerhadap2024,
  }),
]);

print("Ringkasan perubahan kuantitatif:", quantitativeChangeSummary);

// =====================================================
// 24. PARAMETER PEMBERSIHAN POLYGON WEBGIS
// =====================================================
//
// 25 piksel pada resolusi 10 m sekitar 0,25 ha.
// Naikkan menjadi 50 jika GeoJSON masih terlalu besar.
// =====================================================

var vectorScale = 10;
var minimumPatchPixels = 25;
var minimumAreaHa = 0.25;

// Simplify dinonaktifkan agar Polygon tidak berubah menjadi
// GeometryCollection atau LineString.
var simplifyTolerance = 0;

// =====================================================
// 25. FUNGSI MEMBERSIHKAN RASTER BINER
// =====================================================

function cleanBinaryRaster(binaryImage) {
  var binaryMask = binaryImage.eq(1).selfMask().rename("label").toByte();

  var connectedPixels = binaryMask.connectedPixelCount({
    maxSize: 1024,
    eightConnected: true,
  });

  return binaryMask
    .updateMask(connectedPixels.gte(minimumPatchPixels))
    .rename("label")
    .toByte();
}

// =====================================================
// 26. FUNGSI RASTER KE POLYGON BERSIH
// =====================================================

function rasterToCleanPolygon(
  binaryRaster,
  yearValue,
  categoryValue,
  changeCodeValue,
) {
  var cleanedRaster = cleanBinaryRaster(binaryRaster);

  var polygons = cleanedRaster.reduceToVectors({
    geometry: boundaryGeometry,
    scale: vectorScale,
    geometryType: "polygon",
    eightConnected: true,
    labelProperty: "raster_value",
    reducer: ee.Reducer.countEvery(),
    bestEffort: false,
    maxPixels: 1e13,
    tileScale: 4,
  });

  var cleanedPolygons = polygons.map(function (feature) {
    feature = ee.Feature(feature);

    // Jangan gunakan simplify(), karena polygon kecil atau sempit
    // dapat berubah menjadi GeometryCollection/LineString.
    // Geometry asli dari reduceToVectors dipertahankan.
    var polygonGeometry = feature.geometry();

    var areaM2 = polygonGeometry.area(1);
    var areaHa = areaM2.divide(10000);
    var geometryType = polygonGeometry.type();

    return ee.Feature(polygonGeometry, {
      year: yearValue,
      category: categoryValue,
      change_code: changeCodeValue,
      area_m2: areaM2,
      area_ha: areaHa,
      source: "Sentinel-2 SR Harmonized",
      model: "Random Forest 150 trees",
      resolution_m: vectorScale,
      geometry_type: geometryType,
    });
  });

  // Hanya pertahankan geometry polygonal.
  return cleanedPolygons
    .filter(ee.Filter.gte("area_ha", minimumAreaHa))
    .filter(ee.Filter.inList("geometry_type", ["Polygon", "MultiPolygon"]));
}

// =====================================================
// 27. POLYGON TARGET VEGETASI 2024
// =====================================================

var targetRaster2024 = classification2024.eq(1).rename("target").toByte();

var polygonTarget2024 = rasterToCleanPolygon(
  targetRaster2024,
  2024,
  "Vegetasi 2024",
  -1,
);

print("Jumlah polygon target 2024:", polygonTarget2024.size());

Map.addLayer(
  polygonTarget2024,
  { color: "1a9641" },
  "Polygon Vegetasi 2024",
  false,
);

// =====================================================
// 28. POLYGON TARGET VEGETASI 2025
// =====================================================

var targetRaster2025 = classification2025.eq(1).rename("target").toByte();

var polygonTarget2025 = rasterToCleanPolygon(
  targetRaster2025,
  2025,
  "Vegetasi 2025",
  -1,
);

print("Jumlah polygon target 2025:", polygonTarget2025.size());

Map.addLayer(
  polygonTarget2025,
  { color: "00aa00" },
  "Polygon Vegetasi 2025",
  false,
);

// =====================================================
// 29. POLYGON GAIN VEGETASI
// =====================================================

var gainRaster = change2024to2025.eq(1).rename("gain").toByte();

var polygonGain = rasterToCleanPolygon(
  gainRaster,
  2025,
  "Gain Vegetasi 2024-2025",
  1,
);

print("Jumlah polygon gain:", polygonGain.size());

Map.addLayer(polygonGain, { color: "00bfff" }, "Polygon Gain Vegetasi", false);

// =====================================================
// 30. POLYGON LOSS VEGETASI
// =====================================================

var lossRaster = change2024to2025.eq(2).rename("loss").toByte();

var polygonLoss = rasterToCleanPolygon(
  lossRaster,
  2025,
  "Loss Vegetasi 2024-2025",
  2,
);

print("Jumlah polygon loss:", polygonLoss.size());

Map.addLayer(polygonLoss, { color: "ff0000" }, "Polygon Loss Vegetasi", false);

// =====================================================
// 31. POLYGON CHANGE MAP LENGKAP EMPAT KELAS
// =====================================================
//
// GeoJSON ini memuat seluruh kelas perubahan:
// 0 = Tetap non-vegetasi
// 1 = Gain vegetasi
// 2 = Loss vegetasi
// 3 = Tetap vegetasi
//
// Setiap kelas dibersihkan menggunakan parameter patch
// yang sama agar ukuran GeoJSON tetap lebih ringan.
// =====================================================

var tetapNonVegetasiRaster = change2024to2025
  .eq(0)
  .rename("tetap_nonvegetasi")
  .toByte();

var tetapVegetasiRaster = change2024to2025
  .eq(3)
  .rename("tetap_vegetasi")
  .toByte();

var polygonTetapNonVegetasi = rasterToCleanPolygon(
  tetapNonVegetasiRaster,
  2025,
  "Tetap non-vegetasi",
  0,
);

var polygonTetapVegetasi = rasterToCleanPolygon(
  tetapVegetasiRaster,
  2025,
  "Tetap vegetasi",
  3,
);

function addChangeTransitionAttributes(
  featureCollection,
  class2024,
  class2025,
  statusValue,
  categoryValue,
) {
  return featureCollection.map(function (feature) {
    return ee.Feature(feature).set({
      period: "2024-2025",
      year_from: 2024,
      year_to: 2025,
      class_2024: class2024,
      class_2025: class2025,
      change_status: statusValue,
      category: categoryValue,
      minimum_patch_pixels: minimumPatchPixels,
      minimum_area_ha: minimumAreaHa,
    });
  });
}

var polygonChangeCode0 = addChangeTransitionAttributes(
  polygonTetapNonVegetasi,
  0,
  0,
  "Tidak berubah",
  "Tetap non-vegetasi",
);

var polygonChangeCode1 = addChangeTransitionAttributes(
  polygonGain,
  0,
  1,
  "Berubah",
  "Gain vegetasi",
);

var polygonChangeCode2 = addChangeTransitionAttributes(
  polygonLoss,
  1,
  0,
  "Berubah",
  "Loss vegetasi",
);

var polygonChangeCode3 = addChangeTransitionAttributes(
  polygonTetapVegetasi,
  1,
  1,
  "Tidak berubah",
  "Tetap vegetasi",
);

var polygonChangeMap = polygonChangeCode0
  .merge(polygonChangeCode1)
  .merge(polygonChangeCode2)
  .merge(polygonChangeCode3);

print("Jumlah seluruh polygon change map 4 kelas:", polygonChangeMap.size());

print(
  "Distribusi polygon berdasarkan change code:",
  polygonChangeMap.aggregate_histogram("change_code"),
);

print(
  "Distribusi polygon berdasarkan kategori:",
  polygonChangeMap.aggregate_histogram("category"),
);

Map.addLayer(
  polygonTetapNonVegetasi,
  { color: "bdbdbd" },
  "Polygon Tetap Non-Vegetasi",
  false,
);

Map.addLayer(
  polygonTetapVegetasi,
  { color: "006400" },
  "Polygon Tetap Vegetasi",
  false,
);

// =====================================================
// 32. PASTIKAN GEOMETRY POLYGON TIDAK NULL
// =====================================================
//
// Setiap fitur dibentuk ulang dengan geometry aslinya.
// Langkah ini memastikan geometry Polygon/MultiPolygon
// tetap ikut saat diekspor menjadi GeoJSON.
// =====================================================

function preparePolygonForGeoJSON(featureCollection) {
  return ee
    .FeatureCollection(
      featureCollection.map(function (feature) {
        feature = ee.Feature(feature);

        var geometry = feature.geometry();

        return ee.Feature(geometry, feature.toDictionary()).set({
          geometry_type: geometry.type(),
        });
      }),
    )
    .filter(ee.Filter.notNull(["year", "category", "area_ha"]));
}

var polygonTarget2024Export = preparePolygonForGeoJSON(polygonTarget2024);

var polygonTarget2025Export = preparePolygonForGeoJSON(polygonTarget2025);

var polygonGainExport = preparePolygonForGeoJSON(polygonGain);

var polygonLossExport = preparePolygonForGeoJSON(polygonLoss);

var polygonChangeMapExport = preparePolygonForGeoJSON(polygonChangeMap);

// =====================================================
// 33. PEMERIKSAAN POLYGON
// =====================================================

print("========================================");
print("PEMERIKSAAN POLYGON UNTUK WEBGIS");
print("========================================");

print("Minimum patch pixel:", minimumPatchPixels);
print("Minimum luas polygon (ha):", minimumAreaHa);
print("Simplify dinonaktifkan (0 = off):", simplifyTolerance);

print("Jumlah polygon vegetasi 2024:", polygonTarget2024.size());

print("Jumlah polygon vegetasi 2025:", polygonTarget2025.size());

print("Jumlah polygon gain:", polygonGain.size());
print("Jumlah polygon loss:", polygonLoss.size());

print("Jumlah polygon change map lengkap:", polygonChangeMapExport.size());

print(
  "Distribusi change code GeoJSON lengkap:",
  polygonChangeMapExport.aggregate_histogram("change_code"),
);

print(
  "Distribusi geometry vegetasi 2024:",
  polygonTarget2024.aggregate_histogram("geometry_type"),
);

print(
  "Distribusi geometry vegetasi 2025:",
  polygonTarget2025.aggregate_histogram("geometry_type"),
);

print(
  "Distribusi geometry gain:",
  polygonGain.aggregate_histogram("geometry_type"),
);

print(
  "Distribusi geometry loss:",
  polygonLoss.aggregate_histogram("geometry_type"),
);

print(
  "Geometry type vegetasi 2024:",
  polygonTarget2024Export.first().geometry().type(),
);

print(
  "Geometry type vegetasi 2025:",
  polygonTarget2025Export.first().geometry().type(),
);

print("Geometry type gain:", polygonGainExport.first().geometry().type());

print("Geometry type loss:", polygonLossExport.first().geometry().type());

print(
  "Geometry type change map lengkap:",
  polygonChangeMapExport.first().geometry().type(),
);

print(
  "Koordinat contoh vegetasi 2024:",
  polygonTarget2024Export.first().geometry().coordinates(),
);

// =====================================================
// 34. EXPORT RASTER DAN TABEL
// =====================================================

Export.image.toDrive({
  image: classification2024,
  description: "RF_Klasifikasi_Biner_Ambon_2024",
  folder: "GeoAI_UAS",
  fileNamePrefix: "RF_Klasifikasi_Biner_Ambon_2024",
  region: boundaryGeometry,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: "GeoTIFF",
});

Export.image.toDrive({
  image: classification2025,
  description: "RF_Klasifikasi_Biner_Ambon_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "RF_Klasifikasi_Biner_Ambon_2025",
  region: boundaryGeometry,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: "GeoTIFF",
});

Export.image.toDrive({
  image: change2024to2025,
  description: "RF_Change_Map_Ambon_2024_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "RF_Change_Map_Ambon_2024_2025",
  region: boundaryGeometry,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: "GeoTIFF",
});

Export.image.toDrive({
  image: changeStatus,
  description: "RF_Status_Perubahan_Ambon_2024_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "RF_Status_Perubahan_Ambon_2024_2025",
  region: boundaryGeometry,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: "GeoTIFF",
});

Export.table.toDrive({
  collection: samplesRandom,
  description: "RF_Samples_Ambon_2024_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "RF_Samples_Ambon_2024_2025",
  fileFormat: "CSV",
  selectors: inputBands.concat(["class", "year", "label", "random"]),
});

Export.table.toDrive({
  collection: testingPrediction,
  description: "RF_Testing_Result_Ambon_2024_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "RF_Testing_Result_Ambon_2024_2025",
  fileFormat: "CSV",
  selectors: inputBands.concat(["class", "prediction", "year", "label"]),
});

Export.table.toDrive({
  collection: evaluationSummary,
  description: "Evaluasi_APRF_RF_Ambon_2024_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "Evaluasi_APRF_RF_Ambon_2024_2025",
  fileFormat: "CSV",
});

Export.table.toDrive({
  collection: areaClass2024,
  description: "Luas_Kelas_RF_Ambon_2024",
  folder: "GeoAI_UAS",
  fileNamePrefix: "Luas_Kelas_RF_Ambon_2024",
  fileFormat: "CSV",
});

Export.table.toDrive({
  collection: areaClass2025,
  description: "Luas_Kelas_RF_Ambon_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "Luas_Kelas_RF_Ambon_2025",
  fileFormat: "CSV",
});

Export.table.toDrive({
  collection: changeAreaTable,
  description: "Luas_Change_Map_RF_Ambon_2024_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "Luas_Change_Map_RF_Ambon_2024_2025",
  fileFormat: "CSV",
});

Export.table.toDrive({
  collection: quantitativeChangeSummary,
  description: "Ringkasan_Perubahan_Kuantitatif_Ambon_2024_2025",
  folder: "GeoAI_UAS",
  fileNamePrefix: "Ringkasan_Perubahan_Kuantitatif_Ambon_2024_2025",
  fileFormat: "CSV",
});

Export.table.toDrive({
  collection: boundary,
  description: "Boundary_Kota_Ambon",
  folder: "GeoAI_UAS",
  fileNamePrefix: "Boundary_Kota_Ambon",
  fileFormat: "GeoJSON",
});

// =====================================================
// 35. EXPORT LIMA GEOJSON UNTUK WEBGIS
// =====================================================
//
// PENTING:
// - Tidak menggunakan "selectors" pada export GeoJSON.
// - Geometry Polygon/MultiPolygon akan ikut disimpan.
// - Gunakan collection versi "...Export" yang telah
//   dibentuk ulang dengan geometry eksplisit.
// =====================================================

Export.table.toDrive({
  collection: polygonTarget2024Export,

  description: "GeoJSON_Target_Vegetasi_Ambon_2024_With_Geometry",

  folder: "GeoJSON_WebGIS",

  fileNamePrefix: "target_vegetasi_ambon_2024",

  fileFormat: "GeoJSON",
});

Export.table.toDrive({
  collection: polygonTarget2025Export,

  description: "GeoJSON_Target_Vegetasi_Ambon_2025_With_Geometry",

  folder: "GeoJSON_WebGIS",

  fileNamePrefix: "target_vegetasi_ambon_2025",

  fileFormat: "GeoJSON",
});

Export.table.toDrive({
  collection: polygonGainExport,

  description: "GeoJSON_Gain_Vegetasi_Ambon_2024_2025_With_Geometry",

  folder: "GeoJSON_WebGIS",

  fileNamePrefix: "gain_vegetasi_ambon_2024_2025",

  fileFormat: "GeoJSON",
});

Export.table.toDrive({
  collection: polygonLossExport,

  description: "GeoJSON_Loss_Vegetasi_Ambon_2024_2025_With_Geometry",

  folder: "GeoJSON_WebGIS",

  fileNamePrefix: "loss_vegetasi_ambon_2024_2025",

  fileFormat: "GeoJSON",
});

// Change map lengkap empat kelas dalam satu file GeoJSON.
Export.table.toDrive({
  collection: polygonChangeMapExport,

  description: "GeoJSON_RF_Change_Map_Ambon_2024_2025_4_Kelas",

  folder: "GeoJSON_WebGIS",

  fileNamePrefix: "RF_Change_Map_Ambon_2024_2025",

  fileFormat: "GeoJSON",
});

// =====================================================
// RINGKASAN AKHIR
// =====================================================

print("========================================");
print("RANDOM FOREST AMBON SELESAI DISIAPKAN");
print("========================================");

print("Kota = Kota Ambon");
print("Target = Vegetasi");
print("Kelas target = 1");
print("Jumlah fitur = 10");
print("Jumlah pohon = 150");
print("Seed = 42");
print("Split data = 70% training, 30% testing");
print("Evaluasi utama hanya menggunakan testing data.");
print("Model yang sama diterapkan untuk 2024 dan 2025.");
print("Lima GeoJSON WebGIS telah disiapkan dengan geometry eksplisit.");
print("Change map lengkap 4 kelas juga diekspor sebagai GeoJSON.");
print("Buka tab Tasks untuk menjalankan export.");

print("Jumlah fitur asli GT 2024:", groundTruth2024.size());

print("Geometry type GT 2024:", groundTruth2024.first().geometry().type());

print("Jumlah fitur asli GT 2025:", groundTruth2025.size());

print("Geometry type GT 2025:", groundTruth2025.first().geometry().type());
