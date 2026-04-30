export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  TELUGU = 'te'
}

export enum CropType {
  TOMATO = 'Tomato',
  RICE = 'Rice',
  CORN = 'Corn',
  POTATO = 'Potato',
  WHEAT = 'Wheat'
}

export interface WeatherData {
  temp: number;
  condition: string;
  rainExpected: boolean;
  mock?: boolean;
}

export interface Recommendation {
  action: string;
  time: string;
  reason: string;
  cost: string;
  savings: string;
  risk: 'Low' | 'Medium' | 'High';
  explanation: string;
}

export interface DetectionResult {
  disease: string;
  confidence: number;
}

export interface CaseRecord {
  id?: string;
  imageUrl: string;
  cropType: string;
  soilType?: string;
  disease: string;
  confidence: number;
  recommendation: Recommendation;
  weather: WeatherData;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: any;
  userId: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
