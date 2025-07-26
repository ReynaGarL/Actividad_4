import './style.scss';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('csvFile');
  const ctx = document.getElementById('chart').getContext('2d');
  const monthSelector = document.getElementById('monthSelector');
  const chartTypeSelector = document.getElementById('chartType');
  const totalEl = document.getElementById('total');
  const statCategories = document.getElementById('statCategories');
  const statRecords = document.getElementById('statRecords');
  const statAverage = document.getElementById('statAverage');

  let chart;
  let salesData = [];
  let currentChartType = 'bar';

  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        salesData = results.data.filter(row => row.Mes && row.Categoría && row.Cantidad && row.Precio);
        populateMonthSelector(salesData);
        updateChart(salesData, 'Todos', currentChartType);
      }
    });
  });

  monthSelector.addEventListener('change', () => {
    updateChart(salesData, monthSelector.value, currentChartType);
  });

  chartTypeSelector.addEventListener('change', () => {
    currentChartType = chartTypeSelector.value;
    updateChart(salesData, monthSelector.value, currentChartType);
  });

  function populateMonthSelector(data) {
    const months = [...new Set(data.map(row => row.Mes))];
    monthSelector.innerHTML = `<option value="Todos">Todos</option>`;
    months.forEach(m => {
      monthSelector.innerHTML += `<option value="${m}">${m}</option>`;
    });
  }

  function updateChart(data, selectedMonth, chartType) {
    let filtered = selectedMonth === 'Todos' ? data : data.filter(r => r.Mes === selectedMonth);
    
    // Agrupar ingresos por categoría
    const grouped = {};
    filtered.forEach(row => {
      const categoria = row.Categoría;
      const cantidad = parseFloat(row.Cantidad) || 0;
      const precio = parseFloat(row.Precio) || 0;
      const ingreso = cantidad * precio;
      grouped[categoria] = (grouped[categoria] || 0) + ingreso;
    });

    const labels = Object.keys(grouped);
    const values = Object.values(grouped);

    renderChart(labels, values, chartType);
    const total = values.reduce((a, b) => a + b, 0);
    totalEl.textContent = `Ingreso total: $${total.toFixed(2)}`;

    // Actualizar estadísticas
    statCategories.textContent = labels.length;
    statRecords.textContent = filtered.length;
    statAverage.textContent = values.length > 0 ? `$${(total / values.length).toFixed(2)}` : '$0.00';
  }

  function renderChart(labels, values, chartType) {
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label: 'Ingresos por Categoría ($)',
          data: values,
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 205, 86, 0.5)',
            'rgba(201, 203, 207, 0.5)'
          ],
          borderColor: '#333',
          borderWidth: 1
        }]
      }
    });
  }

  // Notificación offline
  window.addEventListener('offline', () => alert('Estás sin conexión, pero la app sigue funcionando'));

  // Registrar service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js');
  }
});
