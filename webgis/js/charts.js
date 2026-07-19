function destroyChart(key) {
  if (APP_STATE.charts[key]) {
    APP_STATE.charts[key].destroy();
    APP_STATE.charts[key] = null;
  }
}

function baseOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: { family: 'Inter', size: 11 },
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: context => {
            const label = context.dataset.label || context.label || '';
            return `${label}: ${Number(context.raw).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e1e6e9' },
        ticks: { font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      }
    }
  };
}

function renderAPRFChart(test) {
  destroyChart('aprf');
  const values = [
    num(test.overall_accuracy) * 100,
    num(test.precision_target_1) * 100,
    num(test.recall_target_1) * 100,
    num(test.f1_score_target_1) * 100
  ];

  APP_STATE.charts.aprf = new Chart(document.getElementById('aprf-chart'), {
    type: 'bar',
    data: {
      labels: ['Accuracy', 'Precision', 'Recall', 'F1-score'],
      datasets: [{
        label: 'Nilai (%)',
        data: values,
        backgroundColor: ['#2980b9', '#8bc34a', '#27ae60', '#f39c12'],
        borderRadius: 9
      }]
    },
    options: {
      ...baseOptions(),
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${safeNumber(c.raw, 2)}%` } }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: '#e1e6e9' },
          ticks: { callback: value => `${value}%` }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderAreaChart(summary) {
  destroyChart('area');
  APP_STATE.charts.area = new Chart(document.getElementById('area-chart'), {
    type: 'bar',
    data: {
      labels: ['2024', '2025'],
      datasets: [{
        label: 'Vegetasi (ha)',
        data: [num(summary.luas_vegetasi_2024_ha), num(summary.luas_vegetasi_2025_ha)],
        backgroundColor: ['#27ae60', '#2980b9'],
        borderRadius: 10
      }]
    },
    options: baseOptions()
  });
}

function renderChangeChart(rows) {
  destroyChart('change');
  APP_STATE.charts.change = new Chart(document.getElementById('change-chart'), {
    type: 'doughnut',
    data: {
      labels: rows.map(row => row.category),
      datasets: [{
        data: rows.map(row => num(row.area_ha)),
        backgroundColor: ['#bdc3c7', '#f1c40f', '#e74c3c', '#27ae60'],
        borderWidth: 3,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, font: { size: 10 } }
        },
        tooltip: {
          callbacks: { label: c => `${c.label}: ${safeNumber(c.raw)} ha` }
        }
      }
    }
  });
}

function renderFeatureImportanceChart() {
  const canvas=document.getElementById('feature-importance-chart');if(!canvas)return;
  destroyChart('featureImportance');
  const rows=[
    ['BSI',33.579],['NDBI',28.931],['NDVI',25.691],['B12',24.127],['B2',22.112],
    ['B4',19.843],['NDWI',19.523],['B8',16.325],['B3',14.488],['B11',11.779]
  ];
  APP_STATE.charts.featureImportance=new Chart(canvas,{type:'bar',data:{labels:rows.map(r=>r[0]),datasets:[{label:'Importance',data:rows.map(r=>r[1]),backgroundColor:'#102c3a',borderRadius:7}]},options:{...baseOptions(),indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${safeNumber(c.raw,3)}`}}},scales:{x:{beginAtZero:true,grid:{color:'#e1e6e9'},title:{display:true,text:'Nilai importance'}},y:{grid:{display:false}}}}});
}

function renderSampleSplitChart(trainCount,testCount) {
  const canvas=document.getElementById('sample-split-chart');if(!canvas)return;
  destroyChart('sampleSplit');
  APP_STATE.charts.sampleSplit=new Chart(canvas,{type:'doughnut',data:{labels:['Training','Testing'],datasets:[{data:[trainCount,testCount],backgroundColor:['#102c3a','#f1c40f'],borderColor:'#FFFFFF',borderWidth:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'64%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.label}: ${safeNumber(c.raw,0)} sampel`}}}}});
}
