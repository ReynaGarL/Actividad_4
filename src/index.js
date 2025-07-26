import './style.scss';
import Chart from 'chart.js/auto';
import Papa from 'papaparse';

const input = document.getElementById('csvFile');
const ctx = document.getElementById('chart').getContext('2d');

let chart;

input.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    complete: (results) => {
      const labels = results.data.map(row => row.Nombre);
      const values = results.data.map(row => parseFloat(row.Valor));

      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Valores',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          }]
        }
      });
    }
  });
});

// Registrar service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}
