function stripPdfDataUrlPrefix(input: string): string {
  const trimmed = input.trim();
  const prefix = "data:application/pdf;base64,";
  if (trimmed.toLowerCase().startsWith(prefix)) {
    return trimmed.slice(prefix.length);
  }
  return trimmed;
}

function base64ToUint8Array(base64: string): Uint8Array {
  // atob expects "standard" base64, not base64url.
  const normalized = base64.replace(/[\r\n\s]/g, "");
  const binary = atob(normalized);
  const len = binary.length;
  const bytes: number[] = new Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Uint8Array(bytes);
}

export function pdfBase64ToBlob(input: string): Blob {
  if (!input || !input.trim()) {
    throw new Error("PDF base64 vacío.");
  }
  const raw = stripPdfDataUrlPrefix(input);
  try {
    const bytes = base64ToUint8Array(raw);
    // Clonamos a un ArrayBuffer clásico para evitar problemas con ArrayBufferLike
    const buffer = new ArrayBuffer(bytes.length);
    const view = new Uint8Array(buffer);
    view.set(bytes);
    return new Blob([buffer], { type: "application/pdf" });
  } catch (_e) {
    throw new Error("No se pudo convertir base64 a PDF.");
  }
}

export function arrayBufferToPdfBlob(buf: ArrayBuffer): Blob {
  if (!buf || buf.byteLength === 0) {
    throw new Error("PDF vacío.");
  }
  return new Blob([buf], { type: "application/pdf" });
}

export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

