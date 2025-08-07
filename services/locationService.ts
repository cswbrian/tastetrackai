import { LocationData } from '@/types/discovery';
import * as Location from 'expo-location';

export class LocationService {
  static async getCurrentLocation(): Promise<LocationData> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      source: 'gps',
    };
  }

  static async requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (results.length > 0) {
        const result = results[0];
        const parts = [
          result.street,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
        
        return parts.join(', ');
      }
      
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }

  static validateLocation(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  static async getLocationFromEXIF(image: File): Promise<LocationData | null> {
    try {
      // In a real implementation, you would extract EXIF data from the image
      // For now, we'll return null as this requires additional libraries
      return null;
    } catch (error) {
      console.error('Error extracting location from EXIF:', error);
      return null;
    }
  }

  static async getLocationWithFallback(): Promise<LocationData> {
    try {
      // Try to get current GPS location first
      return await this.getCurrentLocation();
    } catch (error) {
      console.log('GPS location failed, returning default location');
      // Return a default location (could be user's last known location)
      return {
        latitude: 0,
        longitude: 0,
        source: 'none',
      };
    }
  }

  static async getLocationWithName(): Promise<LocationData & { name?: string }> {
    const location = await this.getLocationWithFallback();
    
    if (location.source !== 'none') {
      try {
        const name = await this.reverseGeocode(location.latitude, location.longitude);
        return { ...location, name };
      } catch (error) {
        console.error('Error getting location name:', error);
      }
    }
    
    return location;
  }
}
