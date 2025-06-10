export interface HelpbotResponse {
  permiso: boolean;
  message: string | null;
  pagina: string | null;
  sugerencias?: string[] | null;
} 