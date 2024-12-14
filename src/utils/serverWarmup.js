import axios from 'axios';  // Recommended if you're using axios
// or use fetch if you prefer native method

const BACKEND_URL = 'https://codaddy-back.vercel.app';

export const warmUpServer = async () => {
  // Prevent too frequent warm-ups
  const lastWarmUp = localStorage.getItem('serverWarmUpTime');
  const currentTime = Date.now();

  // Only warm up every 30 minutes
  if (lastWarmUp && (currentTime - parseInt(lastWarmUp) < 30 * 60 * 1000)) {
    return;
  }

  try {
    const response = await axios.get(`${BACKEND_URL}/api/warmup`, {
      timeout: 5000  // 5 second timeout
    });

    if (response.status === 200) {
      localStorage.setItem('serverWarmUpTime', currentTime.toString());
      console.log('Server warmed up successfully');
    }
  } catch (error) {
    console.error('Server warm-up failed:', error.message);
  }
};