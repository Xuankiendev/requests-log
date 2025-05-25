import { useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Requests Per Second (RPS)',
          data: [],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: {
            display: true,
            text: 'RPS Dashboard'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'RPS' }
          },
          x: {
            title: { display: true, text: 'Time' }
          }
        }
      }
    });

    const fetchData = async () => {
      const response = await fetch('/api/rps');
      const { time, rps } = await response.json();
      const chart = chartInstanceRef.current;
      chart.data.labels.push(time);
      chart.data.datasets[0].data.push(rps);
      if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
      }
      chart.update();
    };

    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Head>
        <title>RPS Dashboard</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </Head>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0, backgroundColor: '#f4f4f4' }}>
        <canvas id="rpsChart" ref={chartRef} style={{ maxWidth: '800px', width: '100%' }}></canvas>
      </div>
    </div>
  );
                  }
