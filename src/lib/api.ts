import axios from 'axios';
import { WeatherData, DetectionResult } from '../types';

export const api = {
  getWeather: async (lat: number, lon: number): Promise<WeatherData> => {
    const res = await axios.get(`/api/weather?lat=${lat}&lon=${lon}`);
    return res.data;
  },
  
  detectDisease: async (imageUrl: string, cropType: string): Promise<DetectionResult> => {
    const res = await axios.post('/api/detect', { imageUrl, cropType });
    return res.data;
  },
  
  getHeatmap: async (): Promise<any[]> => {
    const res = await axios.get('/api/heatmap');
    return res.data;
  }
};
