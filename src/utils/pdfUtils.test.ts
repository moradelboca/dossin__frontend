import { describe, expect, it } from "vitest";
import { pdfBase64ToBlob } from "./pdfUtils";

describe("pdfBase64ToBlob", () => {
  it("convierte base64 puro en Blob PDF", async () => {
    const text = "hola pdf";
    const base64 = btoa(text);
    const blob = pdfBase64ToBlob(base64);

    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
    // En jsdom/Vitest, Blob#text/Response(blob) puede no estar implementado.
    expect(blob.size).toBe(text.length);
  });

  it("convierte data URL base64 en Blob PDF", async () => {
    const text = "dataurl";
    const base64 = btoa(text);
    const input = `data:application/pdf;base64,${base64}`;
    const blob = pdfBase64ToBlob(input);

    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBe(text.length);
  });

  it("lanza error con input vacío", () => {
    expect(() => pdfBase64ToBlob("   ")).toThrow();
  });

  it("lanza error con base64 inválido", () => {
    expect(() => pdfBase64ToBlob("$$$")).toThrow();
  });
});

