import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Determina si se debe usar withCredentials basado en la URL
 * Solo usar credenciales para dominios que sabemos que están configurados correctamente
 */
function shouldUseCredentials(baseURL?: string): boolean {
  if (!baseURL) return true; // Por defecto usar credenciales para requests sin baseURL
  
  // Lista de dominios que NO deben usar credenciales (APIs externas sin CORS configurado)
  const domainsWithoutCredentials: string[] = [
    // dev.dossin.com.ar/api ahora soporta credenciales - lista vacía
  ];
  
  // Si la URL contiene alguno de estos dominios, NO usar credenciales
  if (domainsWithoutCredentials.some(domain => baseURL.includes(domain))) {
    return false;
  }
  
  // Por defecto, usar credenciales para todos los demás dominios
  // (incluyendo localhost, auth.dossin.com.ar, dev.dossin.com.ar/api, y otros backends configurados)
  return true;
}

/**
 * Crea una instancia de axios configurada con withCredentials y headers por defecto
 * @param baseURL - URL base para las peticiones
 * @param useCredentials - Si se deben usar credenciales (por defecto se detecta automáticamente)
 * @returns Instancia de axios configurada
 */
export function createAxiosInstance(baseURL: string, useCredentials?: boolean): AxiosInstance {
  const withCreds = useCredentials !== undefined ? useCredentials : shouldUseCredentials(baseURL);
  
  return axios.create({
    baseURL,
    withCredentials: withCreds,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });
}

/**
 * Función helper para hacer peticiones GET con axios configurado
 * @param url - URL completa o relativa
 * @param baseURL - URL base (opcional, si url es relativa)
 * @param config - Configuración adicional de axios
 */
export async function axiosGet<T = any>(
  url: string,
  baseURL?: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const instance = baseURL 
    ? createAxiosInstance(baseURL) 
    : axios.create({
        withCredentials: shouldUseCredentials(),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...config?.headers,
        },
      });
  
  const response = await instance.get<T>(url, config);
  return response.data;
}

/**
 * Función helper para hacer peticiones POST con axios configurado
 * @param url - URL completa o relativa
 * @param data - Datos a enviar
 * @param baseURL - URL base (opcional, si url es relativa)
 * @param config - Configuración adicional de axios
 */
export async function axiosPost<T = any>(
  url: string,
  data?: any,
  baseURL?: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const instance = baseURL 
    ? createAxiosInstance(baseURL) 
    : axios.create({
        withCredentials: shouldUseCredentials(),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...config?.headers,
        },
      });
  
  const response = await instance.post<T>(url, data, config);
  return response.data;
}

/**
 * Función helper para hacer peticiones PUT con axios configurado
 * @param url - URL completa o relativa
 * @param data - Datos a enviar
 * @param baseURL - URL base (opcional, si url es relativa)
 * @param config - Configuración adicional de axios
 */
export async function axiosPut<T = any>(
  url: string,
  data?: any,
  baseURL?: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const instance = baseURL 
    ? createAxiosInstance(baseURL) 
    : axios.create({
        withCredentials: shouldUseCredentials(),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...config?.headers,
        },
      });
  
  const response = await instance.put<T>(url, data, config);
  return response.data;
}

/**
 * Función helper para hacer peticiones DELETE con axios configurado
 * @param url - URL completa o relativa
 * @param baseURL - URL base (opcional, si url es relativa)
 * @param config - Configuración adicional de axios
 */
export async function axiosDelete<T = any>(
  url: string,
  baseURL?: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const instance = baseURL 
    ? createAxiosInstance(baseURL) 
    : axios.create({
        withCredentials: shouldUseCredentials(),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...config?.headers,
        },
      });
  
  const response = await instance.delete<T>(url, config);
  return response.data;
}

/**
 * Función helper genérica para hacer peticiones con axios configurado
 * Similar a apiCall pero usando axios
 * @param endpoint - Endpoint relativo
 * @param baseURL - URL base
 * @param options - Opciones de la petición (method, data, headers, etc.)
 */
export async function axiosRequest<T = any>(
  endpoint: string,
  baseURL: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const instance = createAxiosInstance(baseURL);
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const config: AxiosRequestConfig = {
    method: options.method || 'GET',
    headers: {
      ...options.headers,
    },
    signal: options.signal,
  };

  if (options.data && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
    const response = await instance.request<T>({
      url,
      ...config,
      data: options.data,
    });
    return response.data;
  }

  const response = await instance.request<T>({
    url,
    ...config,
  });
  return response.data;
}

