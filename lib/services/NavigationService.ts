export class NavigationService {
  /**
   * Generates Google Maps turn-by-turn directions link
   */
  static getGoogleMapsUrl(latitude: number, longitude: number, destinationName?: string): string {
    const encodedDest = destinationName 
      ? encodeURIComponent(`${destinationName}, Chennai`) 
      : `${latitude},${longitude}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedDest}`;
  }

  /**
   * Generates OpenStreetMap navigation link
   */
  static getOpenStreetMapUrl(latitude: number, longitude: number): string {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${latitude}%2C${longitude}`;
  }

  /**
   * Chooses the optimal navigation URL based on user device
   */
  static openNavigation(latitude: number, longitude: number, destinationName?: string) {
    const isApple = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
    let url: string;
    
    if (isApple) {
      url = `https://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodeURIComponent(destinationName || 'Parking')}`;
    } else {
      url = this.getGoogleMapsUrl(latitude, longitude, destinationName);
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
