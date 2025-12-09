export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base?: string;
  main: {
    temp: number;         // Kelvin
    feels_like?: number;  // Kelvin
    temp_min?: number;    // Kelvin
    temp_max?: number;    // Kelvin
    pressure?: number;
    humidity?: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility?: number;
  wind?: {
    speed?: number; // m/s
    deg?: number;   // degrees
  };
  clouds?: {
    all?: number; // percentage
  };
  dt: number;       // timestamp (unix)
  sys?: {
    type?: number;
    id?: number;
    country?: string;
    sunrise?: number; // timestamp
    sunset?: number;  // timestamp
  };
  timezone?: number; // seconds offset
  id?: number;
  name?: string;     // location name
  cod?: number;
}

export type WeatherArray = WeatherData[];