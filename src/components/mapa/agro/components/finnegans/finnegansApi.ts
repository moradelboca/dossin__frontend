import axios from 'axios';

interface FinnegansTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FinnegansToken {
  access_token: string;
  token_type: string;
  expires_at: number; // timestamp when token expires
}

class FinnegansApiService {
  private token: FinnegansToken | null = null;
  private readonly baseUrl = 'https://api.teamplace.finneg.com';
  private readonly clientId = import.meta.env.VITE_FINNEGANS_CLIENT_ID;
  private readonly clientSecret = import.meta.env.VITE_FINNEGANS_CLIENT_SECRET;

  /**
   * Gets a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.isTokenValid()) {
      return this.token.access_token;
    }

    // Get a new token
    await this.refreshToken();
    return this.token!.access_token;
  }

  /**
   * Refreshes the access token
   */
  private async refreshToken(): Promise<void> {
    try {
      const url = new URL(`${this.baseUrl}/api/oauth/token`);
      url.searchParams.append('client_id', this.clientId);
      url.searchParams.append('client_secret', this.clientSecret);
      url.searchParams.append('grant_type', 'client_credentials');

      const response = await axios.get(url.toString(), {
        headers: {
          'Accept': 'text/plain',
        },
        withCredentials: false,
        responseType: 'text',
      });

      // La API devuelve el token como texto plano, no como JSON
      const tokenText = response.data;
      console.log('🔍 Respuesta de la API:', tokenText);
      
      // Crear el objeto de token manualmente
      const tokenData: FinnegansTokenResponse = {
        access_token: tokenText.trim(),
        token_type: 'Bearer',
        expires_in: 3600 // Asumir 1 hora por defecto
      };
      
      // Calculate expiration time
      const expiresAt = Date.now() + (tokenData.expires_in * 1000);
      
      this.token = {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_at: expiresAt,
      };

      // Store token in localStorage for persistence
      localStorage.setItem('finnegans_token', JSON.stringify(this.token));
      
      console.log('Finnegans token refreshed successfully');
    } catch (error) {
      console.error('Error refreshing Finnegans token:', error);
      throw error;
    }
  }

  /**
   * Checks if the current token is still valid
   */
  private isTokenValid(): boolean {
    if (!this.token) return false;
    
    // Add 5 minute buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() < (this.token.expires_at - bufferTime);
  }

  /**
   * Loads token from localStorage on initialization
   */
  loadStoredToken(): void {
    try {
      const storedToken = localStorage.getItem('finnegans_token');
      if (storedToken) {
        this.token = JSON.parse(storedToken);
        
        // Check if stored token is still valid
        if (!this.isTokenValid()) {
          this.token = null;
          localStorage.removeItem('finnegans_token');
        }
      }
    } catch (error) {
      console.error('Error loading stored Finnegans token:', error);
      this.token = null;
      localStorage.removeItem('finnegans_token');
    }
  }

  /**
   * Clears the stored token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('finnegans_token');
  }

  /**
   * Makes an authenticated request to the Finnegans API
   */
  async makeAuthenticatedRequest(endpoint: string, options: any = {}): Promise<any> {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios({
        url: `${this.baseUrl}${endpoint}`,
        method: options.method || 'GET',
        data: options.body || options.data,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        withCredentials: false,
      });

      return response;
    } catch (error: any) {
      // If token is invalid, try to refresh and retry once
      if (error.response?.status === 401) {
        this.clearToken();
        const newToken = await this.getAccessToken();
        
        const retryResponse = await axios({
          url: `${this.baseUrl}${endpoint}`,
          method: options.method || 'GET',
          data: options.body || options.data,
          headers: {
            'Authorization': `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
          withCredentials: false,
        });

        return retryResponse;
      }
      throw error;
    }
  }
}

// Create and export a singleton instance
export const finnegansApi = new FinnegansApiService();

// Initialize by loading any stored token
finnegansApi.loadStoredToken();
